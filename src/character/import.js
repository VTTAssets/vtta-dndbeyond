import parser from "../../src/parser/index.js";
import utils from "../utils.js";
import logger from "../logger.js";

// reference to the D&D Beyond popup
const POPUPS = {
  json: null,
  web: null,
};
const renderPopup = (type, url) => {
  if (POPUPS[type] && !POPUPS[type].close) {
    POPUPS[type].focus();
    POPUPS[type].location.href = url;
  } else {
    const ratio = window.innerWidth / window.innerHeight;
    const width = Math.round(window.innerWidth * 0.5);
    const height = Math.round(window.innerWidth * 0.5 * ratio);
    POPUPS[type] = window.open(
      url,
      "ddb_sheet_popup",
      `resizeable,scrollbars,location=no,width=${width},height=${height},toolbar=1`
    );
  }
  return true;
};

/**
 * Retrieves the character ID from a given URL, which can be one of the following:
 * - regular character sheet
 * - public sharing link
 * - direct link to the endpoint already
 * @param {string} url A given URL pointing to a character. Contains the character ID
 * @returns {string} characterId or null
 */
const getCharacterId = (url) => {
  let matches;
  const CONFIGS = [
    () => {
      const PATTERN = /.*dndbeyond\.com\/profile\/[\w-_]+\/characters\/(\d+)/;
      matches = url.match(PATTERN);
      if (matches) {
        return matches[1];
      }
      return null;
    },
    () => {
      const PATTERN = /ddb.ac\/characters\/(\d+)\/[\w-_]+/;
      matches = url.match(PATTERN);
      if (matches) {
        return matches[1];
      }
      return null;
    },
    () => {
      const PATTERN = /dndbeyond.com\/characters\/(\d+)/;
      matches = url.match(PATTERN);
      if (matches) {
        return matches[1];
      }
      return null;
    },
    () => {
      const PATTERN = /character-service.dndbeyond.com\/character\/v3\/character\/(\d+)/;
      matches = url.match(PATTERN);
      if (matches) {
        return matches[1];
      }
      return null;
    },
  ];

  return CONFIGS.map((fn) => fn(url)).reduce((prev, cur) => (!prev && cur ? cur : prev), null);
};

/**
 * Creates the Character Endpoint URL from a given character ID
 * @param {string} characterId The character ID
 * @returns {string|null} The API endpoint
 */
const getCharacterAPIEndpoint = (characterId) => {
  return characterId !== null ? `https://character-service.dndbeyond.com/character/v4/character/${characterId}` : null;
};

// a mapping of compendiums with content type
const compendiumLookup = [
  {
    type: "inventory",
    compendium: "entity-item-compendium",
  },
  {
    type: "spells",
    compendium: "entity-spell-compendium",
  },
  {
    type: "features",
    compendium: "entity-feature-compendium",
  },
  {
    type: "classes",
    compendium: "entity-class-compendium",
  },
];

const gameFolderLookup = [
  {
    type: "itemSpells",
    folder: "magic-items",
    itemType: "spell",
  },
];

const getCharacterUpdatePolicyTypes = () => {
  let itemTypes = [];
  if (game.settings.get("vtta-dndbeyond", "character-update-policy-class")) itemTypes.push("class");
  if (game.settings.get("vtta-dndbeyond", "character-update-policy-feat")) itemTypes.push("feat");
  if (game.settings.get("vtta-dndbeyond", "character-update-policy-weapon")) itemTypes.push("weapon");
  if (game.settings.get("vtta-dndbeyond", "character-update-policy-equipment")) itemTypes.push("equipment");
  if (game.settings.get("vtta-dndbeyond", "character-update-policy-inventory"))
    itemTypes = itemTypes.concat(["consumable", "tool", "loot", "backpack"]);
  if (game.settings.get("vtta-dndbeyond", "character-update-policy-spell")) itemTypes.push("spell");
  return itemTypes;
};

/**
 * Returns a combined array of all items to process, filtered by the user's selection on what to skip and what to include
 * @param {object} result object containing all character items sectioned as individual properties
 * @param {array[string]} sections an array of object properties which should be filtered
 */
const filterItemsByUserSelection = (result, sections) => {
  let items = [];
  const validItemTypes = getCharacterUpdatePolicyTypes();

  for (const section of sections) {
    items = items.concat(result[section]).filter((item) => validItemTypes.includes(item.type));
  }
  return items;
};

export default class CharacterImport extends Application {
  constructor(options, actor) {
    super(options);
    this.actor = game.actors.entities.find((a) => a.id === actor._id);
    this.migrateMetadata();
    this.actorOriginal = JSON.parse(JSON.stringify(this.actor));
    this.result = {};
  }

  migrateMetadata() {
    if (this.actor.data.flags && this.actor.data.flags.vtta && this.actor.data.flags.vtta.dndbeyond) {
      const url = this.actor.data.flags.vtta.dndbeyond.url || this.actor.data.flags.vtta.dndbeyond.roUrl;

      if (url && !this.actor.data.flags.vtta.characterId) {
        const characterId = getCharacterId(url);
        if (characterId) {
          const apiEndpointUrl = getCharacterAPIEndpoint(characterId);
          this.actor.data.flags.vtta.dndbeyond.characterId = characterId;
          this.actor.data.flags.vtta.dndbeyond.url = apiEndpointUrl;
        } else {
          // clear the url, because it's malformed anyway
          this.actor.data.flags.vtta.dndbeyond.url = null;
        }
      }
    }
  }

  /**
   * Define default options for the PartySummary application
   */
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.title = game.i18n.localize("vtta-dndbeyond.module-name");
    options.template = "modules/vtta-dndbeyond/src/character/import.handlebars";
    options.width = 800;
    options.height = "auto";
    options.classes = ["vtta"];
    return options;
  }

  static showCurrentTask(html, title, message = null, isError = false) {
    let element = $(html).find(".task-name");
    element.html(`<h2 ${isError ? " style='color:red'" : ""}>${title}</h2>${message ? `<p>${message}</p>` : ""}`);
    $(html).parent().parent().css("height", "auto");
  }

  static async copyFlagGroup(flagGroup, originalItem, targetItem) {
    if (targetItem.flags === undefined) targetItem.flags = {};
    if (originalItem.flags && !!originalItem.flags[flagGroup]) {
      utils.log(`Copying ${flagGroup} for ${originalItem.name}`);
      targetItem.flags[flagGroup] = originalItem.flags[flagGroup];
    }
  }

  /**
   * Copies across some flags for existing item
   * @param {*} items
   */
  static async copySupportedItemFlags(originalItem, item) {
    CharacterImport.copyFlagGroup("dynamiceffects", originalItem, item);
    CharacterImport.copyFlagGroup("maestro", originalItem, item);
    CharacterImport.copyFlagGroup("mess", originalItem, item);
  }

  /**
   * Loops through a characters items and updates flags
   * @param {*} items
   */
  async copySupportedCharacterItemFlags(items) {
    items.forEach((item) => {
      const originalItem = this.actorOriginal.items.find(
        (originalItem) => item.name === originalItem.name && item.type === originalItem.type
      );
      if (originalItem) {
        CharacterImport.copySupportedItemFlags(originalItem, item);
      }
    });
  }

  /**
   * Removes items
   * @param {*} items
   * @param {*} itemsToRemove
   */
  static async removeItems(items, itemsToRemove) {
    const newItems = await items.filter(
      (item) =>
        !itemsToRemove.some((originalItem) => item.name === originalItem.name && item.type === originalItem.type)
    );
    return newItems;
  }

  async importItems(items) {
    await this.actor.createEmbeddedEntity("OwnedItem", items, {
      displaySheet: false,
    });
  }

  /**
   * gets items from compendium
   * @param {*} items
   */
  static async getCompendiumItems(items, type) {
    const compendiumName = compendiumLookup.find((c) => c.type == type).compendium;
    const compendiumLabel = game.settings.get("vtta-dndbeyond", compendiumName);
    const compendium = await game.packs.find((pack) => pack.collection === compendiumLabel);
    const index = await compendium.getIndex();

    const results = index
      .filter((i) => items.some((item) => i.name === item.name))
      .map(async (i) => {
        let item = await compendium.getEntry(i._id);
        delete item["_id"];
        return item;
      });
    return Promise.all(results);
  }

  /**
   * Updates a compendium, provide the type.
   * @param {*} type
   */
  async updateCompendium(type) {
    const importPolicy = game.settings.get("vtta-dndbeyond", "entity-import-policy");
    const compendiumName = compendiumLookup.find((c) => c.type == type).compendium;
    const compendiumLabel = game.settings.get("vtta-dndbeyond", compendiumName);
    const compendium = await game.packs.find((pack) => pack.collection === compendiumLabel);
    compendium.locked = false;

    if (game.user.isGM && importPolicy !== 2) {
      const initialIndex = await compendium.getIndex();
      // remove duplicate items based on name and type
      const compendiumItems = [
        ...new Map(this.result[type].map((item) => [item["name"] + item["type"], item])).values(),
      ];

      const updateItems = async () => {
        if (importPolicy === 0) {
          return Promise.all(
            compendiumItems
              .filter((item) => initialIndex.some((idx) => idx.name === item.name))
              .map(async (item) => {
                const entry = await compendium.index.find((idx) => idx.name === item.name);
                const existing = await compendium.getEntity(entry._id);
                item._id = existing._id;
                await CharacterImport.copySupportedItemFlags(existing, item);
                await compendium.updateEntity(item);
                return item;
              })
          );
        } else {
          return Promise.all([]);
        }
      };

      const createItems = async () => {
        return Promise.all(
          compendiumItems
            .filter((item) => !initialIndex.some((idx) => idx.name === item.name))
            .map(async (item) => {
              const newItem = await Item.create(item, {
                temporary: true,
                displaySheet: false,
              });
              await compendium.importEntity(newItem);
              return newItem;
            })
        );
      };

      await updateItems();
      await createItems();

      const updatedIndex = await compendium.getIndex();
      const getItems = async () => {
        return Promise.all(
          this.result[type].map(async (item) => {
            const searchResult = await updatedIndex.find((idx) => idx.name === item.name);
            if (!searchResult) {
              logger.debug(`Couldn't find ${item.name} in the compendium`);
              return null;
            } else {
              const entity = compendium.getEntity(searchResult._id);
              return entity;
            }
          })
        );
      };

      // lets generate our compendium info like id, pack and img for use
      // by things like magicitems
      const items = getItems().then((entries) => {
        const results = entries.map((result) => {
          return {
            _id: result._id,
            id: result._id,
            pack: compendium.collection,
            img: result.img,
            name: result.name,
          };
        });
        return results;
      });

      return items;
    }
    return [];
  }

  /**
   * Updates game folder items
   * @param {*} type
   */
  async updateFolderItems(type) {
    const folderLookup = gameFolderLookup.find((c) => c.type == type);
    const magicItemsFolder = await utils.getFolder(folderLookup.folder);
    const existingItems = await game.items.entities.filter(
      (item) => item.type === folderLookup.itemType && item.data.folder === magicItemsFolder._id
    );

    // update or create folder items
    const updateItems = async () => {
      return Promise.all(
        this.result[type]
          .filter((item) => existingItems.some((idx) => idx.name === item.name))
          .map(async (item) => {
            const existingItem = await existingItems.find((existing) => item.name === existing.name);
            item._id = existingItem._id;
            await CharacterImport.copySupportedItemFlags(existingItem, item);
            await Item.update(item);
            return item;
          })
      );
    };

    const createItems = async () => {
      return Promise.all(
        this.result[type]
          .filter((item) => !existingItems.some((idx) => idx.name === item.name))
          .map(async (item) => {
            if (!game.user.can("ITEM_CREATE")) {
              ui.notifications.warn(`Cannot create ${folderLookup.type} ${item.name} for ${type}`);
            } else {
              item.folder = magicItemsFolder._id;
              await Item.create(item);
            }
            return item;
          })
      );
    };

    await updateItems();
    await createItems();

    // lets generate our compendium info like id, pack and img for use
    // by things like magicitems
    const items = Promise.all(
      game.items.entities
        .filter((item) => item.type === folderLookup.itemType && item.data.folder === magicItemsFolder._id)
        .map((result) => {
          return {
            _id: result._id,
            id: result._id,
            pack: "world",
            img: result.img,
            name: result.name,
          };
        })
    );
    return items;
  }

  /**
   * Deletes items from the inventory bases on which sections a user wants to update
   * Possible sections:
   * - class
   * - feat
   * - weapon
   * - equipment
   * - inventory: consumable, loot, tool and backpack
   * - spell
   */
  async clearItemsByUserSelection() {
    const invalidItemTypes = getCharacterUpdatePolicyTypes();

    // collect all items belonging to one of those inventory item categories
    let ownedItems = this.actor.getEmbeddedCollection("OwnedItem");
    let toRemove = ownedItems.filter((item) => invalidItemTypes.includes(item.type)).map((item) => item._id);
    await this.actor.deleteEmbeddedEntity("OwnedItem", toRemove);
    return toRemove;
  }

  async updateImage(html, data) {
    // updating the image?
    let imagePath = this.actor.img;
    if (
      game.user.isTrusted &&
      imagePath.indexOf("mystery-man") !== -1 &&
      data.character.avatarUrl &&
      data.character.avatarUrl !== ""
    ) {
      CharacterImport.showCurrentTask(html, "Uploading avatar image");
      let filename = data.character.name
        .replace(/[^a-zA-Z]/g, "-")
        .replace(/-+/g, "-")
        .trim();

      let uploadDirectory = game.settings.get("vtta-dndbeyond", "image-upload-directory").replace(/^\/|\/$/g, "");

      imagePath = await utils.uploadImage(data.character.avatarUrl, uploadDirectory, filename);
      this.result.character.img = imagePath;
    }
  }

  /**
   * This adds magic item spells to a world,
   */
  async updateWorldItems() {
    const itemSpells = await this.updateFolderItems("itemSpells");
    // scan the inventory for each item with spells and copy the imported data over
    this.result.inventory.forEach((item) => {
      if (item.flags.magicitems.spells) {
        for (let [i, spell] of Object.entries(item.flags.magicitems.spells)) {
          const itemSpell = itemSpells.find((item) => item.name === spell.name);
          if (itemSpell) {
            for (const [key, value] of Object.entries(itemSpell)) {
              item.flags.magicitems.spells[i][key] = value;
            }
          } else if (!game.user.can("ITEM_CREATE")) {
            ui.notifications.warn(`Magic Item ${item.name} cannot be enriched because of lacking player permissions`);
          }
        }
      }
    });
  }

  async showErrorMessage(html, error) {
    logger.info("%c #### PLEASE PASTE TO https://discord.gg/YEnjUHd #####", "color: #ff0000");
    logger.info("%c #### ", "color: #ff0000");
    logger.info("%c #### --------------- COPY BELOW --------------- #####", "color: #ff0000");
    if (
      this.actor.data.flags.vtta &&
      this.actor.data.flags.vtta.dndbeyond &&
      this.actor.data.flags.vtta.dndbeyond.url
    ) {
      const characterId = this.actor.data.flags.vtta.dndbeyond.url.split("/").pop();
      if (characterId) {
        const jsonUrl = "https://character-service.dndbeyond.com/character/v4/character/" + characterId;
        logger.info("%c **Character JSON          :** " + jsonUrl, "color: #ff0000");
      }
    }
    logger.info(`%c **Foundry version         :** ${game.data.version}`, "color: #ff0000");
    logger.info(`%c **DND5e version           :** ${game.system.data.version}`, "color: #ff0000");
    const moduleVersion = game.modules.get("vtta-dndbeyond").data.version;
    logger.info(`%c **VTTA D&D Beyond version :** ${moduleVersion}`, "color: #ff0000");
    logger.info(error);
    logger.info("%c #### --------------- COPY ABOVE --------------- #####", "color: #ff0000");
    CharacterImport.showCurrentTask(
      html,
      "I guess you are special!",
      `We had trouble understanding this character. But you can help us to improve!</p>
      <p>Please</p>
      <ul>
        <li>open the console with F12</li>
        <li>search for a block of text starting with <b>#### PLEASE PASTE TO ...</b></li>
        <li>Copy the designated lines and submit it to the Discord channel <a href='https://discord.gg/YEnjUHd'>#parsing-errors</a></li></ul> Thanks!`,
      true
    );
  }

  /* -------------------------------------------- */

  getData() {
    const importPolicies = [
      {
        name: "class",
        isChecked: game.settings.get("vtta-dndbeyond", "character-update-policy-class"),
        description: "Classes",
      },
      {
        name: "feat",
        isChecked: game.settings.get("vtta-dndbeyond", "character-update-policy-feat"),
        description: "Features",
      },
      {
        name: "weapon",
        isChecked: game.settings.get("vtta-dndbeyond", "character-update-policy-weapon"),
        description: "Weapons",
      },
      {
        name: "equipment",
        isChecked: game.settings.get("vtta-dndbeyond", "character-update-policy-equipment"),
        description: "Equipment",
      },
      {
        name: "inventory",
        isChecked: game.settings.get("vtta-dndbeyond", "character-update-policy-inventory"),
        description: "Other inventory items",
      },
      {
        name: "currency",
        isChecked: game.settings.get("vtta-dndbeyond", "character-update-policy-currency"),
        description: "Currency",
      },
      {
        name: "spell",
        isChecked: game.settings.get("vtta-dndbeyond", "character-update-policy-spell"),
        description: "Spells",
      },
    ];

    const importConfig = [
      {
        name: "new",
        isChecked: game.settings.get("vtta-dndbeyond", "character-update-policy-new"),
        description: "Import new items only. Doesn't delete or update existing items in Foundry.",
      },
      {
        name: "use-existing",
        isChecked: game.settings.get("vtta-dndbeyond", "character-update-policy-use-existing"),
        description: "Use existing items from the compendium, rather than recreating.",
      },
    ];

    return {
      actor: this.actor,
      importPolicies: importPolicies,
      importConfig: importConfig,
    };
  }

  /* -------------------------------------------- */

  loadCharacterData() {
    return new Promise((resolve, reject) => {
      const host = "https://ddb-character.vttassets.com";
      // const host = "http://localhost:3000";
      fetch(`${host}/${this.actor.data.flags.vtta.dndbeyond.characterId}`)
        .then((response) => response.json())
        .then((data) => resolve(data))
        .catch((error) => reject(error));
    });
  }

  /* eslint-disable class-methods-use-this */
  getAlwaysPreparedSpellsOnly(data) {
    return new Promise((resolve, reject) => {
      const host = "https://ddb-character.vttassets.com";
      // const host = "http://localhost:3000";
      fetch(`${host}/alwaysPreparedSpells`, {
        method: "POST",
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data), // body data type must match "Content-Type" header
      })
        .then((response) => response.json())
        .then((data) => resolve(data))
        .catch((error) => reject(error));
    });
  }
  /* eslint-enable class-methods-use-this */

  activateListeners(html) {
    // watch the change of the import-policy-selector checkboxes
    $(html)
      .find('.import-policy input[type="checkbox"]')
      .on("change", (event) => {
        game.settings.set(
          "vtta-dndbeyond",
          "character-update-policy-" + event.currentTarget.dataset.section,
          event.currentTarget.checked
        );
      });

    $(html)
      .find('.import-config input[type="checkbox"]')
      .on("change", (event) => {
        game.settings.set(
          "vtta-dndbeyond",
          "character-update-policy-" + event.currentTarget.dataset.section,
          event.currentTarget.checked
        );
      });

    $(html)
      .find("#json")
      .on("paste", async (event) => {
        const getSpellLevelAccess = (cls, casterLevel) => {
          const spellSlots = cls.definition.spellRules.levelSpellSlots[casterLevel];
          const spellLevelAccess = spellSlots.reduce(
            (count, numSpellSlots) => (numSpellSlots > 0 ? count + 1 : count),
            0
          );
          return spellLevelAccess;
        };
        const getCasterLevel = (cls, isMultiClassing) => {
          let casterLevel = 0;
          if (isMultiClassing) {
            // get the casting level if the character is a multiclassed spellcaster
            if (cls.definition.spellRules && cls.definition.spellRules.multiClassSpellSlotDivisor) {
              casterLevel = Math.floor(cls.level / cls.definition.spellRules.multiClassSpellSlotDivisor);
            }
          } else {
            casterLevel = cls.level;
          }

          return casterLevel;
        };
        const getClassIds = (data) => {
          const isMultiClassing = data.classes.length > 1;

          return data.classes.map((characterClass) => {
            return {
              characterClassId: characterClass.id,
              name:
                characterClass.subclassDefinition && characterClass.subclassDefinition.name
                  ? characterClass.definition.name + `(${characterClass.subclassDefinition.name})`
                  : characterClass.definition.name,
              id:
                characterClass.subclassDefinition && characterClass.subclassDefinition.id
                  ? characterClass.subclassDefinition.id
                  : characterClass.definition.id,
              level: getCasterLevel(characterClass, isMultiClassing),
              spellLevelAccess: getSpellLevelAccess(characterClass, getCasterLevel(characterClass)),
              spells: [],
            };
          });
        };

        event.preventDefault();
        var pasteData = event.originalEvent.clipboardData.getData("text");

        let data = undefined;
        try {
          data = JSON.parse(pasteData);
        } catch (error) {
          if (error.message === "Unexpected end of JSON input") {
            CharacterImport.showCurrentTask(
              html,
              "JSON invalid",
              "I could not parse your JSON data because it was cut off. Make sure to wait for the page to stop loading before copying the data into your clipboard.",
              true
            );
          } else {
            CharacterImport.showCurrentTask(html, "JSON invalid", error.message, true);
          }
        }

        // check for malformed data structures
        if (data.message !== undefined && data.success !== undefined && data.data !== undefined) {
          CharacterImport.showCurrentTask(html, data.message, null, data.success);
          if (data.success === false) return;

          // remove all unnecessary object structure from now on
          data = data.data;

          // get the character info from the paste
          let classInfo = getClassIds(data);
          logger.verbose(classInfo);

          this.getAlwaysPreparedSpellsOnly(classInfo)
            .then((result) => {
              if (result.success && result.data) {
                CharacterImport.showCurrentTask(
                  html,
                  "Always prepared spells received, adding them to your import",
                  null,
                  false
                );

                // insert the data into the main import
                classInfo = result.data;

                data.classSpells = data.classSpells.map((classSpells) => {
                  // find always prepared spells in the results
                  const alwaysPreparedSpells = classInfo.find(
                    (classInfo) => classInfo.characterClassId === classSpells.characterClassId
                  );

                  if (alwaysPreparedSpells) {
                    alwaysPreparedSpells.spells.forEach((spell) => {
                      if (classSpells.spells.find((s) => s.definition.name === spell.definition.name) === undefined) {
                        logger.verbose("Adding new always prepared spell: " + spell.definition.name);
                        classSpells.spells.push(spell);
                      } else {
                        logger.verbose("Already in list: " + spell.definition.name);
                      }
                    });
                  }
                  return classSpells;
                });

                // begin parsing the character data
                try {
                  this.parseCharacterData(html, data);
                } catch (error) {
                  CharacterImport.showCurrentTask(
                    html,
                    "Error in parsing character data",
                    error,
                    true
                  );
                  throw error;
                }
              }
            })
            .catch(() => {
              CharacterImport.showCurrentTask(
                html,
                "Error during fetching always prepared spells",
                "We will continue without them, you might be missing some spells in that import",
                true
              );
            });
        } else {
          CharacterImport.showCurrentTask(html, "Malformed data received, please try again", null, true);
        }
      });

    $(html)
      .find("#dndbeyond-character-import-start")
      .on("click", async (event) => {
        // retrieve the character data from the proxy
        event.preventDefault();

        let data = undefined;
        try {
          CharacterImport.showCurrentTask(html, "Loading Character data");
          const characterData = await this.loadCharacterData();
          logger.debug("import.js loadCharacterData result", characterData);
          if (characterData.success) {
            data = { character: characterData.data };
            // begin parsing the character data
            await this.parseCharacterData(html, data);
            CharacterImport.showCurrentTask(html, "Loading Character data", "Done.", false);
            this.close();
          } else {
            CharacterImport.showCurrentTask(html, characterData.message, null, true);
            return false;
          }
        } catch (error) {
          switch (error) {
            case "Forbidden":
              CharacterImport.showCurrentTask(html, "Error retrieving Character", error, true);
              break;
            default:
              CharacterImport.showCurrentTask(html, "Unknown error retrieving Character", error, true);
              break;
          }
          return false;
        }

        return true;
      });

    $(html)
      .find("input[name=dndbeyond-url]")
      .on("input", async (event) => {
        let URL = event.target.value;
        const characterId = getCharacterId(URL);

        if (characterId) {
          const apiEndpointUrl = getCharacterAPIEndpoint(characterId);
          $(html)
            .find(".dndbeyond-url-status i")
            .replaceWith('<i class="fas fa-check-circle" style="color: green"></i>');
          $(html).find("span.dndbeyond-character-id").text(characterId);
          $(html).find("#dndbeyond-character-import-start").prop("disabled", false);
          $(html).find("#open-dndbeyond-url").prop("disabled", false);

          CharacterImport.showCurrentTask(html, "Saving reference");
          await this.actor.update({
            flags: {
              vtta: {
                dndbeyond: {
                  url: apiEndpointUrl,
                  characterId: characterId,
                },
              },
            },
          });
          CharacterImport.showCurrentTask(html, "Status");
        } else {
          CharacterImport.showCurrentTask(
            html,
            "URL format incorrect",
            "That seems not to be the URL we expected...",
            true
          );
          $(html)
            .find(".dndbeyond-url-status i")
            .replaceWith('<i class="fas fa-exclamation-triangle" style="color:red"></i>');
        }
      });

    $(html)
      .find("#open-dndbeyond-url")
      .on("click", () => {
        try {
          const characterId = this.actor.data.flags.vtta.dndbeyond.characterId;
          const apiEndpointUrl = `https://ddb-character.vttassets.com/${characterId}`; // getCharacterAPIEndpoint(characterId);
          renderPopup("json", apiEndpointUrl);
        } catch (error) {
          CharacterImport.showCurrentTask(html, "Error opening JSON URL", error, true);
        }
      });
  }

  async parseCharacterData(html, data) {
    // construct the expected { character: {...} } object
    data = data.character === undefined ? { character: data } : data;
    this.result = parser.parseJson(data);

    utils.log("Parsing finished");
    utils.log(this.result);

    // is magicitems installed
    const magicItemsInstalled = !!game.modules.get("magicitems");

    await this.updateImage(html, data);

    // basic import
    CharacterImport.showCurrentTask(html, "Updating basic character information");
    await this.actor.update(this.result.character);

    // clear items
    const importKeepExistingActorItems = game.settings.get("vtta-dndbeyond", "character-update-policy-new");
    if (!importKeepExistingActorItems) {
      CharacterImport.showCurrentTask(html, "Clearing inventory");
      await this.clearItemsByUserSelection();
    }

    // manage updates of basic character data more intelligently
    if (!game.settings.get("vtta-dndbeyond", "character-update-policy-currency")) {
      // revert currency if user didn't select to update it
      this.actor.data.data.currency = this.actorOriginal.data.currency;
    }

    // store all spells in the folder specific for Dynamic Items
    if (magicItemsInstalled && this.result.itemSpells && Array.isArray(this.result.itemSpells)) {
      CharacterImport.showCurrentTask(html, "Preparing magicitem spells");
      await this.updateWorldItems();
    }

    // Update compendium packs with spells and inventory
    CharacterImport.showCurrentTask(html, "Updating compendium(s)");
    this.updateCompendium("inventory");
    this.updateCompendium("spells");
    this.updateCompendium("features");
    // Issue #263 hotfix - remove Classes Compendium (for now)
    // this.updateCompendium("classes");

    // Adding all items to the actor
    const FILTER_SECTIONS = ["classes", "features", "actions", "inventory", "spells"];
    let items = filterItemsByUserSelection(this.result, FILTER_SECTIONS);

    // If there is no magicitems module fall back to importing the magic
    // item spells as normal spells fo the character
    if (!magicItemsInstalled) {
      items.push(this.result.itemSpells.filter((item) => item.flags.vtta.dndbeyond.active === true));
      items = items.flat();
    }

    if (importKeepExistingActorItems) {
      // removed existing items from those to be imported
      items = await CharacterImport.removeItems(items, this.actorOriginal.items);
    }

    let compendiumItems = [];
    const useExistingCompendiumItems = game.settings.get("vtta-dndbeyond", "character-update-policy-use-existing");

    if (useExistingCompendiumItems) {
      utils.log("Removing compendium items");
      const compendiumInventoryItems = await CharacterImport.getCompendiumItems(items, "inventory");
      const compendiumSpellItems = await CharacterImport.getCompendiumItems(items, "spells");
      const compendiumFeatureItems = await CharacterImport.getCompendiumItems(items, "features");
      // Issue #263 hotfix - remove Classes Compendium (for now)
      // const compendiumClassItems = await CharacterImport.getCompendiumItems(items, "classes");

      compendiumItems = compendiumItems.concat(
        compendiumInventoryItems,
        compendiumSpellItems,
        compendiumFeatureItems
        // Issue #263 hotfix - remove Classes Compendium (for now)
        // compendiumClassItems,
      );
      // removed existing items from those to be imported
      items = await CharacterImport.removeItems(items, compendiumItems);
    }

    // if we still have items to add, add them
    if (items.length > 0) {
      CharacterImport.showCurrentTask(html, "Copying existing flags");
      await this.copySupportedCharacterItemFlags(items);

      utils.log("Character items", "character");
      utils.log(items, "character");

      CharacterImport.showCurrentTask(html, "Adding items to character");
      this.importItems(items);
    }

    // now import any compendium items that we matched
    if (useExistingCompendiumItems) {
      CharacterImport.showCurrentTask(html, "Importing compendium items");
      utils.log("Importing compendium items");
      this.importItems(compendiumItems);
    }

    // We loop back over the spell slots to update them to our computed
    // available value as per DDB.
    CharacterImport.showCurrentTask(html, "Updating spell slots");
    for (const [type, info] of Object.entries(this.result.character.data.spells)) {
      this.actor.update({
        [`data.spells.${type}.value`]: parseInt(info.value),
      });
    }

    this.close();
  }
}

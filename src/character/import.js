import parser from "../../src/parser/index.js";
import utils from "../utils.js";

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
    this.actorOriginal = JSON.parse(JSON.stringify(this.actor));
    this.result = {};
  }

  /**
   * Define default options for the PartySummary application
   */
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.title = game.i18n.localize("vtta-dndbeyond.module-name");
    options.template = "modules/vtta-dndbeyond/src/character/import.hbs";
    options.width = 600;
    options.height = "auto";
    options.classes = ["vtta"];
    return options;
  }

  static showCurrentTask(html, title, message = null, isError = false) {
    let element = $(html).find(".task-name");
    element.html(`<h2 ${isError ? " class='error'" : ""}>${title}</h2>${message ? `<p>${message}</p>` : ""}`);
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
   * Updates a compendium, provide the type.
   * @param {*} type
   */
  async updateCompendium(type) {
    const importPolicy = game.settings.get("vtta-dndbeyond", "entity-import-policy");
    const compendiumName = compendiumLookup.find((c) => c.type == type).compendium;
    const compendiumLabel = game.settings.get("vtta-dndbeyond", compendiumName);
    const compendium = await game.packs.find((pack) => pack.collection === compendiumLabel);

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
              utils.log(`Couldn't find ${item.name} in the compendium`);
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
        name: "spell",
        isChecked: game.settings.get("vtta-dndbeyond", "character-update-policy-spell"),
        description: "Spells",
      },
      {
        name: "new",
        isChecked: game.settings.get("vtta-dndbeyond", "character-update-policy-new"),
        description: "Import new only (no delete or update)",
      },
    ];

    return {
      actor: this.actor,
      importPolicies: importPolicies,
    };
  }

  /* -------------------------------------------- */

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
      .find("#json")
      .on("paste", async (event) => {
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

        // check if the character is set to public
        if (!data.success) {
          CharacterImport.showCurrentTask(
            html,
            "JSON retrieval failed",
            `D&D Beyond's server states that it could not provide the JSON for your character. The most likely cause is that the <b>Character Privacy</b> is set to <b>Private</b></p>
              <p>You can change that setting if you open the Character Builder at dndbeyond.com, go to the <b>Home</b> section at the very left and then scroll down all the way to the bottom.</p>
              <p><img src="modules/vtta-dndbeyond/img/dndbeyond-character-builder.png"/></p>
              `,
            true
          );
          return false;
        }

        // the expected data structure is
        // data: {
        //    character: {...}
        // }
        if (!Object.hasOwnProperty.call(data, "character")) {
          if (Object.hasOwnProperty.call(data, "data")) {
            data.character = data.data;
          } else {
            data.character = data;
          }
        }

        try {
          this.result = parser.parseJson(data);
        } catch (error) {
          console.log("%c #### PLEASE PASTE TO https://discord.gg/YEnjUHd #####", "color: #ff0000"); // eslint-disable-line no-console
          console.log("%c #### ", "color: #ff0000"); // eslint-disable-line no-console
          console.log("%c #### --------------- COPY BELOW --------------- #####", "color: #ff0000"); // eslint-disable-line no-console
          if (
            this.actor.data.flags.vtta &&
            this.actor.data.flags.vtta.dndbeyond &&
            this.actor.data.flags.vtta.dndbeyond.url
          ) {
            const characterId = this.actor.data.flags.vtta.dndbeyond.url.split("/").pop();
            if (characterId) {
              const jsonUrl = "https://character-service.dndbeyond.com/character/v3/character/" + characterId;
              console.log("%c **Character JSON          :** " + jsonUrl, "color: #ff0000"); // eslint-disable-line no-console
            }
          }
          console.log(`%c **Foundry version         :** ${game.data.version}`, "color: #ff0000"); // eslint-disable-line no-console
          console.log(`%c **DND5e version           :** ${game.system.data.version}`, "color: #ff0000"); // eslint-disable-line no-console
          // eslint-disable-line no-console
          const moduleVersion = game.modules.get("vtta-dndbeyond").data.version;
          console.log(`%c **VTTA D&D Beyond version :** ${moduleVersion}`, "color: #ff0000"); // eslint-disable-line no-console
          console.log(error); // eslint-disable-line no-console
          console.log("%c #### --------------- COPY ABOVE --------------- #####", "color: #ff0000"); // eslint-disable-line no-console
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
          return false;
        }

        utils.log("Parsing finished");
        utils.log(this.result);

        // is magicitems installed
        const magicItemsInstalled = !!game.modules.get("magicitems");

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

        // basic import
        CharacterImport.showCurrentTask(html, "Updating basic character information");
        await this.actor.update(this.result.character);

        // // clear items
        CharacterImport.showCurrentTask(html, "Clearing inventory");
        await this.clearItemsByUserSelection();

        // store all spells in the folder specific for Dynamic Items
        if (magicItemsInstalled && this.result.itemSpells && Array.isArray(this.result.itemSpells)) {
          CharacterImport.showCurrentTask(html, "Preparing magicitem spells");
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
                  ui.notifications.warn(
                    `Magic Item ${item.name} cannot be enriched because of lacking player permissions`
                  );
                }
              }
            }
          });
        }

        // Update compendium packs with spells and inventory
        CharacterImport.showCurrentTask(html, "Updating compendium(s)");
        this.updateCompendium("inventory");
        this.updateCompendium("spells");

        // Adding all items to the actor
        const FILTER_SECTIONS = ["classes", "features", "actions", "inventory", "spells"];
        let items = filterItemsByUserSelection(this.result, FILTER_SECTIONS);

        // If there is no magicitems module fall back to importing the magic
        // item spells as normal spells fo the character
        if (!magicItemsInstalled) {
          items.push(this.result.itemSpells.filter((item) => item.flags.vtta.dndbeyond.active === true));
          items = items.flat();
        }

        CharacterImport.showCurrentTask(html, "Copying existing flags");
        await this.copySupportedCharacterItemFlags(items);

        utils.log("Character items", "character");
        utils.log(items, "character");

        CharacterImport.showCurrentTask(html, "Adding items to character");
        await this.actor.createEmbeddedEntity("OwnedItem", items, {
          displaySheet: false,
        });

        // We loop back over the spell slots to update them to our computed
        // available value as per DDB.
        CharacterImport.showCurrentTask(html, "Updating spell slots");
        for (const [type, info] of Object.entries(this.result.character.data.spells)) {
          this.actor.update({
            [`data.spells.${type}.value`]: parseInt(info.value),
          });
        }

        this.close();
        return true;
      });

    $(html)
      .find("input[name=dndbeyond-url]")
      .on("input", async (event) => {
        let matches = event.target.value.match(/.*(dndbeyond\.com\/profile\/[\w-_]+\/characters\/\d+)/);
        if (matches) {
          $(html)
            .find(".dndbeyond-url-status i")
            .replaceWith('<i class="fas fa-check-circle" style="color: green"></i>');
          CharacterImport.showCurrentTask(html, "Saving reference");
          await this.actor.update({
            flags: {
              vtta: {
                dndbeyond: {
                  url: "https://www." + matches[1],
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
  }
}

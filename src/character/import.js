import md5 from "../libs/md5.js";
import parser from "../../src/parser/index.js";
import utils from "../utils.js";

// a mapping of compendiums with content type
const compendiumLookup = [{
    type: "inventory",
    compendium: "entity-item-compendium",
  },
  {
    type: "spells",
    compendium: "entity-spell-compendium",
  },
];

const gameFolderLookup = [{
  type: "itemSpells",
  folder: "magic-items",
}, ];

/**
 * Returns a combined array of all items to process, filtered by the user's selection on what to skip and what to include
 * @param {object} result object containing all character items sectioned as individual properties
 */
const filterItemsByUserSelection = result => {
  let items = [];

  let validItemTypes = [];
  if (game.settings.get("vtta-dndbeyond", "character-update-policy-class"))
    validItemTypes.push("class");
  if (game.settings.get("vtta-dndbeyond", "character-update-policy-feat"))
    validItemTypes.push("feat");
  if (game.settings.get("vtta-dndbeyond", "character-update-policy-weapon"))
    validItemTypes.push("weapon");
  if (game.settings.get("vtta-dndbeyond", "character-update-policy-equipment"))
    validItemTypes.push("equipment");
  if (game.settings.get("vtta-dndbeyond", "character-update-policy-inventory"))
    validItemTypes = validItemTypes.concat([
      "consumable",
      "tool",
      "loot",
      "backpack",
    ]);
  if (game.settings.get("vtta-dndbeyond", "character-update-policy-spell"))
    validItemTypes.push("spell");

  let sections = ["classes", "features", "actions", "inventory", "spells"];
  for (const section of sections) {
    items = items
      .concat(result[section])
      .filter(item => validItemTypes.includes(item.type));
  }
  return items;
};

export default class CharacterImport extends Application {
  constructor(options, actor) {
    super(options);
    this.actor = game.actors.entities.find(a => a.id === actor._id);
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

  showCurrentTask(html, title, message = null, isError = false) {
    let element = $(html).find(".task-name");
    element.html(
      `<h2 ${isError ? " class='error'" : ""}>${title}</h2>${
        message ? `<p>${message}</p>` : ""
      }`
    );
    $(html).parent().parent().css("height", "auto");
  }

  async copyFlags(flagGroup, originalItem, targetItem) {
    if (targetItem.flags === undefined) targetItem.flags = {};
    if (!!originalItem.flags && !!originalItem.flags[flagGroup]) {
      console.log(`Copying ${flagGroup} for ${originalItem.name}`);
      targetItem.flags[flagGroup] = originalItem.flags.dynamiceffects;
    }
  }

  /**
   * Coies across some flags for existing items
   * @param {*} items
   */
  async copySupportedItemFlags(items) {
    items.forEach(item => {
      const originalItem = this.actorOriginal.items.find(
        originalItem =>
        item.name === originalItem.name && item.type === originalItem.type
      );
      if (!!originalItem) {
        this.copyFlags("dynamiceffects", originalItem, item);
      }
    });
  }

  /**
   * Updates a compendium, provide the type.
   * @param {*} type
   */
  async updateCompendium(type) {
    let importPolicy = game.settings.get(
      "vtta-dndbeyond",
      "entity-import-policy"
    );
    let items = [];

    if (game.user.isGM && importPolicy !== 2) {
      // we are updating inventory and spells only

      // compendiumLookup
      let compendiumName = compendiumLookup.find(c => c.type == type)
        .compendium;
      let compendiumLabel = game.settings.get("vtta-dndbeyond", compendiumName);
      let compendium = await game.packs.find(
        pack => pack.collection === compendiumLabel
      );

      if (compendium) {
        const index = await compendium.getIndex();

        for (let i = 0; i < this.result[type].length; i++) {
          const item = this.result[type][i];
          let result;
          utils.log(
            `Processing item ${item.name} in compendium ${compendiumLabel}`,
            "character"
          );

          // search the compendium for this item
          let searchResult = index.find(i => i.name === item.name);
          if (searchResult && importPolicy === 0) {
            item._id = searchResult._id;
            // update seems to return an array, and without our img
            await compendium.updateEntity(item);
            // sp lets fetch afterwards!
            result = await compendium.getEntity(searchResult._id);
          } else if (searchResult) {
            result = await compendium.getEntity(searchResult._id);
          } else if (!searchResult) {
            // create the item first
            const newItem = await Item.create(item, {
              temporary: true,
              displaySheet: false,
            });
            result = await compendium.importEntity(newItem);
          }

          const itemUpdate = {
            _id: result._id,
            id: result._id,
            pack: compendium.collection,
            img: result.img,
            name: item.name,
          };
          items.push(itemUpdate);
        }
      }
    }
    return items;
  }

  /**
   * Updates game folder items
   * @param {*} type
   */
  async updateFolderItems(type) {
    let items = [];

    // compendiumLookup
    const folderName = gameFolderLookup.find(c => c.type == type).folder;
    const magicItemsFolder = await utils.getFolder(folderName);

    for (let spell of this.result.itemSpells) {
      let existingSpell = game.items.entities.find(
        item =>
        item.name === spell.name &&
        item.type === "spell" &&
        item.data.folder === magicItemsFolder._id
      );
      if (existingSpell === undefined) {
        if (!game.user.can("ITEM_CREATE")) {
          ui.notifications.warn(
            `Cannot create spell ${spell.name} for Magic Items items`
          );
        } else {
          spell.folder = magicItemsFolder._id;
          await Item.create(spell);
        }
      } else {
        spell._id = existingSpell._id;
        await Item.update(spell);
      }

      const result = await game.items.entities.find(
        item =>
        item.name === spell.name &&
        item.type === "spell" &&
        item.data.folder === magicItemsFolder._id
      );

      const itemUpdate = {
        _id: result._id,
        id: result._id,
        pack: "world",
        img: result.img,
        name: result.name,
      };
      items.push(itemUpdate);
    }

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
  clearItemsByUserSelection = async () => {
    let invalidItemTypes = [];
    if (game.settings.get("vtta-dndbeyond", "character-update-policy-class"))
      invalidItemTypes.push("class");
    if (game.settings.get("vtta-dndbeyond", "character-update-policy-feat"))
      invalidItemTypes.push("feat");
    if (game.settings.get("vtta-dndbeyond", "character-update-policy-weapon"))
      invalidItemTypes.push("weapon");
    if (
      game.settings.get("vtta-dndbeyond", "character-update-policy-equipment")
    )
      invalidItemTypes.push("equipment");
    if (
      game.settings.get("vtta-dndbeyond", "character-update-policy-inventory")
    )
      invalidItemTypes = invalidItemTypes.concat([
        "consumable",
        "tool",
        "loot",
        "backpack",
      ]);
    if (game.settings.get("vtta-dndbeyond", "character-update-policy-spell"))
      invalidItemTypes.push("spell");

    // collect all items belonging to one of those inventory item categories
    let ownedItems = this.actor.getEmbeddedCollection("OwnedItem");
    let toRemove = ownedItems
      .filter(item => invalidItemTypes.includes(item.type))
      .map(item => item._id);
    await this.actor.deleteEmbeddedEntity("OwnedItem", toRemove);
    console.log("Removed " + toRemove.length + " items from inventory");
    console.log(toRemove);
    return toRemove;
  };

  /* -------------------------------------------- */

  getData() {
    const importPolicies = [
      {
        name: "class",
        isChecked: game.settings.get(
          "vtta-dndbeyond",
          "character-update-policy-class"
        ),
        description: "Classes",
      },
      {
        name: "feat",
        isChecked: game.settings.get(
          "vtta-dndbeyond",
          "character-update-policy-feat"
        ),
        description: "Features",
      },
      {
        name: "weapon",
        isChecked: game.settings.get(
          "vtta-dndbeyond",
          "character-update-policy-weapon"
        ),
        description: "Weapons",
      },
      {
        name: "equipment",
        isChecked: game.settings.get(
          "vtta-dndbeyond",
          "character-update-policy-equipment"
        ),
        description: "Equipment",
      },
      {
        name: "inventory",
        isChecked: game.settings.get(
          "vtta-dndbeyond",
          "character-update-policy-inventory"
        ),
        description: "Other inventory items",
      },
      {
        name: "spell",
        isChecked: game.settings.get(
          "vtta-dndbeyond",
          "character-update-policy-spell"
        ),
        description: "Spells",
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
      .on("change", event => {
        game.settings.set(
          "vtta-dndbeyond",
          "character-update-policy-" + event.currentTarget.dataset.section,
          event.currentTarget.checked
        );
      });

    $(html)
      .find("#json")
      .on("paste", async event => {
        event.preventDefault();
        var pasteData = event.originalEvent.clipboardData.getData("text");

        let data = undefined;
        try {
          data = JSON.parse(pasteData);
          if (!data.character) data.character = data;
        } catch (error) {
          if (error.message === "Unexpected end of JSON input") {
            this.showCurrentTask(
              html,
              "JSON invalid",
              "I could not parse your JSON data because it was cut off. Make sure to wait for the page to stop loading before copying the data into your clipboard.",
              true
            );
          } else {
            this.showCurrentTask(html, "JSON invalid", error.message, true);
          }
          return false;
        }

        try {
          this.result = parser.parseJson(data);
        } catch (error) {
          console.log(
            "%c #### PLEASE PASTE TO https://discord.gg/YEnjUHd #####",
            "color: #ff0000"
          );
          console.log(`**Foundry version         :** ${game.data.version}`);
          console.log(
            `**DND5e version           :** ${game.system.data.version}`
          );
          console.log(
            `**VTTA D&D Beyond version :** ${
              game.modules.get("vtta-dndbeyond").data.version
            }`
          );
          console.log(error);
          console.log(
            "%c ##########################################",
            "color: #ff0000"
          );
          this.showCurrentTask(
            html,
            "I guess you are special!",
            "We had trouble understanding this character. But you can help us to improve! Please <ul><li>open the console with F12</li><li>search for a block of text starting with #### PLEASE PASTE TO #parsing-errors #####</li><li>save the JSON as a text file and submit it along with the error message to <a href='https://discord.gg/YEnjUHd'>#parsing-errors</a></li></ul> Thanks!",
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
          this.showCurrentTask(html, "Uploading avatar image");
          let filename = data.character.name
            .replace(/[^a-zA-Z]/g, "-")
            .replace(/\-+/g, "-")
            .trim();

          let uploadDirectory = game.settings
            .get("vtta-dndbeyond", "image-upload-directory")
            .replace(/^\/|\/$/g, "");

          imagePath = await utils.uploadImage(
            data.character.avatarUrl,
            uploadDirectory,
            filename
          );
          this.result.character.img = imagePath;
        }

        // basic import
        this.showCurrentTask(html, "Updating basic character information");
        await this.actor.update(this.result.character);

        // // clear items
        this.showCurrentTask(html, "Clearing inventory");
        let clearedItems = await this.clearItemsByUserSelection();

        // await this.actor.deleteEmbeddedEntity(
        //   "OwnedItem",
        //   this.actor.getEmbeddedCollection("OwnedItem").map(item => item._id)
        // / );

        // store all spells in the folder specific for Dynamic Items
        if (
          magicItemsInstalled &&
          this.result.itemSpells &&
          Array.isArray(this.result.itemSpells)
        ) {
          const itemSpells = await this.updateFolderItems("itemSpells");
          // scan the inventory for each item with spells and copy the imported data over
          this.result.inventory.forEach(item => {
            if (item.flags.magicitems.spells) {
              for (let [i, spell] of Object.entries(
                  item.flags.magicitems.spells
                )) {
                const itemSpell = itemSpells.find(
                  item => item.name === spell.name
                );
                if (itemSpell)
                  for (const [key, value] of Object.entries(itemSpell)) {
                    item.flags.magicitems.spells[i][key] = value;
                  }
                else {
                  if (!game.user.can("ITEM_CREATE")) {
                    ui.notifications.warn(
                      `Magic Item ${item.name} cannot be enriched because of lacking player permissions`
                    );
                  }
                }
              }
            }
          });
        }

        // Update compendium packs with spells and inventory
        this.updateCompendium("inventory");
        this.updateCompendium("spells");

        // Adding all items to the actor
        let items = filterItemsByUserSelection(this.result);
        // let items = [
        //   this.result.actions,
        //   this.result.inventory,
        //   this.result.spells,
        //   this.result.features,
        //   this.result.classes,
        // ].flat();

        // If there is no magicitems module fall back to importing the magic
        // item spells as normal spells fo the character
        if (!magicItemsInstalled) {
          items.push(this.result.itemSpells.filter(
            item =>
            item.flags.vtta.dndbeyond.active === true
          ));
          items = items.flat();
        }

        await this.copySupportedItemFlags(items);

        utils.log("Character items", "character");
        utils.log(items, "character");

        let itemImportResult = await this.actor.createEmbeddedEntity(
          "OwnedItem",
          items, {
            displaySheet: false,
          }
        );

        // We loop back over the spell slots to update them to our computed
        // available value as per DDB.
        for (const [type, info] of Object.entries(
            this.result.character.data.spells
          )) {
          await this.actor.update({
            [`data.spells.${type}.value`]: parseInt(info.value),
          });
        }

        this.close();
      });

    $(html)
      .find("input[name=dndbeyond-url]")
      .on("input", async event => {
        let matches = event.target.value.match(
          /.*(dndbeyond\.com\/profile\/[\w-_]+\/characters\/\d+)/
        );
        if (matches) {
          $(html)
            .find(".dndbeyond-url-status i")
            .replaceWith(
              '<i class="fas fa-check-circle" style="color: green"></i>'
            );
          this.showCurrentTask(html, "Saving reference");
          await this.actor.update({
            flags: {
              vtta: {
                dndbeyond: {
                  url: "https://www." + matches[1],
                },
              },
            },
          });
          this.showCurrentTask(html, "Status");
        } else {
          this.showCurrentTask(
            html,
            "URL format incorrect",
            "That seems not to be the URL we expected...",
            true
          );
          $(html)
            .find(".dndbeyond-url-status i")
            .replaceWith(
              '<i class="fas fa-exclamation-triangle" style="color:red"></i>'
            );
        }
      });
  }
}

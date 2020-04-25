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
  {
    type: "itemSpells",
    compendium: "entity-spell-compendium",
  },
];

export default class CharacterImport extends Application {
  constructor(options, actor) {
    super(options);
    this.actor = game.actors.entities.find((a) => a.id === actor._id);
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
      let compendiumName = compendiumLookup.find((c) => c.type == type)
        .compendium;
      let compendiumLabel = game.settings.get("vtta-dndbeyond", compendiumName);
      let compendium = await game.packs.find(
        (pack) => pack.collection === compendiumLabel
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
          let searchResult = index.find((i) => i.name === item.name);
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

  /* -------------------------------------------- */

  getData() {
    return {
      actor: this.actor,
    };
  }

  /* -------------------------------------------- */

  activateListeners(html) {
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
          this.showCurrentTask(
            html,
            "I guess you are special!",
            "We had trouble understanding this character. But you can help us to improve! Please <ul><li>open the console with F12</li><li>search for red error text</li><li>save the JSON as a text file and submit it along with the error message to <a href='https://discord.gg/YEnjUHd'>#parsing-errors</a></li></ul> Thanks!",
            true
          );
          return false;
        }

        utils.log("Parsing finished");
        utils.log(this.result);

        // is magicitems installed
        const magicItemsInstalled =
          game.modules.get("magicitems") !== undefined;

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

        // clear items
        this.showCurrentTask(html, "Clearing inventory");
        await this.actor.deleteManyEmbeddedEntities(
          "OwnedItem",
          this.actor.getEmbeddedCollection("OwnedItem").map((item) => item._id)
        );
        //await this.actor.updateManyEmbeddedEntities('OwnedItem'{ items: [] });
        
        // we need to make sure the item spells are in the compendium
        // once they are, if the magic item module is in use we will get
        // the the spell id, pack and imf from the spell and merge it with
        // the current item flags
        const compendiumSpells = await this.updateCompendium("itemSpells");

        if (magicItemsInstalled) {
          this.result.inventory.forEach((item) => {
            if (item.flags.magicitems.spells) {
              for (let [i, spell] of Object.entries(
                item.flags.magicitems.spells
              )) {
                const compendiumSpell = compendiumSpells.find(
                  (s) => s.name === spell.name
                );
                for (const [key, value] of Object.entries(compendiumSpell)) {
                  item.flags.magicitems.spells[i][key] = value;
                }
              }
            }
          });
        }

        // Update compendium packs with spells and items
        this.updateCompendium("inventory");
        this.updateCompendium("spells");

        // Adding all items to the actor
        let items = [
          this.result.actions,
          this.result.inventory,
          this.result.spells,
          this.result.features,
          this.result.classes,
        ].flat();

        // If there is no magicitems module fall back to importing the magic
        // item spells as normal spells fo the character
        if (!magicItemsInstalled) {
          items.push(this.result.itemSpells);
          items = items.flat();
        }

        utils.log("Character items", "character");
        utils.log(items, "character");

        let itemImportResult = await this.actor.createManyEmbeddedEntities(
          "OwnedItem",
          items,
          {
            displaySheet: false,
          }
        );

        // We loop back over the spell slots to update them to our computed
        // available value as per DDB.
        for (const [type, info] of Object.entries(this.result.character.data.spells)) {
          await this.actor.update({
            [`data.spells.${type}.value`]: parseInt(info.value)
          });
        }
        
        this.close();
      });

    $(html)
      .find("input[name=dndbeyond-url]")
      .on("input", async (event) => {
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

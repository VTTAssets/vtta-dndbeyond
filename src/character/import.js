import parser from "../../src/parser/index.js";
import utils from "../utils.js";

// a mapping of compendiums with content type
const compendiumLookup = [
  {
    type: "inventory",
    compendium: "entity-item-compendium"
  },
  {
    type: "spells",
    compendium: "entity-spell-compendium"
  },
  {
    type: "itemSpells",
    compendium: "entity-spell-compendium"
  }
]

export default class CharacterImport extends Application {
  constructor(options, actor) {
    super(options);
    this.actor = game.actors.entities.find(a => a.id === actor._id);
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
      let compendiumName = compendiumLookup.find(
        c => c.type == type
      ).compendium;
      let compendiumLabel = game.settings.get(
        "vtta-dndbeyond",
        compendiumName
      );
      let compendium = await game.packs.find(
        pack => pack.collection === compendiumLabel
      );

      if (compendium) {
        let index = await compendium.getIndex();

        for (let i = 0; i < this.result[type].length; i++) {
          let item = this.result[type][i];
          let result;

          utils.log(
            `Processing item ${item.name} in compendium ${compendiumLabel}`,
            "character"
          );

          // search the compendium for this item
          let searchResult = index.find(i => i.name === item.name);
          if (searchResult && importPolicy === 0) {
            this.showCurrentTask(
              `Updating item ${item.name} in compendium ${compendiumLabel}`
            );
            item._id = searchResult.id;
            result = await compendium.updateEntity(item);
          } else if (searchResult) {
            result = await compendium.getEntity(searchResult.id);
          } else if (!searchResult) {
            // create the item first
            this.showCurrentTask(
              `Creationg item ${item.name} in compendium ${compendiumLabel}`
            );
            searchResult = await Item.create(item, {
              temporary: true,
              displaySheet: false
            });
            result = await compendium.importEntity(searchResult);
          }

          let itemUpdate = {
            id: result.id,
            pack: compendium.collection,
            img: result.img,
            name: item.name,
          } 
          items.push(itemUpdate)
        }
      }
    }
    return items;
  }

  /* -------------------------------------------- */

  getData() {
    return {
      actor: this.actor
    };
  }

  /* -------------------------------------------- */

  activateListeners(html) {
    $(html)
      .find("#json")
      .on("paste", async event => {
        event.preventDefault();
        var pasteData = event.originalEvent.clipboardData.getData("text");

        this.showCurrentTask = msg => {
          let element = $(html).find(".task-name");
          element.text(msg);
        };

        let data = JSON.parse(pasteData);
        this.result = parser.parseJson(data);
        utils.log("Parsing finished");
        utils.log(this.result);

        // get list of loaded game modules
        const gameModules = game.settings.get("core","moduleConfiguration");

        // updating the image?
        let imagePath = this.actor.img;
        if (
          game.user.isTrusted &&
          imagePath.indexOf("mystery-man") !== -1 &&
          data.character.avatarUrl &&
          data.character.avatarUrl !== ""
        ) {
          this.showCurrentTask("Uploading avatar image");
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
        this.showCurrentTask("Updating basic character information");
        await this.actor.update(this.result.character);

        // clear items
        this.showCurrentTask("Clearing inventory");
        await this.actor.deleteManyEmbeddedEntities(
          "OwnedItem",
          this.actor.getEmbeddedCollection("OwnedItem").map(item => item._id)
        );
        //await this.actor.updateManyEmbeddedEntities('OwnedItem'{ items: [] });

        
        // we need to make sure the item spells are in the compendium
        // once they are, if the magic item module is in use we will get
        // the the spell id, pack and imf from the spell and merge it with
        // the current item flags
        const compendiumSpells = await this.updateCompendium('itemSpells');

        if (gameModules["magicitems"]) {
          this.result.inventory.forEach( item => {
            if (item.flags.magicitems.spells) {
              for (let [i, spell] of Object.entries(item.flags.magicitems.spells)) {
                const compendiumSpell = compendiumSpells.find( s => s.name === spell.name );
                for (const [key, value] of Object.entries(compendiumSpell)) {
                  item.flags.magicitems.spells[i][key] = value;
                }
              };
            };
          }); 
        }

        // Update compendium packs with spells and items
        this.updateCompendium('inventory');
        this.updateCompendium('spells');

        // Adding all items to the actor
        let items = [
          this.result.actions,
          this.result.inventory,
          this.result.spells,
          this.result.features,
          this.result.classes
        ].flat();

        // If there is no magicitems module fall back to importing the magic
        // item spells as normal spells fo the character
        if (!gameModules["magicitems"]) {
          items.push(this.result.itemSpells);
          items = items.flat();
        }
        
        utils.log("Character items", "character");
        utils.log(items, "character");

        let itemImportResult = await this.actor.createManyEmbeddedEntities(
          "OwnedItem",
          items,
          {
            displaySheet: false
          }
        );

        this.close();
      });

    $(html)
      .find("input[name=dndbeyond-url]")
      .on("input", async event => {
        this.showCurrentTask = msg => {
          let element = $(html).find(".task-name");
          element.text(msg);
        };

        let matches = event.target.value.match(
          /.*(dndbeyond\.com\/profile\/[\w-_]+\/characters\/\d+)/
        );
        if (matches) {
          $(html)
            .find(".dndbeyond-url-status i")
            .replaceWith(
              '<i class="fas fa-check-circle" style="color: green"></i>'
            );
          this.showCurrentTask("Saving reference");
          await this.actor.update({
            flags: {
              vtta: {
                dndbeyond: {
                  url: "https://www." + matches[1]
                }
              }
            }
          });
          this.showCurrentTask("Status");
        } else {
          this.showCurrentTask("URL format incorrect, see above");
          $(html)
            .find(".dndbeyond-url-status i")
            .replaceWith(
              '<i class="fas fa-exclamation-triangle" style="color:red"></i>'
            );
        }
      });
  }
}

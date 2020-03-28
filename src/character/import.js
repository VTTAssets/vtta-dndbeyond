import parser from "../../src/parser/index.js";
import utils from "../utils.js";

export default class CharacterImport extends Application {
  constructor(options, actor) {
    super(options);
    this.actor = game.actors.entities.find(a => a.id === actor._id);
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

        let showCurrentTask = msg => {
          let element = $(html).find(".task-name");
          element.text(msg);
        };

        //try {
        let data = JSON.parse(pasteData);
        let result = parser.parseJson(data);
        utils.log("Parsing finished");
        utils.log(result);

        // updating the image?
        let imagePath = this.actor.img;
        if (
          game.user.isTrusted &&
          imagePath.indexOf("mystery-man") !== -1 &&
          data.character.avatarUrl &&
          data.character.avatarUrl !== ""
        ) {
          showCurrentTask("Uploading avatar image");
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
          result.character.img = imagePath;
        }

        // basic import
        showCurrentTask("Updating basic character information");
        await this.actor.update(result.character);

        // clear items
        showCurrentTask("Clearing inventory");
        await this.actor.deleteManyEmbeddedEntities(
          "OwnedItem",
          this.actor.getEmbeddedCollection("OwnedItem").map(item => item._id)
        );
        //await this.actor.updateManyEmbeddedEntities('OwnedItem'{ items: [] });

        // Adding all items to the actor
        let items = [
          result.actions,
          result.inventory,
          result.spells,
          result.features,
          result.classes
        ].flat();
        utils.log("Character items", "character");
        utils.log(items, "character");

        let itemImportResult = await this.actor.createManyEmbeddedEntities(
          "OwnedItem",
          items,
          {
            displaySheet: false
          }
        );

        let importPolicy = game.settings.get(
          "vtta-dndbeyond",
          "entity-import-policy"
        );
        // should we update the compendium packs, too?
        if (game.user.isGM && importPolicy !== 2) {
          // we are updating inventory and spells only
          for (let category of [
            {
              type: "inventory",
              compendium: "entity-item-compendium"
            },
            {
              type: "spells",
              compendium: "entity-spell-compendium"
            }
          ]) {
            let compendiumLabel = game.settings.get(
              "vtta-dndbeyond",
              category.compendium
            );
            let compendium = await game.packs.find(
              pack => pack.collection === compendiumLabel
            );

            if (compendium) {
              let index = await compendium.getIndex();

              for (let i = 0; i < result[category.type].length; i++) {
                let item = result[category.type][i];

                utils.log(
                  `Processing item ${item.name} in compendium ${compendiumLabel}`,
                  "character"
                );

                // search the compendium for this item
                let searchResult = index.find(i => i.name === item.name);
                if (searchResult && importPolicy === 0) {
                  showCurrentTask(
                    `Updating item ${item.name} in compendium ${compendiumLabel}`
                  );
                  item._id = searchResult.id;
                  await compendium.updateEntity(item);
                }

                if (!searchResult) {
                  // create the item first
                  showCurrentTask(
                    `Creationg item ${item.name} in compendium ${compendiumLabel}`
                  );
                  searchResult = await Item.create(item, {
                    temporary: true,
                    displaySheet: false
                  });
                  await compendium.importEntity(searchResult);
                }
              }
            }
          }
        }
        // } catch (error) {
        //   ui.notifications.error(error);
        // }
        this.close();
      });

    $(html)
      .find("input[name=dndbeyond-url]")
      .on("input", async event => {
        let showCurrentTask = msg => {
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
          showCurrentTask("Saving reference");
          await this.actor.update({
            flags: {
              vtta: {
                dndbeyond: {
                  url: "https://www." + matches[1]
                }
              }
            }
          });
          showCurrentTask("Status");
        } else {
          showCurrentTask("URL format incorrect, see above");
          $(html)
            .find(".dndbeyond-url-status i")
            .replaceWith(
              '<i class="fas fa-exclamation-triangle" style="color:red"></i>'
            );
        }
      });
  }
}

import utils from "../../../utils.js";

const SAVE_ALL = 0;
const SAVE_NEW = 1;
const SAVE_NONE = 2;

const CLEAN_NONE = 0;
const CLEAN_MONSTERS = 1;
const CLEAN_SPELLS = 2;
const CLEAN_ALL = 3;

let addSpell = (body) => {
  return new Promise(async (resolve, reject) => {
    // cleaning up after imports
    const cleanupAfterImport =
      game.settings.get("vtta-dndbeyond", "entity-cleanup-policy") ===
        CLEAN_ALL ||
      game.settings.get("vtta-dndbeyond", "entity-cleanup-policy") ===
        CLEAN_SPELLS;

    // get the folder to add this spell into
    let folder = await utils.getFolder(body.type);
    body.data.folder = folder.id;

    // check if there is an NPC with that name in that folder already
    let spell = folder.content
      ? folder.content.find((spell) => spell.name === body.data.name)
      : undefined;
    if (spell) {
      body.data._id = spell.id;
      // update the current npc
      await spell.update(body.data);
    } else {
      // create the new spell
      spell = await Item.create(body.data, {
        temporary: false,
        displaySheet: true,
      });
    }

    // decide wether to save it into the compendium
    if (
      game.settings.get("vtta-dndbeyond", "entity-import-policy") !== SAVE_NONE
    ) {
      // update existing (1) or overwrite (0)
      let compendiumName = game.settings.get(
        "vtta-dndbeyond",
        "entity-spell-compendium"
      );
      if (compendiumName && compendiumName !== "") {
        let compendium = game.packs.find(
          (pack) => pack.collection === compendiumName
        );
        if (compendium) {
          let index = await compendium.getIndex();
          let entity = index.find(
            (entity) =>
              entity.name.toLowerCase() === body.data.name.toLowerCase()
          );
          if (entity) {
            if (SAVE_ALL) {
              const id = spell.data._id;
              spell.data._id = entity._id;
              await compendium.updateEntity(spell.data);
              spell.data._id = id;
            }
          } else {
            await compendium.createEntity(spell.data);
          }
        } else {
          reject("Error opening compendium, check your settings");
        }
      }
    }
    if (cleanupAfterImport) {
      await spell.delete();
      resolve(null);
    } else {
      resolve(spell.data);
    }
  });
};

export default addSpell;

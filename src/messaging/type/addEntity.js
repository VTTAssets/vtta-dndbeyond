import utils from "../../utils.js";
import { Actor5e } from "../../../../../systems/dnd5e/module/actor/entity.js";
const SAVE_ALL = 0;
const SAVE_NEW = 1;
const SAVE_NONE = 2;

const retrieveSpells = async (spells) => {
  let compendiumName = game.settings.get(
    "vtta-dndbeyond",
    "entity-spell-compendium"
  );
  let compendium = game.packs.find(
    (pack) => pack.collection === compendiumName
  );
  let spellResult = [];
  if (compendium) {
    const index = await compendium.getIndex();
    for (let i = 0; i < spells.length; i++) {
      let spell = index.find((entry) => entry.name.toLowerCase() === spells[i]);
      if (spell) {
        console.log("Querying compendium for spell with ID " + spell._id);
        spell = await compendium.getEntity(spell._id);
        spellResult.push(spell);
      }
    }
  }
  return spellResult;
};

// // if we have valid spells in here, they must have been coming through lookups in the compendium, so we take the existance for granted
// for (let i = 0; i < npc.flags.vtta.dndbeyond.spells.length; i++) {
//   let spell = npc.flags.vtta.dndbeyond.spells[i];
//   utils.log(`Searching for spell ${spell} in compendium...`, "extension");
//   let entry = index.find((entry) => entry.name.toLowerCase() === spell);
//   if (!entry) continue;
//   utils.log(items, "character");

//   let itemImportResult = await this.actor.createManyEmbeddedEntities(
//     "OwnedItem",
//     items,
//     {
//       displaySheet: false,
//     }
//   );
// }

let queryIcons = (names) => {
  return new Promise((resolve, reject) => {
    let listener = (event) => {
      resolve(event.detail);
      // cleaning up
      document.removeEventListener("deliverIcon", listener);
    };

    setTimeout(() => {
      document.removeEventListener("deliverIcon", listener);
      reject("Tokenizer not responding");
    }, 500);
    document.addEventListener("deliverIcon", listener);
    document.dispatchEvent(
      new CustomEvent("queryIcons", { detail: { names: names } })
    );
  });
};

// we are creating the NPC here not temporary
let createNPC = async (npc, options) => {
  let icons = npc.items.map((item) => {
    return {
      name: item.name,
    };
  });
  try {
    utils.log("Querying iconizer for icons");
    icons = await queryIcons(icons);
    utils.log(icons);

    // replace the icons
    for (let item of npc.items) {
      let icon = icons.find((icon) => icon.name === item.name);
      if (icon) {
        item.img = icon.img;
      }
    }
  } catch (exception) {
    utils.log("Iconizer not responding");
  }

  let result = await Actor5e.create(npc, options);

  // // import spells, if any
  // npc.flags.vtta.dndbeyond.spells = npc.flags.vtta.dndbeyond.spells.filter(
  //   (spell) => spell.hasOwnProperty("id")
  // );

  if (npc.flags.vtta.dndbeyond.spells.length !== 0) {
    // update existing (1) or overwrite (0)
    let spells = await retrieveSpells(npc.flags.vtta.dndbeyond.spells);
    spells = spells.map((spell) => spell.data);
    let char = await result.createManyEmbeddedEntities("OwnedItem", spells);
    console.log(char);
    console.log(result);
  }

  return result;
};
let addSpell = (body) => {
  return new Promise(async (resolve, reject) => {
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
              spell.data._id = entity.id;
              spell = await compendium.updateEntity(spell.data);
            }
          } else {
            spell = await compendium.createEntity(spell.data);
          }
        } else {
          reject("Error opening compendium, check your settings");
        }
      }
    }
    resolve(spell.data);
  });
};

let addNPC = (body) => {
  return new Promise(async (resolve, reject) => {
    // get the folder to add this spell into
    let folder = await utils.getFolder(
      body.type,
      body.data.data.details.type,
      body.data.data.details.race
    );
    body.data.folder = folder.id;

    if (body.data.flags.vtta.dndbeyond.img) {
      // image upload
      let filename =
        "npc-" +
        body.data.name
          .replace(/[^a-zA-Z]/g, "-")
          .replace(/\-+/g, "-")
          .trim();

      let uploadDirectory = game.settings
        .get("vtta-dndbeyond", "image-upload-directory")
        .replace(/^\/|\/$/g, "");
      body.data.img = await utils.uploadImage(
        body.data.flags.vtta.dndbeyond.img,
        uploadDirectory,
        filename
      );
    }

    // replace icons by iconizer, if available
    let icons = body.data.items.map((item) => {
      return {
        name: item.name,
      };
    });
    try {
      utils.log("Querying iconizer for icons");
      icons = await queryIcons(icons);
      utils.log(icons);

      // replace the icons
      for (let item of body.data.items) {
        let icon = icons.find((icon) => icon.name === item.name);
        if (icon) {
          item.img = icon.img;
        }
      }
    } catch (exception) {
      utils.log("Iconizer not responding");
    }

    // check if there is an NPC with that name in that folder already
    let npc = folder.content
      ? folder.content.find((actor) => actor.name === body.data.name)
      : undefined;
    if (npc) {
      // remove the inventory of said npc
      await npc.deleteManyEmbeddedEntities(
        "OwnedItem",
        npc.getEmbeddedCollection("OwnedItem").map((item) => item._id)
      );
      // update items and basic data
      await npc.update(body.data);
      if (
        body.data.flags.vtta.dndbeyond.spells &&
        body.data.flags.vtta.dndbeyond.spells.length !== 0
      ) {
        let spells = await retrieveSpells(
          body.data.flags.vtta.dndbeyond.spells
        );
        spells = spells.map((spell) => spell.data);
        await npc.createManyEmbeddedEntities("OwnedItem", spells);
      }
    } else {
      // create the new npc
      npc = await createNPC(body.data, {
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
        "entity-monster-compendium"
      );
      if (compendiumName && compendiumName !== "") {
        //let compendium = game.packs.find(compendium => compendium.metadata.label === compendiumName);
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
              npc.data._id = entity.id;
              npc = await compendium.updateEntity(npc.data);
            }
          } else {
            npc = await compendium.createEntity(npc.data);
          }
        } else {
          reject("Error opening compendium, check your settings");
        }
      }
    }

    resolve(npc.data);
  });
};

export default function (body) {
  switch (body.type) {
    case "spell":
      return addSpell(body);
    case "npc":
      return addNPC(body);
    default:
      return new Promise((resolve, reject) => reject("Unknown body type"));
  }
}

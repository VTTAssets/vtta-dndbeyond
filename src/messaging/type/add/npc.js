import utils from "../../../utils.js";

const SAVE_ALL = 0;
const SAVE_NEW = 1;
const SAVE_NONE = 2;

const CLEAN_NONE = 0;
const CLEAN_MONSTERS = 1;
const CLEAN_SPELLS = 2;
const CLEAN_ALL = 3;

/**
 * Sends a event request to Iconizer to add the correct icons
 * @param {*} names
 */
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

/**
 *
 * @param {[string]} spells Array of Strings or
 */

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
      let spell = undefined;
      switch (typeof spells[i]) {
        case "string":
          spell = index.find((entry) => entry.name.toLowerCase() === spells[i]);
          break;
        case "object":
          const spellId = spells[i].id || spells[i]._id;
          spell = index.find((entry) => {
            const id = entry.id || entry._id;
            return id === spellId;
          });
          break;
        default:
          spell = undefined;
      }

      if (spell) {
        const spellId = spell.id || spell._id;
        console.log("Querying compendium for spell with ID " + spellId);
        spell = await compendium.getEntity(spellId);
        spellResult.push(spell);
      }
    }
  }
  return spellResult;
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

  //let result = await Actor5e.create(npc, options);
  // should be aliased again
  let result = await Actor.create(npc, options);

  if (npc.flags.vtta.dndbeyond.spells.length !== 0) {
    // update existing (1) or overwrite (0)
    let spells = await retrieveSpells(npc.flags.vtta.dndbeyond.spells);
    spells = spells.map((spell) => spell.data);
    let char = await result.createEmbeddedEntity("OwnedItem", spells);
    console.log(char);
    console.log(result);
  }

  return result;
};

let addNPC = (body) => {
  return new Promise(async (resolve, reject) => {
    // cleaning up after imports
    const cleanupAfterImport =
      game.settings.get("vtta-dndbeyond", "entity-cleanup-policy") ===
        CLEAN_ALL ||
      game.settings.get("vtta-dndbeyond", "entity-cleanup-policy") ===
        CLEAN_MONSTERS;

    // get the folder to add this npc into
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
      await npc.deleteEmbeddedEntity(
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
        await npc.createEmbeddedEntity("OwnedItem", spells);
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
            if (
              game.settings.get("vtta-dndbeyond", "entity-import-policy") ===
              SAVE_ALL
            ) {
              const _id = npc.data._id;
              npc.data._id = entity._id;
              await compendium.updateEntity(npc.data);
              npc.data._id = _id;
            }
          } else {
            await compendium.createEntity(npc.data);
          }
        } else {
          reject("Error opening compendium, check your settings");
        }
      }
    }

    if (cleanupAfterImport) {
      await npc.delete();
      resolve(null);
    } else {
      resolve(npc.data);
    }
  });
};

export default addNPC;

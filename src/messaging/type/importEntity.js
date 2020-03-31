import utils from "../../utils.js";

let queryIcons = names => {
  return new Promise((resolve, reject) => {
    let listener = event => {
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

let createNPC = async npc => {
  let icons = npc.items.map(item => {
    return {
      name: item.name
    };
  });
  try {
    utils.log("Querying iconizer for icons");
    icons = await queryIcons(icons);
    utils.log(icons);

    // replace the icons
    for (let item of npc.items) {
      let icon = icons.find(icon => icon.name === item.name);
      if (icon) {
        item.img = icon.img;
      }
    }
  } catch (exception) {
    utils.log("Iconizer not responding");
  }

  // import spells, if any
  npc.flags.vtta.dndbeyond.spells = npc.flags.vtta.dndbeyond.spells.filter(
    spell => spell.hasOwnProperty("id")
  );

  if (npc.flags.vtta.dndbeyond.spells.length !== 0) {
    // update existing (1) or overwrite (0)
    let compendiumName = game.settings.get(
      "vtta-dndbeyond",
      "entity-spell-compendium"
    );

    let compendium = game.packs.find(
      pack => pack.collection === compendiumName
    );

    for (let spell of npc.flags.vtta.dndbeyond.spells) {
      let entity = await compendium.getEntity(spell.id);
      entity.data.id = npc.items.length;
      npc.items.push(entity.data);
    }
  }

  let items = npc.items;
  npc.items = [];
  let result = await Actor.create(npc, {
    temporary: false,
    displaySheet: false
  });
  let itemImportResult = await result.createManyEmbeddedEntities(
    "OwnedItem",
    items,
    {
      displaySheet: false
    }
  );

  return result;
};

// importing a new spell
let importSpell = body => {
  return new Promise(async (resolve, reject) => {
    // should be update entities according to the configuration?
    let updateEntity =
      game.settings.get("vtta-dndbeyond", "entity-import-policy") === 0;

    let spell = await Item.create(body.data, {
      temporary: true,
      displaySheet: false
    });

    // decide wether to save it into the compendium
    if (game.settings.get("vtta-dndbeyond", "entity-import-policy") !== 2) {
      // update existing (1) or overwrite (0)
      let compendiumName = game.settings.get(
        "vtta-dndbeyond",
        "entity-spell-compendium"
      );
      if (compendiumName !== "") {
        //let compendium = game.packs.find(compendium => compendium.metadata.label === compendiumName);
        let compendium = game.packs.find(
          pack => pack.collection === compendiumName
        );
        if (compendium) {
          let index = await compendium.getIndex();
          let entity = index.find(
            entity => entity.name.toLowerCase() === body.data.name.toLowerCase()
          );
          if (entity) {
            if (updateEntity) {
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

let importNPC = async body => {
  return new Promise(async (resolve, reject) => {
    // should be update entities according to the configuration?
    let updateEntity =
      game.settings.get("vtta-dndbeyond", "entity-import-policy") === 0;

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

    // create the npc
    let npc = await createNPC(body.data, {
      temporary: true,
      displaySheet: false
    });

    // decide wether to save it into the compendium
    if (game.settings.get("vtta-dndbeyond", "entity-import-policy") !== 2) {
      // update existing (1) or overwrite (0)
      let compendiumName = game.settings.get(
        "vtta-dndbeyond",
        "entity-monster-compendium"
      );
      if (compendiumName !== "") {
        //let compendium = game.packs.find(compendium => compendium.metadata.label === compendiumName);
        let compendium = game.packs.find(
          pack => pack.collection === compendiumName
        );
        if (compendium) {
          let index = await compendium.getIndex();
          let entity = index.find(
            entity => entity.name.toLowerCase() === body.data.name.toLowerCase()
          );
          if (entity) {
            if (updateEntity) {
              npc.data._id = entity.id;
              entity = await compendium.updateEntity(npc.data);
              npc.delete();
              resolve(entity.data);
            } else {
              reject("Module settings forbid to update existing entities");
            }
          } else {
            entity = await compendium.createEntity(npc.data);
            npc.delete();
            resolve(entity.data);
          }
        } else {
          npc.delete();
          reject("Error opening compendium, check your settings");
        }
      }
    }
  });
};

export default function(body) {
  switch (body.type) {
    case "spell":
      return importSpell(body);
    case "npc":
      return importNPC(body);
    default:
      return new Promise((resolve, reject) => reject("Unknown body type"));
  }
}

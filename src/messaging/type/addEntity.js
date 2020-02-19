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

// we are creating the NPC here not temporary
let createNPC = async (npc, options) => {
  let icons = npc.items.map(item => {
    return {
      name: item.name
    };
  });
  if (game.modules.find(mod => mod.id === "vtta-iconizer") !== undefined) {
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
  } else {
    utils.log("Iconizer not installed");
  }

  let result = await Actor.create(npc, options);

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
    //let compendium = game.packs.find(compendium => compendium.metadata.label === compendiumName);

    // if we have valid spells in here, they must have been coming through lookups in the compendium, so we take the existance for granted
    for (let spell of npc.flags.vtta.dndbeyond.spells) {
      utils.log(
        `Searching for spell ${spell.name} in compendium...`,
        "extension"
      );
      let entity = await compendium.getEntity(spell.id);
      utils.log(entity, "extension");

      await result.createEmbeddedEntity("OwnedItem", entity.data, {
        displaySheet: false
      });
    }
  }

  return result;
};

let addSpell = body => {
  return new Promise(async (resolve, reject) => {
    // get the folder to add this spell into
    let folder = await utils.getFolder(body.type);
    body.data.folder = folder.id;

    let updateEntity =
      game.settings.get("vtta-dndbeyond", "entity-import-policy") === 0;

    let spell = await Item.create(body.data, {
      temporary: false,
      displaySheet: true
    });

    resolve(spell.data);
  });
};

let addNPC = body => {
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

    if (game.modules.find(mod => mod.id === "vtta-iconizer") !== undefined) {
      // replace icons by iconizer, if available
      let icons = body.data.items.map(item => {
        return {
          name: item.name
        };
      });
      try {
        utils.log("Querying iconizer for icons");
        icons = await queryIcons(icons);
        utils.log(icons);

        // replace the icons
        for (let item of body.data.items) {
          let icon = icons.find(icon => icon.name === item.name);
          if (icon) {
            item.img = icon.img;
          }
        }
      } catch (exception) {
        utils.log("Iconizer not responding");
      }
    } else {
      utils.log("Iconizer not installed");
    }

    // check if there is an NPC with that name in that folder already
    let npc = folder.content
      ? folder.content.find(actor => actor.name === body.data.name)
      : undefined;
    if (npc) {
      body.data._id = npc.id;
      // update the current npc
      await npc.update(body.data);
    } else {
      // create the new npc
      npc = await createNPC(body.data, {
        temporary: false,
        displaySheet: true
      });
    }

    // import spells, if any
    // body.data.flags.vtta.spells = body.data.flags.vtta.spells.filter(spell => spell.hasOwnProperty('id'));

    // if (body.data.flags.vtta.spells.length !== 0) {
    //   // update existing (1) or overwrite (0)
    //   let compendiumName = game.settings.get('vtta-dndbeyond', 'entity-spell-compendium');
    //   let compendium = game.packs.find(pack => pack.collection === compendiumName);
    //   //let compendium = game.packs.find(compendium => compendium.metadata.label === compendiumName);

    //   // if we have valid spells in here, they must have been coming through lookups in the compendium, so we take the existance for granted
    //   for (let spell of body.data.flags.vtta.spells) {
    //     console.log('Searching for spell ');
    //     console.log(spell);
    //     let entity = await compendium.getEntity(spell.id);
    //     console.log('Result from compendium:');
    //     console.log(entity);
    //     let importResult = await npc.createOwnedItem(entity.data);
    //   }
    // }

    resolve(npc.data);
  });
};

export default function(body) {
  switch (body.type) {
    case "spell":
      return addSpell(body);
    case "npc":
      return addNPC(body);
    default:
      return new Promise((resolve, reject) => reject("Unknown body type"));
  }
}

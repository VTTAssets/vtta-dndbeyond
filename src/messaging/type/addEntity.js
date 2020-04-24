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
            if (
              game.settings.get("vtta-dndbeyond", "entity-import-policy") ===
              SAVE_ALL
            ) {
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

const getFolder = async (structure, entityName) => {
  let getOrCreateFolder = async (root, folderName) => {
    const baseColor = "#98020a";

    const rootId = root !== null && root.id !== null ? root.id : null;

    let folder = game.folders.entities.find(
      (f) =>
        f.data.type === entityName &&
        f.data.name === folderName &&
        f.data.parent === rootId
    );
    if (folder) return folder;
    folder = await Folder.create({
      name: folderName,
      type: entityName,
      color: baseColor,
      parent: rootId,
    });
    return folder;
  };

  parent = null;
  for (let i = 0; i < structure.length; i++) {
    console.log("FOLDER: " + structure[i]);
    parent = await getOrCreateFolder(parent, structure[i]);
  }

  return parent;
};

const combineContent = (section, depth = 1) => {
  let content = depth !== 1 ? `<h${depth}>${section.title}</h${depth}>` : "";
  content += insertRollTables(section.content.join("")); //section.content.join("");

  for (let subSection of section.sections) {
    content += combineContent(subSection, depth + 1);
  }
  return content;
};

const insertRollTables = (content) => {
  let orig = $("<div>" + content + "</div>");
  let processed = [];
  $(orig)
    .find('div[data-type="rolltable"]')
    .html(function () {
      let rollTableId = $(this).attr("data-id");
      if (rollTableId) {
        if (processed.includes(rollTableId)) $(this).remove();
        else {
          processed.push(rollTableId);
          let rollTable = game.tables.entities.find(
            (t) =>
              t.data.flags &&
              t.data.flags.vtta &&
              t.data.flags.vtta.dndbeyond &&
              t.data.flags.vtta.dndbeyond.rollTableId === rollTableId
          );
          const replacement = `<div class="rolltable"><span class="rolltable-head">Roll Table: </span><span class="rolltable-link">@RollTable[${rollTable._id}]{${rollTable.name}}</span></div>`;
          console.log("Replacing: " + this);
          console.log("   + with: " + replacement);
          //$(div).replaceWith(replacement);
          return replacement;
        }
      }
    });
  console.log($(orig).html());
  return $(orig).html();
};

const addSection = async (folderNames, section) => {
  console.log(
    "Adding section " + section.title + " at " + folderNames.join("/")
  );

  if (
    folderNames.length <= 3 &&
    section.sections &&
    section.sections.length > 0
  ) {
    folderNames =
      folderNames.length > 0
        ? folderNames.concat([section.title])
        : [section.title];
    let folder = await getFolder(folderNames, "JournalEntry");

    // main entry for this page
    let content = insertRollTables(section.content.join(""));
    let entry = await JournalEntry.create({
      folder: folder._id,
      name: section.title,
      content: section.content.join(""),
    });

    // create the subsections
    for (let i = 0; i < section.sections.length; i++) {
      await addSection(folderNames, section.sections[i]);
    }
  } else {
    let folder = await getFolder(folderNames.slice(0, 3), "JournalEntry");
    // create the content for this entry alone, without subfolders

    let content = combineContent(section, 1);
    let entry = await JournalEntry.create({
      folder: folder._id,
      name: section.title,
      content: content,
      img: section.img,
    });
  }
};

const addRollTables = async (folderName, rollTables) => {
  let folder = await getFolder([folderName], "RollTable");
  let tables = [];
  for (let data of rollTables) {
    console.log(data);
    let rollTable = await RollTable.create({
      name: data.name,
      formula: `1d${data.max}`,
      folder: folder._id,
      // data: {
      flags: {
        vtta: {
          dndbeyond: {
            rollTableId: data.id,
          },
        },
      },
      //},
    });
    await rollTable.createEmbeddedEntity("TableResult", data.results);

    tables.push(rollTable);
  }
  return tables;
};

let addPage = (body) => {
  return new Promise(async (resolve, reject) => {
    // get the folder to add this spell into
    console.log(body);
    let folderNames = []; //[body.data.module.name];

    let rollTables = [];
    if (
      body.data.content.rollTables &&
      body.data.content.rollTables.length > 0
    ) {
      rollTables = await addRollTables(
        body.data.content.title,
        body.data.content.rollTables
      );
    }

    // create the content by sections
    await addSection(folderNames, body.data.content);
  });
};

export default function (body) {
  switch (body.type) {
    case "spell":
      return addSpell(body);
    case "npc":
      return addNPC(body);
    case "page":
      return addPage(body);
    default:
      return new Promise((resolve, reject) => reject("Unknown body type"));
  }
}

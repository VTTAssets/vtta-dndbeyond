import utils from "../../../utils.js";

const SAVE_ALL = 0;
const SAVE_NEW = 1;
const SAVE_NONE = 2;

const getFolder = async (structure, entityName, sourcebook) => {
  const getOrCreateFolder = async (root, folderName, sourcebook) => {
    const baseColor = "#98020a";
    const rootId = root !== null && root.id !== null ? root.id : null;
    let folder = game.folders.entities.find(
      (f) =>
        f.data.type === entityName &&
        f.data.name === folderName &&
        f.data.parent === rootId &&
        f.data.flags.vtta &&
        f.data.flags.vtta.dndbeyond &&
        f.data.flags.vtta.dndbeyond.sourcebook &&
        f.data.flags.vtta.dndbeyond.sourcebook === sourcebook.abbrev.toLowerCase()
    );
    if (folder) return folder;
    folder = await Folder.create({
      name: folderName,
      type: entityName,
      color: baseColor,
      parent: rootId,
      flags: {
        vtta: {
          dndbeyond: {
            sourcebook: sourcebook.abbrev.toLowerCase(),
          },
        },
      },
    });
    return folder;
  };

  let parent = null;
  for (let i = 0; i < structure.length; i++) {
    parent = await getOrCreateFolder(parent, structure[i], sourcebook);
  }

  return parent;
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
          return replacement;
        }
      }
    });
  return $(orig).html();
};

const addJournalEntries = async (data) => {
  // create the primary folder for all content
  let folder = await getFolder([data.title], "JournalEntry", data.book);
  let entry = await JournalEntry.create({
    folder: folder._id,
    name: data.title,
    content: insertRollTables(data.content),
    img: null,
  });

  // create sub-entries for all scenes
  for (let scene of data.scenes) {
    folder = await getFolder([data.title, scene.name], "JournalEntry", data.book);
    for (let entry of scene.entries) {
      entry = await JournalEntry.create({
        folder: folder._id,
        name: entry.name,
        content: insertRollTables(entry.content), //section.content.join(""),
        img: null,
      });
    }
  }
};

const addScenes = async (data) => {
  let uploadDirectory = game.settings.get("vtta-dndbeyond", "scene-upload-directory");
  let folder = await getFolder([data.book.name, data.title], "Scene", data.book);

  // check if the scene already exists
  for (let scene of data.scenes) {
    let existing = game.scenes.entities.find((s) => s.name === scene.name && s.data.folder === folder.data._id);
    if (existing) {
      console.log("Scene " + scene.name + " does exist already, updating...");
      let update = {
        width: scene.width,
        height: scene.height,
        backgroundColor: scene.backgroundColor,
      };
      if (scene.shiftX) update.shiftX = scene.shiftX;
      if (scene.shiftY) update.shiftY = scene.shiftY;
      if (scene.grid) update.grid = scene.grid;
      if (scene.gridDistance) update.gridDistance = scene.gridDistance;
      if (scene.gridType) update.gridType = scene.gridType;
      if (scene.globalLight) update.globalLight = scene.globalLight;
      await existing.update(update);

      // remove existing walls, add from import
      if (scene.walls && scene.walls.length > 0) {
        await existing.deleteEmbeddedEntity(
          "Wall",
          existing.getEmbeddedCollection("Wall").map((wall) => wall._id)
        );
        await existing.createEmbeddedEntity("Wall", scene.walls);
      }

      // remove existing lights, add from import
      if (scene.lights && scene.lights.length > 0) {
        await existing.deleteEmbeddedEntity(
          "AmbientLight",
          existing.getEmbeddedCollection("AmbientLight").map((light) => light._id)
        );
        await existing.createEmbeddedEntity("AmbientLight", scene.lights);
      }
    } else {
      const EXTENSION = scene.src.split(".").pop();
      const baseFilename = scene.name
        .replace(/’s/, "s")
        .replace(/'s/, "s")
        .replace(/\W/g, "_")
        .replace(/_+/g, "_")
        .replace(/_$/, "")
        .toLowerCase();

      // get img and thumb from the proxy
      let src = await utils.uploadImage(scene.src, uploadDirectory, baseFilename);
      let thumb = await utils.uploadImage(scene.src + "&thumb", uploadDirectory, baseFilename + ".thumb");
      let createData = {
        name: scene.name,
        img: src,
        thumb: thumb,
        folder: folder._id,
        width: scene.width,
        height: scene.height,
        backgroundColor: scene.backgroundColor,
        globalLight: scene.globalLight ? scene.globalLight : true,
      };
      if (scene.shiftX) createData.shiftX = scene.shiftX;
      if (scene.shiftY) createData.shiftY = scene.shiftY;
      if (scene.grid) createData.grid = scene.grid;
      if (scene.gridDistance) createData.gridDistance = scene.gridDistance;
      if (scene.gridType) createData.gridType = scene.gridType;

      existing = await Scene.create(createData);

      if (scene.walls && scene.walls.length > 0) {
        await existing.createEmbeddedEntity("Wall", scene.walls);
      }
      if (scene.lights && scene.lights.length > 0) {
        await existing.createEmbeddedEntity("AmbientLight", scene.lights);
      }
    }
  }
};

const addRollTables = async (data) => {
  //folderName, rollTables, sourcebook) => {
  const folderName = data.title;
  const rollTables = data.rollTables;

  let folder = await getFolder([folderName], "RollTable", data.book);
  let tables = [];
  for (let data of rollTables) {
    console.log(data);
    let rollTable = await RollTable.create({
      name: data.name,
      formula: `1d${data.max}`,
      folder: folder._id,
      flags: {
        vtta: {
          dndbeyond: {
            rollTableId: data.id,
          },
        },
      },
    });
    await rollTable.createEmbeddedEntity("TableResult", data.results);

    tables.push(rollTable);
  }
  return tables;
};

let addPage = (body) => {
  return new Promise(async (resolve, reject) => {
    const { data } = body;

    console.log(data);
    let folderNames = []; //[body.data.module.name];

    let rollTables = [];
    if (data.rollTables && data.rollTables.length > 0) {
      rollTables = await addRollTables(data);
    }
    // add all Journal Entries
    await addJournalEntries(data);
    await addScenes(data);
    resolve(true);
  });
};

export default addPage;

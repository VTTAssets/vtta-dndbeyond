import utils from "../../../utils.js";

// const SAVE_ALL = 0;
// const SAVE_NEW = 1;
// const SAVE_NONE = 2;

const FOLDER_BASE_COLOR = "#98020a"; // DDB red

/**
 * Creates a folder
 * @param {*} rootId
 * @param {*} folderName
 * @param {*} sourcebook
 * @param {*} entityName
 */
const createFolder = async (rootId, folderName, sourcebook, entityName) => {
  const folder = await Folder.create({
    name: folderName,
    type: entityName,
    color: FOLDER_BASE_COLOR,
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

/**
 * Finds a folder
 * @param {*} rootId
 * @param {*} folderName
 * @param {*} sourcebook
 * @param {*} entityName
 */
const findFolder = async (rootId, folderName, sourcebook, entityName) => {
  // try and get the folder
  const folder = await game.folders.entities.find(
    (f) =>
      f.data.type === entityName &&
      f.data.name === folderName &&
      f.data.parent === rootId &&
      f.data.flags.vtta &&
      f.data.flags.vtta.dndbeyond &&
      f.data.flags.vtta.dndbeyond.sourcebook &&
      f.data.flags.vtta.dndbeyond.sourcebook === sourcebook.abbrev.toLowerCase()
  );
  return folder;
};

/**
 * Checks to see if folder exists or creates it
 * @param {*} rootId
 * @param {*} folderName
 * @param {*} sourcebook
 * @param {*} entityName
 */
const getOrCreateFolder = async (rootId, folderName, sourcebook, entityName) => {
  // try and get the folder
  const folder = await findFolder(rootId, folderName, sourcebook, entityName);

  if (folder) {
    return folder._id;
  } else {
    const newFolder = await createFolder(rootId, folderName, sourcebook, entityName);
    return newFolder._id;
  }
};

/**
 * Returns the folder object for the provided details
 * It will create any required folder structures
 * @param {*} structure
 * @param {*} entityName
 * @param {*} sourcebook
 */
const getFolder = async (structure, entityName, sourcebook) => {
  // use reduce to loop over folder structure to create and retrieve the correct
  // parentId to use to lookup the folder
  const parentId = await structure.reduce(async (acc, current) => {
    const accum = await acc;
    return getOrCreateFolder(accum, current, sourcebook, entityName);
  }, Promise.resolve(null));

  const folder = await game.folders.entities.find((folder) => folder._id === parentId);
  return folder;
};


const insertRollTables = (content) => {
  let orig = $("<div>" + content + "</div>");
  let processed = [];
  $(orig)
    .find('div[data-type="rolltable"]')
    .html(/* @this HTMLElement */function () {
      let rollTableId = $(this).attr("data-id");
      if (rollTableId) {
        if (processed.includes(rollTableId)) {
          $(this).remove();
        } else {
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
      return undefined;
    });
  return $(orig).html();
};

const addJournalEntry = async (structure, sourcebook, name, content) => {
  const folder = await getFolder(structure, "JournalEntry", sourcebook);
  const entry = await JournalEntry.create({
    folder: folder._id,
    name: name,
    content: insertRollTables(content),
    img: null,
  });
  return entry;
};

const addJournalEntries = async (data) => {
  // create the folders for all content before we import
  await getFolder([data.title], "JournalEntry", data.book);
  await Promise.all(data.scenes.map(async (scene) => {
    const structure = [data.title, scene.name];
    return getFolder(structure, "JournalEntry", data.book);
  }));

  // add main journal entry
  addJournalEntry([data.title], data.book, data.title, data.content);

  // create sub-entries for all scenes
  for (let scene of data.scenes) {
    for (let entry of scene.entries) {
      addJournalEntry([data.title, scene.name], data.book, entry.name, entry.content);
    }
  }
};


const updateScene = async (scene, folder) => {
  console.log("Scene " + scene.name + " does exist already, updating...");
  let existing = await game.scenes.entities.find((s) => s.name === scene.name && s.data.folder === folder.data._id);
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
};


const createScene = async (scene, folder) => {
  const uploadDirectory = game.settings.get("vtta-dndbeyond", "scene-upload-directory");
  scene.src.split(".").pop();
  const baseFilename = scene.name
    .replace(/’s/, "s")
    .replace(/'s/, "s")
    .replace(/\W/g, "_")
    .replace(/_+/g, "_")
    .replace(/_$/, "")
    .toLowerCase();

  // get img and thumb from the proxy
  const src = await utils.uploadImage(scene.src, uploadDirectory, baseFilename);
  const thumb = await utils.uploadImage(scene.src + "&thumb", uploadDirectory, baseFilename + ".thumb");
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

  let existing = await Scene.create(createData);

  if (scene.walls && scene.walls.length > 0) {
    await existing.createEmbeddedEntity("Wall", scene.walls);
  }
  if (scene.lights && scene.lights.length > 0) {
    await existing.createEmbeddedEntity("AmbientLight", scene.lights);
  }
};

const addScenes = async (data) => {
  const folder = await getFolder([data.book.name, data.title], "Scene", data.book);

  const existingScenes = await Promise.all(data.scenes
    .filter((scene) =>
      game.scenes.entities.some((s) => {
        return (s.name === scene.name && s.data.folder === folder.data._id);
      })
    )
    .map((scene) => {
      return scene.name;
    })
  );

  // check if the scene already exists
  for (let scene of data.scenes) {
    if (existingScenes && existingScenes.includes(scene.name)) {
      updateScene(scene, folder);
    } else {
      createScene(scene, folder);
    }
  }
};

const addRollTable = async (table, folder) => {
  let rollTable = await RollTable.create({
    name: table.name,
    formula: `1d${table.max}`,
    folder: folder._id,
    flags: {
      vtta: {
        dndbeyond: {
          rollTableId: table.id,
        },
      },
    },
  });
  await rollTable.createEmbeddedEntity("TableResult", table.results);
  return rollTable;
};

const addRollTables = async (data) => {
  // folderName, rollTables, sourcebook) => {
  const folderName = data.title;
  const rollTables = data.rollTables;

  let folder = await getFolder([folderName], "RollTable", data.book);

  const tables = await Promise.all(rollTables.map(async (table) => {
    return addRollTable(table, folder);
  }));
  return tables;
};


const parsePage = async (data) => {
  var tables;
  if (data.rollTables && data.rollTables.length > 0) {
    tables = await addRollTables(data);
  }
  // add all Journal Entries
  var journals = await addJournalEntries(data);
  var scenes = await addScenes(data);

  return [tables, journals, scenes];
};

let addPage = (body) => {
  return new Promise((resolve, reject) => {
    const { data } = body;

    parsePage(data).then(() => {
      resolve(true);
    }).catch((error) => {
      console.error(`error parsing page: ${error}`);
      reject(error);
    });
  });
};

export default addPage;

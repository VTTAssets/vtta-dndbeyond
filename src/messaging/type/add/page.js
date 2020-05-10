const SAVE_ALL = 0;
const SAVE_NEW = 1;
const SAVE_NONE = 2;

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

  let parent = null;
  for (let i = 0; i < structure.length; i++) {
    console.log("FOLDER: " + structure[i]);
    parent = await getOrCreateFolder(parent, structure[i]);
  }

  return parent;
};

const combineContent = (section, depth = 1) => {
  let content = depth !== 1 ? `<h${depth}>${section.title}</h${depth}>` : "";
  content += insertRollTables(section.content.join(""));

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

export default addPage;

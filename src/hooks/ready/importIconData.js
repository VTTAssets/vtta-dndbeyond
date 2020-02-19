if (game.modules.find(module => module.id === "vtta-iconizer")) {
}

let iconData = new Map();
let iconDatabasePolicy = game.settings.get(
  "vtta-iconizer",
  "icon-database-policy"
);

// load the icon database
if (iconDatabasePolicy === 0 || iconDatabasePolicy === 1) {
  let path = "/modules/vtta-iconizer/data/icons.json";
  let fileExists = await utils.serverFileExists(path);
  if (fileExists) {
    let response = await fetch(path, { method: "GET" });
    let json = await response.json();
    json.forEach(data => {
      iconData.set(data.name.toLowerCase(), data.icon);
    });
  }
}

// load the custom icon database (if there is any)
if (iconDatabasePolicy === 1 || iconDatabasePolicy === 2) {
  let path = `/${game.settings.get(
    "vtta-iconizer",
    "icon-directory"
  )}/icons.json`;
  let fileExists = await utils.serverFileExists(path);
  if (fileExists) {
    let response = await fetch(path, { method: "GET" });
    let json = await response.json();
    json.forEach(data => {
      iconData.set(data.name.toLowerCase(), data.icon);
    });
  }
}

/**
 * Replaces the icon if the name changed and if the game settings allow that
 */
let replaceIcon = options => {
  // if there is no name change here, just continue
  if (!options || !options.name) return options;

  const REPLACEMENT_POLICY_REPLACE_ALL = 0;
  const REPLACEMENT_POLICY_REPLACE_DEFAULT = 1;
  const REPLACEMENT_POLICY_REPLACE_NONE = 2;

  let replacementPolicy = game.settings.get(
    "vtta-iconizer",
    "replacement-policy"
  );

  // stop right here if we should not replace anything
  if (replacementPolicy === REPLACEMENT_POLICY_REPLACE_NONE) return;

  //

  if (
    replacementPolicy === REPLACEMENT_POLICY_REPLACE_ALL ||
    (replacementPolicy === REPLACEMENT_POLICY_REPLACE_DEFAULT &&
      (!options.img || options.img.toLowerCase().indexOf("mystery-man") !== -1))
  ) {
    let name = options.name
      .toLowerCase()
      .replace(/\([^)]*\)/g, "")
      .trim();
    let newIcon = iconData.get(name);

    if (newIcon !== undefined) {
      let directory = game.settings.get("vtta-iconizer", "icon-directory");
      options.img = directory + "/" + newIcon;
    } else {
      if (replacementPolicy === 0) {
        options.img = "icons/svg/mystery-man.svg";
      }
    }
  }
  return options;
};

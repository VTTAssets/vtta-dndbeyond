import SettingsExtender from "./settingsExtender.js";
SettingsExtender();

export default function () {
  const actorCompendiums = game.packs
    .filter((pack) => pack.entity === "Actor")
    .reduce((choices, pack) => {
      choices[pack.collection] = pack.metadata.label;
      return choices;
    }, {});

  const itemCompendiums = game.packs
    .filter((pack) => pack.entity === "Item")
    .reduce((choices, pack) => {
      choices[pack.collection] = pack.metadata.label;
      return choices;
    }, {});

  console.log(itemCompendiums);

  game.settings.register("vtta-dndbeyond", "image-upload-directory", {
    name: "vtta-dndbeyond.image-upload-directory.name",
    hint: "vtta-dndbeyond.image-upload-directory.hint",
    scope: "world",
    config: true,
    //type: String,
    type: Azzu.SettingsTypes.DirectoryPicker,
    default: "",
  });

  game.settings.register("vtta-dndbeyond", "entity-import-policy", {
    name: "vtta-dndbeyond.entity-import-policy.name",
    hint: "vtta-dndbeyond.entity-import-policy.hint",
    scope: "world",
    config: true,
    type: Number,
    default: 2,
    choices: [
      "vtta-dndbeyond.entity-import-policy.0",
      "vtta-dndbeyond.entity-import-policy.1",
      "vtta-dndbeyond.entity-import-policy.2",
    ],
  });

  game.settings.register("vtta-dndbeyond", "entity-item-compendium", {
    name: "vtta-dndbeyond.entity-item-compendium.name",
    hint: "vtta-dndbeyond.entity-item-compendium.hint",
    scope: "world",
    config: true,
    type: String,
    isSelect: true,
    choices: itemCompendiums,
  });

  //   game.settings.set('vtta-dndbeyond', 'entity-item-compendium', null);
  // Promise {<pending>}
  // game.settings.set('vtta-dndbeyond', 'entity-spell-compendium', null);
  // Promise {<pending>}
  // game.settings.set('vtta-dndbeyond', 'entity-monster-compendium', null);

  game.settings.register("vtta-dndbeyond", "entity-spell-compendium", {
    name: "vtta-dndbeyond.entity-spell-compendium.name",
    hint: "vtta-dndbeyond.entity-spell-compendium.hint",
    scope: "world",
    config: true,
    type: String,
    isSelect: true,
    choices: itemCompendiums,
  });

  game.settings.register("vtta-dndbeyond", "entity-monster-compendium", {
    name: "vtta-dndbeyond.entity-monster-compendium.name",
    hint: "vtta-dndbeyond.entity-monster-compendium.hint",
    scope: "world",
    config: true,
    type: String,
    isSelect: true,
    choices: actorCompendiums,
  });

  // check for failed registered settings
  let hasErrors = false;
  if (game.settings.settings instanceof Map) {
    for (let s of game.settings.settings.values()) {
      if (s.module !== "vtta-dndbeyond") continue;
      try {
        game.settings.get(s.module, s.key);
      } catch (err) {
        hasErrors = true;
        ui.notifications.info(
          `[${s.module}] Erroneous module settings found, resetting to default.`
        );
        game.settings.set(s.module, s.key, s.default);
      }
    }
  } else {
    for (let prop in game.settings.settings) {
      let s = game.settings.settings[prop];
      if (s.module !== "vtta-dndbeyond") continue;
      try {
        game.settings.get(s.module, s.key);
      } catch (err) {
        hasErrors = true;
        ui.notifications.info(
          `[${s.module}] Erroneous module settings found, resetting to default.`
        );
        game.settings.set(s.module, s.key, s.default);
      }
    }
  }
  if (hasErrors) {
    ui.notifications.warn(
      "Please review the module settings to re-adjust them to your desired configuration."
    );
  }
}

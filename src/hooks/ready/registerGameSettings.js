import DirectoryPicker from "../../lib/DirectoryPicker.js";

export default function () {
  const actorCompendiums = game.packs
    .filter((pack) => pack.entity === "Actor")
    .reduce((choices, pack) => {
      choices[pack.collection] = `[${pack.metadata.package}] ${pack.metadata.label}`;
      return choices;
    }, {});

  const itemCompendiums = game.packs
    .filter((pack) => pack.entity === "Item")
    .reduce((choices, pack) => {
      choices[pack.collection] = `[${pack.metadata.package}] ${pack.metadata.label}`;
      return choices;
    }, {});

  game.settings.register("vtta-dndbeyond", "image-upload-directory", {
    name: "vtta-dndbeyond.image-upload-directory.name",
    hint: "vtta-dndbeyond.image-upload-directory.hint",
    scope: "world",
    config: true,
    type: DirectoryPicker.Directory,
    default: "[data] ",
  });

  game.settings.register("vtta-dndbeyond", "scene-upload-directory", {
    name: "vtta-dndbeyond.scene-upload-directory.name",
    hint: "vtta-dndbeyond.scene-upload-directory.hint",
    scope: "world",
    config: true,
    type: DirectoryPicker.Directory,
    default: "[data] ",
  });

  game.settings.register("vtta-dndbeyond", "scene-format", {
    name: "vtta-dndbeyond.scene-format.name",
    hint: "vtta-dndbeyond.scene-format.hint",
    scope: "world",
    config: true,
    type: String,
    choices: ["vtta-dndbeyond.scene-format.0", "vtta-dndbeyond.scene-format.1"],
    default: 0,
  });

  game.settings.register("vtta-dndbeyond", "entity-import-policy", {
    name: "vtta-dndbeyond.entity-import-policy.name",
    hint: "vtta-dndbeyond.entity-import-policy.hint",
    scope: "world",
    config: true,
    type: Number,
    default: 1,
    choices: [
      "vtta-dndbeyond.entity-import-policy.0",
      "vtta-dndbeyond.entity-import-policy.1",
      "vtta-dndbeyond.entity-import-policy.2",
    ],
  });

  game.settings.register("vtta-dndbeyond", "entity-cleanup-policy", {
    name: "vtta-dndbeyond.entity-cleanup-policy.name",
    hint: "vtta-dndbeyond.entity-cleanup-policy.hint",
    scope: "world",
    config: true,
    type: Number,
    default: 0,
    choices: [
      "vtta-dndbeyond.entity-cleanup-policy.0",
      "vtta-dndbeyond.entity-cleanup-policy.1",
      "vtta-dndbeyond.entity-cleanup-policy.2",
      "vtta-dndbeyond.entity-cleanup-policy.3",
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

  game.settings.register("vtta-dndbeyond", "entity-feature-compendium", {
    name: "vtta-dndbeyond.entity-feature-compendium.name",
    hint: "vtta-dndbeyond.entity-feature-compendium.hint",
    scope: "world",
    config: true,
    type: String,
    isSelect: true,
    choices: itemCompendiums,
  });

  // game.settings.register("vtta-dndbeyond", "entity-class-compendium", {
  //   name: "vtta-dndbeyond.entity-class-compendium.name",
  //   hint: "vtta-dndbeyond.entity-class-compendium.hint",
  //   scope: "world",
  //   config: true,
  //   type: String,
  //   isSelect: true,
  //   choices: itemCompendiums,
  // });

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

  game.settings.register("vtta-dndbeyond", "entity-monster-feature-compendium", {
    name: "vtta-dndbeyond.entity-monster-feature-compendium.name",
    hint: "vtta-dndbeyond.entity-monster-feature-compendium.hint",
    scope: "world",
    config: true,
    type: String,
    isSelect: true,
    choices: itemCompendiums,
  });

  game.settings.register("vtta-dndbeyond", "log-level", {
    name: "vtta-dndbeyond.log-level.name",
    hint: "vtta-dndbeyond.log-level.hint",
    scope: "world",
    config: true,
    type: String,
    choices: {
      "VERBOSE": "VERBOSE",
      "DEBUG": "DEBUG",
      "INFO": "INFO",
      "WARN": "WARN",
      "ERR": "ERROR",
      "FATAL": "FATAL",
      "OFF": "OFF"
    },
    default: "INFO"
  });

  /** Character update settings, stored per user and non-configurable in the settings screen */
  game.settings.register("vtta-dndbeyond", "character-update-policy-new", {
    name: "vtta-dndbeyond.character-update-policy-new.name",
    hint: "vtta-dndbeyond.character-update-policy-new.hint",
    scope: "player",
    config: false,
    type: Boolean,
    default: false,
  });

  game.settings.register("vtta-dndbeyond", "character-update-policy-use-existing", {
    name: "vtta-dndbeyond.character-update-policy-use-existing.name",
    hint: "vtta-dndbeyond.character-update-policy-use-existing.hint",
    scope: "player",
    config: false,
    type: Boolean,
    default: false,
  });

  game.settings.register("vtta-dndbeyond", "character-update-policy-class", {
    name: "vtta-dndbeyond.character-update-policy-class.name",
    hint: "vtta-dndbeyond.character-update-policy-class.hint",
    scope: "player",
    config: false,
    type: Boolean,
    default: true,
  });

  game.settings.register("vtta-dndbeyond", "character-update-policy-feat", {
    name: "vtta-dndbeyond.character-update-policy-feat.name",
    hint: "vtta-dndbeyond.character-update-policy-feat.hint",
    scope: "player",
    config: false,
    type: Boolean,
    default: true,
  });

  game.settings.register("vtta-dndbeyond", "character-update-policy-weapon", {
    name: "vtta-dndbeyond.character-update-policy-weapon.name",
    hint: "vtta-dndbeyond.character-update-policy-weapon.hint",
    scope: "player",
    config: false,
    type: Boolean,
    default: true,
  });

  game.settings.register("vtta-dndbeyond", "character-update-policy-equipment", {
    name: "vtta-dndbeyond.character-update-policy-equipment.name",
    hint: "vtta-dndbeyond.character-update-policy-equipment.hint",
    scope: "player",
    config: false,
    type: Boolean,
    default: true,
  });

  game.settings.register(
    "vtta-dndbeyond",
    "character-update-policy-inventory", // = consumable, tool & loot
    {
      name: "vtta-dndbeyond.character-update-policy-inventory.name",
      hint: "vtta-dndbeyond.character-update-policy-inventory.hint",
      scope: "player",
      config: false,
      type: Boolean,
      default: true,
    }
  );

  game.settings.register("vtta-dndbeyond", "character-update-policy-currency", {
    name: "vtta-dndbeyond.character-update-policy-currency.name",
    hint: "vtta-dndbeyond.character-update-policy-currency.hint",
    scope: "player",
    config: false,
    type: Boolean,
    default: true,
  }
  );

  game.settings.register("vtta-dndbeyond", "character-update-policy-spell", {
    name: "vtta-dndbeyond.character-update-policy-spell.name",
    hint: "vtta-dndbeyond.character-update-policy-spell.hint",
    scope: "player",
    config: false,
    type: Boolean,
    default: true,
  });

  // sets the current tutorial step the user has completed
  game.settings.register("vtta-dndbeyond", "tutorial-step", {
    scope: "world",
    config: false,
    type: Number,
    default: 0,
  });
  // sets the current tutorial step the user has completed
  game.settings.register("vtta-dndbeyond", "tutorial-user", {
    scope: "world",
    config: false,
    type: String,
    default: "",
  });
  // sets the current tutorial step the user has completed
  game.settings.register("vtta-dndbeyond", "popup-version", {
    scope: "world",
    config: false,
    type: String,
    default: "1.0.0",
  });
  // sets the user submission name for scene adjustments
  game.settings.register("vtta-dndbeyond", "scene-submission-username", {
    scope: "user",
    config: false,
    type: String,
    default: "",
  });
}

import DICTIONARY from "../dictionary.js";
import utils from "../../utils.js";

let getProficiencies = data => {
  let sections = [];
  for (let section in data.character.modifiers) {
    sections.push(data.character.modifiers[section]);
  }

  let proficiencies = [];
  sections.forEach(section => {
    let entries = section.filter(entry => entry.type === "proficiency");
    proficiencies = proficiencies.concat(entries);
  });

  proficiencies = proficiencies.map(proficiency => {
    return { name: proficiency.friendlySubtypeName };
  });

  return proficiencies;
};

let getLevel = data => {
  return data.character.classes.reduce((prev, cur) => prev + cur.level, 0);
};

/**
 * Retrieves character abilities, including proficiency on saving throws
 * @param {obj} data JSON Import
 * @param {obj} character Character template
 */
let getAbilities = (data, character) => {
  // go through every ability

  let result = {};
  DICTIONARY.character.abilities.forEach(ability => {
    result[ability.value] = {
      value: 0,
      min: 3,
      proficient: 0
    };

    let stat =
      data.character.stats.find(stat => stat.id === ability.id).value || 0;
    let bonusStat =
      data.character.bonusStats.find(stat => stat.id === ability.id).value || 0;
    let overrideStat =
      data.character.overrideStats.find(stat => stat.id === ability.id).value ||
      0;

    let bonus = [data.character.modifiers.race, data.character.modifiers.class]
      .flat()
      .filter(mod => mod.type === "bonus" && mod.entityId === ability.id)
      .reduce((prev, cur) => prev + cur.value, 0);

    // calculate value, mod and proficiency
    result[ability.value].value =
      overrideStat === 0 ? stat + bonusStat + bonus : overrideStat;
    result[ability.value].mod = utils.calculateModifier(
      result[ability.value].value
    );
    result[ability.value].proficient =
      data.character.modifiers.class.find(
        mod =>
          mod.subType === ability.long + "-saving-throws" &&
          mod.type === "proficiency"
      ) !== undefined
        ? 1
        : 0;
  });

  return result;
};

let getHitDice = (data, character) => {
  let used = data.character.classes.reduce(
    (prev, cls) => prev + cls.hitDiceUsed,
    0
  );
  let total = data.character.classes.reduce((prev, cls) => prev + cls.level, 0);
  return {
    value: total - used,
    min: 1,
    max: total
  };
};

let getDeathSaves = (data, character) => {
  return {
    success: data.character.deathSaves.successCount || 0,
    failure: data.character.deathSaves.failCount || 0
  };
};

let getExhaustion = (data, character) => {
  let condition = data.character.conditions.find(
    condition => (condition.id = 4)
  );
  let level = condition ? condition.level : 0;
  return level;
};

let isArmored = data => {
  return (
    data.character.inventory.filter(
      item => item.equipped && item.definition.armorClass
    ).length >= 1
  );
};

let getArmorClass = (data, character) => {
  // unarmored class?
  let armorClassValues = [];

  let isUnarmoredClass = data.character.modifiers.class.filter(
    modifier =>
      modifier.type === "set" && modifier.subType === "unarmored-armor-class"
  );
  if (isUnarmoredClass.length !== 0 && isArmored(data) === false) {
    let unarmedACValue = 10;
    // +DEX
    unarmedACValue += character.data.abilities.dex.mod;
    // +WIS or +CON, if monk or barbarian, draconic resilience === null
    if (isUnarmoredClass[0].statId !== null) {
      let ability = DICTIONARY.character.abilities.find(
        ability => ability.id === isUnarmoredClass[0].statId
      );
      unarmedACValue += character.data.abilities[ability.value].mod;
      //unarmedACValue += DDBUtils.modifier(this.getAbility(DDBUtils.statIdToAbilityAbbrev(isUnarmoredClass[0].statId)).value);
    } else {
      // draconic resilience = 13 + dex
      unarmedACValue += 3;
    }

    armorClassValues.push({
      name: "Unarmored Defense",
      value: unarmedACValue
    });
  }

  if (isArmored(data) === false) {
    armorClassValues.push({
      name: "Unarmored",
      value: 10 + character.data.abilities.dex.mod
    });
  }

  let armorTypes = [];
  let equippedGear = data.character.inventory.filter(item => item.equipped);
  let ac = equippedGear.reduce((prev, item) => {
    let ac = 0;
    // regular armor
    if (item.definition.armorClass) {
      // note the armor type
      armorTypes.push(item.definition.type);
      ac += item.definition.armorClass;
    }

    // magical armor
    if (item.definition.grantedModifiers) {
      let isAvailable = false;
      // does an item need attuning
      if (item.definition.canAttune === true) {
        if (item.isAttuned === true) {
          isAvailable = true;
        }
      } else {
        isAvailable = true;
      }

      if (isAvailable) {
        item.definition.grantedModifiers.forEach(modifier => {
          if (modifier.type === "bonus" && modifier.subType === "armor-class") {
            // add this to armor AC
            ac += modifier.value;
            // add this to the unarmored defense etc., too
            armorClassValues.forEach(
              (cur, index, arr) =>
                (arr[index].value = cur.value + modifier.value)
            );
          }
        });
      }
    }
    return prev + ac;
  }, 0);

  // Light Armor: AC + DEX
  // Medium ARmor: AC + DEX (max 2)
  // Heavy Armor: AC only
  if (armorTypes.includes("Heavy Armor")) {
    armorClassValues.push({
      name: "Armored",
      value: ac
    });
  } else {
    if (armorTypes.includes("Medium Armor")) {
      armorClassValues.push({
        name: "Armored",
        value: ac + Math.min(2, character.data.abilities.dex.mod)
      });
    } else {
      armorClassValues.push({
        name: "Armored",
        value: ac + character.data.abilities.dex.mod
      });
    }
  }

  let max = Math.max.apply(
    Math,
    armorClassValues.map(function(type) {
      return type.value;
    })
  );
  return {
    type: "Number",
    label: "Armor Class",
    value: max
  };
};

let getHitpoints = (data, character) => {
  let constitutionHP =
    character.data.abilities.con.mod * character.data.details.level.value;
  let baseHitPoints = data.character.baseHitPoints || 0;
  let bonusHitPoints = data.character.bonusHitPoints || 0;
  let overrideHitPoints = data.character.overrideHitPoints || 0;
  let removedHitPoints = data.character.removedHitPoints || 0;
  let temporaryHitPoints = data.character.temporaryHitPoints || 0;

  let hitPointsPerLevel = [
    data.character.modifiers.class,
    data.character.modifiers.race,
    data.character.modifiers.background
  ]
    .flat()
    .filter(
      modifier =>
        modifier.type === "bonus" && modifier.subType === "hit-points-per-level"
    )
    .reduce((prev, cur) => prev + cur.value, 0);
  baseHitPoints += hitPointsPerLevel * character.data.details.level.value;

  let tough = data.character.feats.find(feat => feat.definition.id === 49);
  if (tough) {
    baseHitPoints += character.data.details.level.value * 2;
  }

  return {
    value:
      overrideHitPoints === 0
        ? constitutionHP + baseHitPoints + bonusHitPoints - removedHitPoints
        : overrideHitPoints - removedHitPoints,
    min: 0,
    max: constitutionHP + baseHitPoints + bonusHitPoints,
    temp: temporaryHitPoints,
    tempmax: temporaryHitPoints
  };
};

let getSpeed = (data, character) => {
  // For all processing, we take into account the regular movement types of this character
  let movementTypes = {};
  for (let type in data.character.race.weightSpeeds.normal) {
    if (data.character.race.weightSpeeds.normal[type] !== 0) {
      movementTypes[type] = data.character.race.weightSpeeds.normal[type];
    }
  }

  for (let type in movementTypes) {
    // is there a 'inntate-speed-[type]ing' race/class modifier?
    let innateSpeeds = data.character.modifiers.race.filter(
      modifier =>
        modifier.type === "set" &&
        modifier.subType === `innate-speed-${type}'ing`
    );
    let base = movementTypes[type];
    innateSpeeds.forEach(speed => {
      if (speed.value > base) {
        // take the highest value
        base = max;
      }
    });
    // overwrite the (perhaps) changed value
    movementTypes[type] = base;
  }

  // unarmored movement for barbarians and monks
  if (!isArmored(data)) {
    let bonusSpeeds = data.character.modifiers.class.filter(
      modifier =>
        modifier.type === "bonus" && modifier.subType === "unarmored-movement"
    );
    // add all bonus speeds to each movement type
    bonusSpeeds.forEach(bonusSpeed => {
      for (let type in movementTypes) {
        movementTypes[type] += bonusSpeed.value;
      }
    });
  }

  let special = "";
  for (let type in movementTypes) {
    if (type !== "walk") {
      special += utils.capitalize(type) + " " + movementTypes[type] + " ft, ";
    }
  }
  special = special.substr(0, special.length - 2);

  return {
    value: movementTypes.walk + " ft",
    special: special
  };
};

// is there a spell casting ability?
let hasSpellCastingAbility = spellCastingAbilityId => {
  return DICTIONARY.character.abilities.find(
    ability => ability.id === spellCastingAbilityId
  ) !== undefined;
};

// convert spellcasting ability id to string used by vtta
let convertSpellCastingAbilityId = spellCastingAbilityId => {
  return DICTIONARY.character.abilities.find(
    ability => ability.id === spellCastingAbilityId
  ).value;
};

let getSpellCasting = (data, character) => {
  let result = [];
  data.character.classSpells.forEach(playerClass => {
    let classInfo = data.character.classes.find(
      cls => cls.id === playerClass.characterClassId
    );
    let spellCastingAbility = undefined;
    if (hasSpellCastingAbility(classInfo.definition.spellCastingAbilityId)) {
      // check to see if class has a spell casting ability
      spellCastingAbility = convertSpellCastingAbilityId(
        classInfo.definition.spellCastingAbilityId
      );
    } else if (classInfo.subclassDefinition &&
        hasSpellCastingAbility(
          classInfo.subclassDefinition.spellCastingAbilityId
      )) {
      //some subclasses attach a spellcasting ability, e.g. Arcane Trickster
      spellCastingAbility = convertSpellCastingAbilityId(
        classInfo.subclassDefinition.spellCastingAbilityId
      );
    };
    if (spellCastingAbility !== undefined) {
      let abilityModifier = utils.calculateModifier(
        character.data.abilities[spellCastingAbility].value
      );
      result.push({ label: spellCastingAbility, value: abilityModifier })
    };
  });
  // we need to decide on one spellcasting ability, so we take the one with the highest modifier
  if (result.length === 0) {
    return "";
  } else {
    return result
      .sort((a, b) => {
        if (a.value > b.value) return -1;
        if (a.value < b.value) return 1;
        return 0;
      })
      .map(entry => entry.label)[0];
  }
};

let getSpellDC = (data, character) => {
  if (character.data.attributes.spellcasting === "") {
    return 10;
  } else {
    return (
      8 +
      character.data.abilities[character.data.attributes.spellcasting].mod +
      character.data.attributes.prof
    );
  }
};

let getResources = data => {
  // get all resources
  let resources = [
    data.character.actions.race,
    data.character.actions.class,
    data.character.actions.feat
  ]
    .flat()
    //let resources = data.character.actions.class
    .filter(action => action.limitedUse && action.limitedUse.maxUses)
    .map(action => {
      return {
        label: action.name,
        value: action.limitedUse.maxUses - action.limitedUse.numberUsed,
        max: action.limitedUse.maxUses,
        sr: action.limitedUse.resetType === 1,
        lr:
          action.limitedUse.resetType === 1 || action.limitedUse.resetType === 2
      };
    })
    // sort by maxUses, I guess one wants to track the most uses first, because it's used more often
    .sort((a, b) => {
      if (a.max > b.max) return -1;
      if (a.max < b.max) return 1;
      return 0;
    })
    // get only the first three
    .slice(0, 3);

  let result = {
    primary:
      resources.length >= 1
        ? resources[0]
        : { value: 0, max: 0, sr: false, lr: false, label: "" },
    secondary:
      resources.length >= 2
        ? resources[1]
        : { value: 0, max: 0, sr: false, lr: false, label: "" },
    tertiary:
      resources.length >= 3
        ? resources[2]
        : { value: 0, max: 0, sr: false, lr: false, label: "" }
  };
  return result;
};

let getBackground = data => {
  if (data.character.background.hasCustomBackground === false) {
    if (data.character.background.definition !== null) {
      return data.character.background.definition.name || "";
    } else {
      return "";
    }
  } else {
    return data.character.background.customBackground.name || "";
  }
};

let getTrait = data => {
  let result = data.character.traits.personalityTraits;
  if (result !== null) {
    result = result
      .split("\n")
      .map(e => "<p>" + e + "</p>")
      .reduce((prev, cur) => prev + cur);
    result = result.replace("<p></p>", "");
  } else {
    result = "";
  }
  return result;
};

let getIdeal = data => {
  let result = data.character.traits.ideals;
  if (result !== null) {
    result = result
      .split("\n")
      .map(e => "<p>" + e + "</p>")
      .reduce((prev, cur) => prev + cur);
    result = result.replace("<p></p>", "");
  } else {
    result = "";
  }
  return result;
};

let getBond = data => {
  let result = data.character.traits.bonds;
  if (result !== null) {
    result = result
      .split("\n")
      .map(e => "<p>" + e + "</p>")
      .reduce((prev, cur) => prev + cur);
    result = result.replace("<p></p>", "");
  } else {
    result = "";
  }
  return result;
};

let getFlaw = data => {
  let result = data.character.traits.flaws;
  if (result !== null) {
    result = result
      .split("\n")
      .map(e => "<p>" + e + "</p>")
      .reduce((prev, cur) => prev + cur);
    result = result.replace("<p></p>", "");
  } else {
    result = "";
  }
  return result;
};

/**
 * Gets the character's alignment
 * Defaults to Neutral, if not set in DDB
 * @todo: returns .name right now, should switch to .value once the DND5E options are fully implemented
 */
let getAlignment = data => {
  let alignmentID = data.character.alignmentId || 5;
  let alignment = DICTIONARY.character.alignments.find(
    alignment => alignment.id === alignmentID
  ); // DDBUtils.alignmentIdtoAlignment(alignmentID);
  return alignment.name;
};

let getBiography = data => {
  let format = (heading, text) => {
    text = text
      .split("\n")
      .map(text => `<p>${text}</p>`)
      .join("");
    return `<h2>${heading}</h2>${text}`;
  };

  let personalityTraits = data.character.traits.personalityTraits
    ? format("Personality Traits", data.character.traits.personalityTraits)
    : "";
  let ideals = data.character.traits.ideals
    ? format("Ideals", data.character.traits.ideals)
    : "";
  let bonds = data.character.traits.bonds
    ? format("Bonds", data.character.traits.bonds)
    : "";
  let flaws = data.character.traits.flaws
    ? format("Flaws", data.character.traits.flaws)
    : "";

  let traits =
    personalityTraits !== "" || ideals !== "" || bonds !== "" || flaws !== ""
      ? "<h1>Traits</h1>" + personalityTraits + ideals + bonds + flaws
      : "";

  let backstory =
    data.character.notes.backstory !== null
      ? "<h2>Backstory</h2><p>" + data.character.notes.backstory + "</p>"
      : "";

  if (data.character.background.hasCustomBackground === true) {
    let bg = data.character.background.customBackground;

    let result = bg.name ? "<h1>" + bg.name + "</h1>" : "";
    result += bg.description ? "<p>" + bg.description + "</p>" : "";
    if (bg.featuresBackground) {
      result += "<h2>" + bg.featuresBackground.name + "</h2>";
      result += bg.featuresBackground.shortDescription.replace("\r\n", "");
      result += "<h3>" + bg.featuresBackground.featureName + "</h3>";
      result += bg.featuresBackground.featureDescription.replace("\r\n", "");
    }
    if (
      bg.characteristicsBackground &&
      bg.featuresBackground &&
      bg.featuresBackground.entityTypeId !=
        bg.characteristicsBackground.entityTypeId
    ) {
      result += "<h2>" + bg.characteristicsBackground.name + "</h2>";
      result += bg.characteristicsBackground.shortDescription.replace(
        "\r\n",
        ""
      );
      result += "<h3>" + bg.characteristicsBackground.featureName + "</h3>";
      result += bg.characteristicsBackground.featureDescription.replace(
        "\r\n",
        ""
      );
    }

    return {
      public: result + backstory + traits,
      value: result + backstory + traits
    };
  } else {
    if (data.character.background.definition !== null) {
      let bg = data.character.background.definition;

      let result = "<h1>" + bg.name + "</h1>";
      result += bg.shortDescription.replace("\r\n", "");
      if (bg.featureName) {
        result += "<h2>" + bg.featureName + "</h2>";
        result += bg.featureDescription.replace("\r\n", "");
      }
      return {
        public: result + backstory + traits,
        value: result + backstory + traits
      };
    } else {
      return {
        public: "" + backstory + traits,
        value: "" + backstory + traits
      };
    }
  }
};

let getSkills = (data, character) => {
  let result = {};
  DICTIONARY.character.skills.forEach(skill => {
    let modifiers = [
      data.character.modifiers.class,
      data.character.modifiers.race,
      data.character.modifiers.background
    ]
      .flat()
      .filter(modifier => modifier.friendlySubtypeName === skill.label)
      .map(mod => mod.type);

    // Jack of All trades or expertise?
    let defaultProficiency =
      data.character.modifiers.class.find(
        modifier =>
          modifier.type === "half-proficiency" &&
          modifier.subType === "ability-checks"
      ) !== undefined
        ? 0.5
        : 0;

    let proficient = modifiers.includes("expertise")
      ? 2
      : modifiers.includes("proficiency")
      ? 1
      : defaultProficiency;

    let value =
      character.data.abilities[skill.ability].value +
      2 * character.data.attributes.prof * proficient;

    result[skill.name] = {
      type: "Number",
      label: skill.label,
      ability: skill.ability,
      value: proficient,
      mod: utils.calculateModifier(value)
    };
  });

  return result;
};

let getArmorProficiencies = (data, character) => {
  let values = [];
  let custom = [];

  // lookup the characters's proficiencies in the DICT
  let allProficiencies = DICTIONARY.character.proficiencies.filter(
    prof => prof.type === "Armor"
  );
  character.flags.vtta.dndbeyond.proficiencies.forEach(prof => {
    if (prof.name === "Light Armor" && !values.includes("lgt")) {
      values.push("lgt");
    }
    if (prof.name === "Medium Armor" && !values.includes("med")) {
      values.push("med");
    }
    if (prof.name === "Heavy Armor" && !values.includes("hvy")) {
      values.push("hvy");
    }
    if (prof.name === "Shields" && !values.includes("shl")) {
      values.push("shl");
    }
    if (
      allProficiencies.find(p => p.name === prof.name) !== undefined &&
      !custom.includes(prof.name)
    ) {
      custom.push(prof.name);
    }
  });

  return {
    value: [...new Set(values)],
    custom: [...new Set(custom)].join(";")
  };
};
/*
DND5E.toolProficiencies = {
  "art": "Artisan's Tools",
  "disg": "Disguise Kit",
  "forg": "Forgery Kit",
  "game": "Gaming Set",
  "herb": "Herbalism Kit",
  "music": "Musical Instrument",
  "navg": "Navigator's Tools",
  "pois": "Poisoner's Kit",
  "thief": "Thieves' Tools",
  "vehicle": "Vehicle (Land or Water)"
};
*/
let getToolProficiencies = (data, character) => {
  let values = [];
  let custom = [];

  // lookup the characters's proficiencies in the DICT
  let allProficiencies = DICTIONARY.character.proficiencies.filter(
    prof => prof.type === "Tool"
  );
  character.flags.vtta.dndbeyond.proficiencies.forEach(prof => {
    if (prof.name === "Artisan's Tools" && !values.includes("art")) {
      values.push("art");
    }
    if (prof.name === "Disguise Kit" && !values.includes("disg")) {
      values.push("disg");
    }
    if (prof.name === "Forgery Kit" && !values.includes("forg")) {
      values.push("forg");
    }
    if (prof.name === "Gaming Set" && !values.includes("game")) {
      values.push("game");
    }
    if (prof.name === "Musical Instrument" && !values.includes("music")) {
      values.push("music");
    }
    if (prof.name === "Thieves' Tools" && !values.includes("thief")) {
      values.push("thief");
    }
    if (prof.name === "Navigator's Tools" && !values.includes("navg")) {
      values.push("navg");
    }
    if (prof.name === "Poisoner's Kit" && !values.includes("pois")) {
      values.push("pois");
    }
    if (
      (prof.name === "Vehicle (Land or Water)" ||
        prof.name === "Vehicle (Land)" ||
        prof.name === "Vehicle (Water)") &&
      !values.includes("vehicle")
    ) {
      values.push("vehicle");
    }
    if (
      allProficiencies.find(p => p.name === prof.name) !== undefined &&
      !custom.includes(prof.name)
    ) {
      custom.push(prof.name);
    }
  });

  return {
    value: [...new Set(values)],
    custom: [...new Set(custom)].join(";")
  };
};

let getWeaponProficiencies = (data, character) => {
  let values = [];
  let custom = [];

  // lookup the characters's proficiencies in the DICT
  let allProficiencies = DICTIONARY.character.proficiencies.filter(
    prof => prof.type === "Weapon"
  );
  character.flags.vtta.dndbeyond.proficiencies.forEach(prof => {
    if (prof.name === "Simple Weapons" && !values.includes("sim")) {
      values.push("sim");
    }
    if (prof.name === "Martial Weapons" && !values.includes("mar")) {
      values.push("mar");
    }
    if (
      allProficiencies.find(p => p.name === prof.name) !== undefined &&
      !custom.includes(prof.name)
    ) {
      custom.push(prof.name);
    }
  });

  return {
    value: [...new Set(values)],
    custom: [...new Set(custom)].join(", ")
  };
};

let getSize = data => {
  let size = DICTIONARY.character.actorSizes.find(
    size => size.name === data.character.race.size
  );
  return size ? size.value : "med";
};

let getSenses = data => {
  let senses = [];
  let hasDarkvision = false;
  // custom senses
  if (data.character.customSenses) {
    data.character.customSenses.forEach(sense => {
      let s = DICTIONARY.character.senses.find(s => s.id === sense.senseId);

      let senseName = s ? s.name : null;
      // remember that this darkvision has precedence
      if (senseName === "Darkvision") hasDarkvision = true;

      // remember this sense
      senses.push({ name: senseName, value: sense.distance });
    });
  }

  if (!hasDarkvision) {
    let sense = data.character.modifiers.race.find(
      modifier =>
        modifier.type === "set-base" && modifier.subType === "darkvision"
    );
    if (sense && sense.value) {
      senses.push({ name: sense.friendlySubtypeName, value: sense.value });
    }
  }
  // sort the senses alphabetically
  senses = senses.sort((a, b) => a.name >= b.name);

  return senses.map(e => e.name + ": " + e.value + " ft.").join(", ");
};

let getLanguages = data => {
  let languages = [];
  let custom = [];

  let modifiers = [
    data.character.modifiers.class,
    data.character.modifiers.race,
    data.character.modifiers.background
  ]
    .flat()
    .filter(modifier => modifier.type === "language");

  modifiers.forEach(language => {
    let result = DICTIONARY.character.languages.find(
      lang => lang.name === language.friendlySubtypeName
    );
    if (result) {
      languages.push(result.value);
    } else {
      custom.push(language.friendlySubtypeName);
    }
  });

  return {
    value: languages,
    custom: custom.map(entry => utils.capitalize(entry)).join(", ")
  };
};

let getGenericConditionAffect = (data, condition, typeId) => {
  const damageTypes = DICTIONARY.character.damageTypes
    .filter(type => type.kind === condition && type.type === typeId)
    .map(type => type.value);

  let result = [
    data.character.modifiers.class,
    data.character.modifiers.race,
    data.character.modifiers.background,
    data.character.modifiers.item,
    data.character.modifiers.feat,
  ]
    .flat()
    .filter(modifier =>
      modifier.type === condition &&
      modifier.isGranted &&
      damageTypes.includes(modifier.subType)
    )
    .map(modifier => {
      const entry = DICTIONARY.character.damageTypes.find(
        type => (
          type.type === typeId &&
          type.kind === modifier.type &&
          type.value === modifier.subType
        )
      );
      return entry ? entry.vttaValue || entry.value : undefined;
    });

  result = result.concat(
    data.character.customDefenseAdjustments
      .filter(adjustment => adjustment.type === typeId)
      .map(adjustment => {
        const entry = DICTIONARY.character.damageTypes.find(
          type => (
            type.id === adjustment.id &&
            type.type === adjustment.type &&
            type.kind === condition
          )
        );
        return entry ? entry.vttaValue || entry.value : undefined;
      })
      .filter(adjustment => adjustment !== undefined)
  );

  return result;
};

let getDamageImmunities = data => {
  return {
    custom: "",
    value: getGenericConditionAffect(data, "immunity", 2)
  };
};

let getDamageResistances = data => {
  return {
    custom: "",
    value: getGenericConditionAffect(data, "resistance", 2)
  };
};

let getDamageVulnerabilities = data => {
  return {
    custom: "",
    value: getGenericConditionAffect(data, "vulnerability", 2)
  };
};

let getConditionImmunities = data => {
  // get Condition Immunities
  return {
    custom: "",
    value: getGenericConditionAffect(data, "immunity", 1)
  };
};

let getCurrency = data => {
  return {
    pp: data.character.currencies.pp,
    gp: data.character.currencies.gp,
    ep: data.character.currencies.ep,
    sp: data.character.currencies.sp,
    cp: data.character.currencies.cp
  };
};

let getSpellSlots = data => {
  // get the caster information from all classes and subclasses
  let getCasterInfo = () => {
    return data.character.classes
      .filter(cls => {
        return (
          cls.definition.canCastSpells ||
          (cls.subclassDefinition && cls.subclassDefinition.canCastSpells)
        );
      })
      .map(cls => {
        // the class total level
        let casterLevel = cls.level;
        // class name
        let name = cls.definition.name;

        // get the casting level if the character is a multiclassed spellcaster
        if (
          cls.definition.spellRules &&
          cls.definition.spellRules.multiClassSpellSlotDivisor
        ) {
          casterLevel = Math.floor(
            casterLevel / cls.definition.spellRules.multiClassSpellSlotDivisor
          );
        } else {
          casterLevel = 0;
        }

        let cantrips =
          cls.definition.spellRules &&
          cls.definition.spellRules.levelCantripsKnownMaxes &&
          Array.isArray(cls.definition.spellRules.levelCantripsKnownMaxes)
            ? cls.definition.spellRules.levelCantripsKnownMaxes[casterLevel + 1]
            : 0;

        return {
          name: name,
          level: cls.level,
          casterLevel: casterLevel,
          slots: cls.definition.spellRules.levelSpellSlots,
          cantrips: cantrips
        };
      });
  };

  let casterInfo = getCasterInfo(data);

  let result = null;
  if (casterInfo.length !== 1) {
    let multiClassSpellSlots = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0], // 0
      [2, 0, 0, 0, 0, 0, 0, 0, 0], // 1
      [3, 0, 0, 0, 0, 0, 0, 0, 0], // 2
      [4, 2, 0, 0, 0, 0, 0, 0, 0], // 3
      [4, 3, 0, 0, 0, 0, 0, 0, 0], // 4
      [4, 3, 2, 0, 0, 0, 0, 0, 0], // 5
      [4, 3, 3, 0, 0, 0, 0, 0, 0], // 6
      [4, 3, 3, 1, 0, 0, 0, 0, 0], // 7
      [4, 3, 3, 2, 0, 0, 0, 0, 0], // 8
      [4, 3, 3, 3, 1, 0, 0, 0, 0], // 9
      [4, 3, 3, 3, 2, 0, 0, 0, 0], // 10
      [4, 3, 3, 3, 2, 1, 0, 0, 0], // 11
      [4, 3, 3, 3, 2, 1, 0, 0, 0], // 12
      [4, 3, 3, 3, 2, 1, 1, 0, 0], // 13
      [4, 3, 3, 3, 2, 1, 1, 0, 0], // 14
      [4, 3, 3, 3, 2, 1, 1, 1, 0], // 15
      [4, 3, 3, 3, 2, 1, 1, 1, 0], // 16
      [4, 3, 3, 3, 2, 1, 1, 1, 1], // 17
      [4, 3, 3, 3, 3, 1, 1, 1, 1], // 18
      [4, 3, 3, 3, 3, 2, 1, 1, 1], // 19
      [4, 3, 3, 3, 3, 2, 2, 1, 1] // 20
    ];
    let casterLevelTotal = casterInfo.reduce(
      (prev, cur) => prev + cur.casterLevel,
      0
    );
    let cantripsTotal = casterInfo.reduce(
      (prev, cur) => prev + cur.cantrips,
      0
    );
    result = [cantripsTotal, ...multiClassSpellSlots[casterLevelTotal]];
  } else {
    result = [
      casterInfo[0].cantrips,
      ...casterInfo[0].slots[casterInfo[0].level]
    ];
  }

  let obj = {};
  for (let i = 0; i < result.length; i++) {
    obj["spell" + i] = { value: result[i], max: result[i] };
  }
  return obj;
};

let getToken = data => {
  /*
          obj.token = this.getToken(character);
          obj.token.img = results[1];
      */
  let tokenData = {
    actorData: {},
    actorLink: true,
    bar1: { attribute: "attributes.hp" },
    bar2: { attribute: "" },
    //brightLight: 0,
    brightSight: 0,
    //dimLight: 0,
    dimSight: 0,
    displayBars: 40,
    displayName: 40,
    disposition: -1,
    elevation: 0,
    flags: {},
    height: 1,
    //lightAngle: 360,
    lockRotation: false,
    name: data.character.name,
    randomImg: false,
    rotation: 0,
    //scale: 1,
    sightAngle: 360,
    vision: true,
    width: 1
  };

  let senses = [];
  let hasDarkvision = false;
  // custom senses
  if (data.character.customSenses) {
    data.character.customSenses.forEach(sense => {
      let s = DICTIONARY.character.senses.find(s => s.id === sense.senseId);

      let senseName = s ? s.name : null;
      // remember that this darkvision has precedence
      if (senseName === "Darkvision") hasDarkvision = true;

      // remember this sense
      senses.push({ name: senseName, value: sense.distance });
    });
  }

  if (!hasDarkvision) {
    let sense = data.character.modifiers.race.find(
      modifier =>
        modifier.type === "set-base" && modifier.subType === "darkvision"
    );
    if (sense && sense.value) {
      senses.push({ name: sense.friendlySubtypeName, value: sense.value });
    }
  }

  // Magical bonuses
  let magicalBoni = data.character.inventory
    .filter(item => item.equipped)
    .filter(
      item =>
        item.definition.grantedModifiers &&
        Array.isArray(item.definition.grantedModifiers) &&
        item.definition.grantedModifiers.length !== 0
    )

    .map(item => {
      return item.definition.grantedModifiers
        .filter(mod => mod.type === "sense")
        .map(mod => {
          return {
            name: DICTIONARY.character.senses.find(s => s.id === mod.entityId)
              .name,
            value: mod.value
          };
        });
    })
    .flat();
  magicalBoni.map(bonus => {
    let sense = senses.find(sense => sense.name === bonus.name);
    if (sense) {
      sense.value = bonus.value;
    }
  });

  // Blindsight/Truesight
  if (
    senses.find(
      sense => sense.name === "Truesight" || sense.name === "Blindsight"
    ) !== undefined
  ) {
    let value = senses
      .filter(
        sense => sense.name === "Truesight" || sense.name === "Blindsight"
      )
      .reduce((prev, cur) => (prev > cur.value ? prev : cur.value), 0);
    tokenData.brightSight = value;
  }

  // Darkvision
  if (senses.find(sense => sense.name === "Darkvision") !== undefined) {
    tokenData.dimSight = senses.find(
      sense => sense.name === "Darkvision"
    ).value;
  }

  return tokenData;
};

export default function getCharacter(ddb) {
  /***************************************
   * PARSING THE CHARACTER
   ***************************************
   */

  let character = {
    data: JSON.parse(utils.getTemplate("character")),
    type: "character",
    name: ddb.character.name,
    items: [],
    token: getToken(ddb),
    flags: {
      vtta: {
        dndbeyond: {
          proficiencies: getProficiencies(ddb),
          roUrl: ddb.character.readonlyUrl
        }
      }
    }
  };

  // character level (is needed in many places)
  character.data.details.level.value = getLevel(ddb);

  // character abilities
  character.data.abilities = getAbilities(ddb, character);

  // Hit Dice
  character.data.attributes.hd = getHitDice(ddb, character);

  // Death saves
  character.data.attributes.death = getDeathSaves(ddb, character);

  // exhaustion
  character.data.attributes.exhaustion = getExhaustion(ddb, character);

  // inspiration
  character.data.attributes.inspiration = ddb.character.inspiration;

  // armor class
  character.data.attributes.ac = getArmorClass(ddb, character);

  // hitpoints
  character.data.attributes.hp = getHitpoints(ddb, character);

  // initiative
  character.data.attributes.init.mod = character.data.abilities.dex.mod;

  // proficiency
  character.data.attributes.prof = Math.ceil(
    1 + 0.25 * character.data.details.level.value
  );

  // speeds
  character.data.attributes.speed = getSpeed(ddb, character);

  // spellcasting
  character.data.attributes.spellcasting = getSpellCasting(ddb, character);

  // spelldc
  character.data.attributes.spelldc = getSpellDC(ddb, character);

  // resources
  character.data.resources = getResources(ddb);

  // details
  character.data.details.background = getBackground(ddb);

  // level
  character.data.details.level.value = getLevel(ddb);

  // xp
  character.data.details.xp.value = ddb.character.currentXp;

  // Character Traits/Ideal/Bond and Flaw
  character.data.details.trait = getTrait(ddb);
  character.data.details.ideal = getIdeal(ddb);
  character.data.details.bond = getBond(ddb);
  character.data.details.flaw = getFlaw(ddb);

  character.data.details.alignment = getAlignment(ddb);

  // bio
  character.data.details.biography = getBiography(ddb);
  character.data.details.race = ddb.character.race.fullName;

  // traits
  character.data.traits.weaponProf = getWeaponProficiencies(ddb, character);
  character.data.traits.armorProf = getArmorProficiencies(ddb, character);
  character.data.traits.toolProf = getToolProficiencies(ddb, character);
  character.data.traits.size = getSize(ddb);
  character.data.traits.senses = getSenses(ddb);
  character.data.traits.languages = getLanguages(ddb);
  character.data.traits.di = getDamageImmunities(ddb);
  character.data.traits.dr = getDamageResistances(ddb);
  character.data.traits.dv = getDamageVulnerabilities(ddb);
  character.data.traits.ci = getConditionImmunities(ddb);

  character.data.currency = getCurrency(ddb);
  character.data.skills = getSkills(ddb, character);
  character.data.spells = getSpellSlots(ddb);

  return character;
}

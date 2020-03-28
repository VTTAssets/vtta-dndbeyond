import DICTIONARY from "../dictionary.js";
import utils from "../../utils.js";

/*
spell.componentId   97  - subclasses.classFeatures // seems to reference the source of a spell, warrants follow-up
{
  "id": 97,
  "name": "Additional Magical Secrets",
  "prerequisite": null,
  "description": "<p>At 6th level, you learn two spells of your choice from any class. A spell you choose must be of a level you can cast, as shown on the Bard table, or a cantrip. The chosen spells count as bard spells for you but don&rsquo;t count against the number of bard spells you know.</p>",
  "requiredLevel": 6,
  "displayOrder": 3
}
*/

let getComponents = data => {
  return {
    value: data.definition.componentsDescription,
    vocal: data.definition.components.includes(1),
    somatic: data.definition.components.includes(2),
    material: data.definition.components.includes(3),
    ritual: data.definition.ritual,
    concentration: data.definition.concentration
  };
};

let getMaterials = data => {
  // this is mainly guessing
  if (
    data.definition.componentsDescription &&
    data.definition.componentsDescription.length > 0
  ) {
    let cost = 0;
    let matches = data.definition.componentsDescription
      .toLowerCase()
      .match(/([\d\.]+)\s*gp/);
    if (matches) {
      cost = parseInt(matches[1].replace("."));
    }

    return {
      value: data.definition.componentsDescription,
      consumed:
        data.definition.componentsDescription
          .toLowerCase()
          .indexOf("consume") !== -1,
      cost: cost,
      supply: 0
    };
  } else {
    return {
      value: "",
      consumed: false,
      cost: 0,
      supply: 0
    };
  }
};

/**
 * Retrieves the spell preparation mode, depending on the location this spell came from
 * 
 */
let getSpellPreparationMode = data => {
  //default values 
  let prepMode = "prepared";
  // If always prepared mark as such, if not then check to see if prepared
  let prepared = data.alwaysPrepared || data.prepared;

  // handle classSpells
  if (data.flags.vtta.dndbeyond.lookup === "classSpell") {
    let classPrepMode = utils.findByProperty(
      DICTIONARY.spell.preparationModes,
      "name",
      data.flags.vtta.dndbeyond.class
    );
    if (prepMode) {
      prepMode = classPrepMode;
    };
    // Warlocks should use Pact spells, but these are not yet handled well
    // in VTTA (no slots are showed). Instead we mark as prepared, and 
    // pretend they are regular spells.
    if (data.flags.vtta.dndbeyond.class === "Warlock") {
      prepMode = "prepared";
      prepared = true;
    };
  } else if (data.flags.vtta.dndbeyond.lookup === "race" && data.definition.level !== 0) {
    // set race spells as innate
    prepMode = "innate";
  } else if ( // Warlock Mystic Arcanum are passed in as Features
      data.flags.vtta.dndbeyond.lookupName.startsWith("Mystic Arcanum")
  ) {
    // these have limited uses (set with getUses())
    prepMode = "pact";
    prepared = false;
  } else {
    // If spell doesn't use a spell slot and is not a cantrip, mark as always preped
    let alwaysPrepared = (!data.usesSpellSlot && data.definition.level !== 0);
    let ritaulOnly = (data.ritualCastingType !== null|| data.castOnlyAsRitual); // e.g. Book of ancient secrets & totem barb
    if (alwaysPrepared && ritaulOnly) {
      // in this case we want the spell to appear in the spell list unprepared
      prepared = false;
    } else if (alwaysPrepared) {
      // these spells are always prepared, and have a limited use that's
      // picked up by getUses() later
      prepMode = "always";
    };
  };

  return {
    mode: prepMode,
    prepared: prepared,
  };
};

/**
 * Get the reset condition of the spell, if uses restricted
 * @param {*} data Spell data
 */
let getUses = data => {
  if (data.limitedUse !== undefined && data.limitedUse !== null){
    let resetType = DICTIONARY.resets.find(
      reset => reset.id == data.limitedUse.resetType
    );
    return {
      value: data.limitedUse.maxUses - data.limitedUse.numberUsed,
      max: data.limitedUse.maxUses,
      per: resetType.value,
    };
  } else {
    return {};
  };
  
};

/**
 * Gets the sourcebook for a subset of dndbeyond sources
 * @param {obj} data Item data
 */
let getSource = data => {
  if (data.definition.sourceId) {
    let source = DICTIONARY.sources.find(
      source => source.id === data.definition.sourceId
    );
    if (source) {
      return data.definition.sourcePageNumber
        ? `${source.name} pg. ${data.definition.sourcePageNumber}`
        : source.name;
    }
  }
  return "";
};

/**
 * Gets the activation information of this spell
 */
let getActivation = data => {
  let activationType = DICTIONARY.spell.activationTypes.find(
    type => type.activationType === data.definition.activation.activationType
  );
  if (activationType && data.definition.activation.activationTime) {
    return {
      type: activationType.value,
      cost: data.definition.activation.activationTime,
      condition: ""
    };
  } else {
    return {
      type: "action",
      cost: 1,
      condition: ""
    };
  }
};

/**
 * Retrieves the spell duration
 */
let getDuration = data => {
  if (
    data.definition.duration &&
    data.definition.duration.durationInterval &&
    data.definition.duration.durationUnit
  ) {
    return {
      value: data.definition.duration.durationInterval,
      units: data.definition.duration.durationUnit.toLowerCase()
    };
  }
};

/** Spell targets 
 * 
*/
let getTarget = data => {
  // if spell is an AOE effect get some details
  if (data.definition.range.aoeType && data.definition.range.aoeValue) {
    return {
      value: data.definition.range.aoeValue,
      type: data.definition.range.aoeType.toLowerCase(),
      units: "ft"
    };
  }

  // else lets try and fill in some target details
  let type = "";
  let units = "";

  switch (data.definition.range.origin) {
    case "Touch":
      type = "touch";
      break;
    case "Self":
      type = "self";
      break;
    case "None":
      type = "none";
      break;
    case "Ranged":
      type = "feet";
      break;
    case "Feet":
      type = "feet";
      units = "ft";
      break;
    case "Miles":
      type = "miles";
      units = "ml";
      break;
    case "Special":
      type = "special";
      break;
    case "Any":
      type = "any";
      break;
    case undefined:
      type = null;
      break;
  };

  return {
    value: null, // dd beyond doesn't let us know how many folk a spell can target
    units: units, 
    type: type,
  };
};

/** Spell range */
let getRange = data => {
  return {
    value: data.definition.range.rangeValue
      ? data.definition.range.rangeValue
      : 5,
    long: data.definition.range.rangeValue
      ? data.definition.range.rangeValue
      : 5,
    units: "ft"
  };
};

let getActionType = data => {
  if (
    data.definition.requiresSavingThrow &&
    !data.definition.requiresAttackRoll
  ) {
    return "save";
  }

  if (
    data.definition.tags.includes("Damage") &&
    data.definition.range.rangeValue &&
    data.definition.range.rangeValue > 0
  ) {
    return "rsak";
  }

  if (data.definition.tags.includes("Damage")) {
    return "msak";
  }

  if (data.definition.tags.includes("Healing")) {
    return "heal";
  }

  if (data.definition.tags.includes("Buff")) {
    return "util";
  }

  return "other";
};

let getDamage = data => {
  let result = {
    parts: [],
    versatile: ""
  };

  // damage
  let attacks = data.definition.modifiers.filter(mod => mod.type === "damage");
  if (attacks.length !== 0) {
    attacks.forEach(attack => {
      let diceString = attack.usePrimaryStat
        ? `${attack.die.diceString} + @mod`
        : attack.die.diceString;
      result.parts.push([diceString, attack.subType]);
    });
    return result;
  }

  // healing
  let heals = data.definition.modifiers.filter(
    mod => mod.type === "bonus" && mod.subType === "hit-points"
  );
  if (heals.length !== 0) {
    heals.forEach(heal => {
      let diceString = heal.usePrimaryStat
        ? `${heal.die.diceString} + @mod`
        : heal.die.diceString;
      result.parts.push([diceString, "healing"]);
    });
    return result;
  }
  return result;
};

let getSave = data => {
  if (data.definition.requiresSavingThrow && data.definition.saveDcAbilityId) {
    return {
      ability: DICTIONARY.character.abilities.find(
        ability => ability.id === data.definition.saveDcAbilityId
      ).value,
      dc: null // enable scaling to character level within foundry data.flags.dc,
    };
  } else {
    return {
      ability: "",
      dc: null
    };
  }
};

let getSpellScaling = (data, character) => {
  let baseDamage = "";
  let scaleDamage = "";
  let scaleType = "";

  data.definition.modifiers
    .filter(
      mod =>
        mod.type === "damage" ||
        (mod.type === "bonus" && mod.subType === "hit-points")
    )
    .forEach(mod => {
      if (mod && mod.die) {
        if (mod.die.diceString !== null) {
          baseDamage = mod.die.diceString;
        }

        if (mod.die.fixedValue !== null && baseDamage === "") {
          baseDamage = mod.die.fixedValue;
        }
      }
      if (data.definition.canCastAtHigherLevel) {
        if (mod.atHigherLevels) {
          scaleType = mod.atHigherLevels.scaleType;
          if (
            ["characterlevel", "spellscale"].includes(scaleType) &&
            mod.atHigherLevels.higherLevelDefinitions &&
            Array.isArray(mod.atHigherLevels.higherLevelDefinitions) &&
            mod.atHigherLevels.higherLevelDefinitions.length >= 1
          ) {
            let definition = mod.atHigherLevels.higherLevelDefinitions[0];

            if (definition) {
              scaleDamage =
                definition.dice && definition.dice.diceString
                  ? definition.dice.diceString
                  : definition.dice && definition.dice.fixedValue
                  ? definition.dice.fixedValue
                  : definition.value;
            }
          }
        }
      }
    });

  switch (scaleType) {
    case "characterlevel":
      return {
        mode: "cantrip",
        formula: baseDamage
      };
    case "spellscale":
      return {
        mode: "level",
        formula: scaleDamage
      };
    default:
      return {
        mode: "level",
        formula: ""
      };
  }
};

let getFormula = data => {
  // this might be specificially for Toll the Dead only, but it's better than nothing

  let description = data.definition.description;
  let match = description.match(/instead[\w\s]+(\d+d\d+) (\w+) damage/);
  if (match) {
    return match[1];
  } else {
    return "";
  }
};

// is there a spell casting ability?
let hasSpellCastingAbility = spellCastingAbilityId => {
  return (
    DICTIONARY.character.abilities.find(
      ability => ability.id === spellCastingAbilityId
    ) !== undefined
  );
};

// convert spellcasting ability id to string used by vtta
let convertSpellCastingAbilityId = spellCastingAbilityId => {
  return DICTIONARY.character.abilities.find(
    ability => ability.id === spellCastingAbilityId
  ).value;
};

// search through classinfo and determine spellcasting ability
let getSpellCastingAbility = classInfo => {
  let spellCastingAbility = undefined;
  if (hasSpellCastingAbility(classInfo.definition.spellCastingAbilityId)) {
    spellCastingAbility = convertSpellCastingAbilityId(
      classInfo.definition.spellCastingAbilityId
    );
  } else if (
    hasSpellCastingAbility(classInfo.subclassDefinition.spellCastingAbilityId)
  ) {
    // Arcane Trickster has spellcasting ID granted here
    spellCastingAbility = convertSpellCastingAbilityId(
      classInfo.subclassDefinition.spellCastingAbilityId
    );
  } else {
    // special cases: No spellcaster, but can cast spells like totem barbarian, default to wis
    spellCastingAbility = "wis";
  }
  return spellCastingAbility;
};


let getLookups = (character) => {
  // racialTraits
  let lookups = {
    race: [],
    feat: [],
    class: [],
    classFeature: [],
  };
  character.race.racialTraits.forEach( trait => {
    lookups.race.push({
      id: trait.definition.id,
      name: trait.definition.name,
    })
  })

  character.classes.forEach( playerClass => {
    [playerClass.definition, playerClass.subclassDefinition]
    .flat()
    .forEach( trait => {
      lookups.class.push({
        id: trait.id,
        name: trait.name,
      })
    });

    playerClass.classFeatures.forEach( trait => {
      lookups.classFeature.push({
        id: trait.definition.id,
        name: trait.definition.name,
        componentId: trait.definition.componentId,
      });
    });
  });

  character.options.class.forEach( trait => {
    lookups.classFeature.push({
      id: trait.definition.id,
      name: trait.definition.name,
      componentId: trait.componentId,
    })
  });

  character.feats.forEach( trait => {
    lookups.feat.push({
      id: trait.definition.id,
      name: trait.definition.name,
      componentId: trait.componentId,
    })
  });

  return lookups;
};

let parseSpell = (data, character) => {
  /**
   * MAIN parseSpell
   */
  let spell = {
    name: data.definition.name,
    type: "spell",
    data: JSON.parse(utils.getTemplate("spell")),
    flags: {
      vtta: {
        dndbeyond: {
          tags: data.definition.tags
        }
      }
    }
  };

  // spell level
  spell.data.level = data.definition.level;

  // get the spell school
  spell.data.school = utils.findInConfig(
    "spellSchools",
    data.definition.school
  );

  /**
   * Gets the necessary spell components VSM + material
   */
  spell.data.components = getComponents(data);

  spell.data.materials = getMaterials(data);

  spell.data.preparation = getSpellPreparationMode(data);

  spell.data.description = {
    value: data.definition.description,
    chat: data.definition.description,
    unidentified: data.definition.type
  };

  spell.data.source = getSource(data);

  spell.data.activation = getActivation(data);

  spell.data.duration = getDuration(data);

  spell.data.target = getTarget(data);

  spell.data.range = getRange(data);

  spell.data.actionType = getActionType(data);

  spell.data.damage = getDamage(data);

  spell.data.save = getSave(data);

  spell.data.scaling = getSpellScaling(data);

  spell.data.formula = getFormula(data);

  spell.data.uses = getUses(data);

  // attach the spell ability id to the spell data so VTT always uses the
  // correct one, useful if multi-classing and spells have different
  // casting abilities
  if (
    character.data.attributes.spellcasting !== data.flags.vtta.dndbeyond.ability
  ) {
    spell.data.ability = data.flags.vtta.dndbeyond.ability;
  }

  return spell;
};

export default function parseSpells(ddb, character) {
  let items = [];
  let proficiencyModifier = character.data.attributes.prof;
  let lookups = getLookups(ddb.character);

  // each class has an entry here, each entry has spells
  // we loop through each class and process
  ddb.character.classSpells.forEach(playerClass => {
    let classInfo = ddb.character.classes.find(
      cls => cls.id === playerClass.characterClassId
    );
    let spellCastingAbility = getSpellCastingAbility(classInfo);
    let abilityModifier = utils.calculateModifier(
      character.data.abilities[spellCastingAbility].value
    );

    // parse spells chosen as spellcasting (playerClass.spells)
    playerClass.spells.forEach(spell => {
      // add some data for the parsing of the spells into the data structure
      spell.flags = {
        vtta: {
          dndbeyond: {
            lookup: "classSpell",
            class: classInfo.definition.name,
            level: classInfo.level,
            spellLevel: spell.definition.level,
            spellSlots: character.data.spells,
            ability: spellCastingAbility,
            mod: abilityModifier,
            dc: 8 + proficiencyModifier + abilityModifier
          }
        }
      };

      items.push(parseSpell(spell, character));
      // do not parse the same spell twice. Had it once with Spiritual Weapons with the same
      // data, but only a different spell ID
      if (
        items.find(
          existingSpell => existingSpell.name === spell.definition.name
        ) === undefined
      ) {
        items.push(parseSpell(spell, character));
      }
    });
  });

  // Parse any spells granted by class features, such as Barbarian Totem
  ddb.character.spells.class.forEach(spell => {
    let spellCastingAbility = undefined;
    // If the spell has an ability attached, use that
    if (hasSpellCastingAbility(spell.spellCastingAbilityId)) {
      spellCastingAbility = convertSpellCastingAbilityId(
        spell.spellCastingAbilityId
      );
    } else {
      // if there is no ability on spell, we default to wis
      spellCastingAbility = "wis";
    }

    let abilityModifier = utils.calculateModifier(
      character.data.abilities[spellCastingAbility].value
    );

    let classInfo = lookups.classFeature.find(
      cls => cls.id === spell.componentId
    );

    // add some data for the parsing of the spells into the data structure
    spell.flags = {
      vtta: {
        dndbeyond: {
          lookup: "classFeature",
          lookupName: classInfo.name,
          lookupId: classInfo.id,
          level: character.data.details.level.value,
          ability: spellCastingAbility,
          mod: abilityModifier,
          dc: 8 + proficiencyModifier + abilityModifier
        }
      }
    };

    items.push(parseSpell(spell, character));
  });

  // Race spells are handled slightly differently
  ddb.character.spells.race.forEach(spell => {
    // for race spells the spell spellCastingAbilityId is on the spell
    let spellCastingAbility = convertSpellCastingAbilityId(
      spell.spellCastingAbilityId
    );

    let abilityModifier = utils.calculateModifier(
      character.data.abilities[spellCastingAbility].value
    );

    let raceInfo = lookups.race.find(
      rc => rc.id === spell.componentId
    );

    // add some data for the parsing of the spells into the data structure
    spell.flags = {
      vtta: {
        dndbeyond: {
          lookup: "race",
          lookupName: raceInfo.name,
          lookupId: raceInfo.id,
          race: ddb.character.race.fullName,
          level: spell.castAtLevel,
          ability: spellCastingAbility,
          mod: abilityModifier,
          dc: 8 + proficiencyModifier + abilityModifier
        }
      }
    };

    items.push(parseSpell(spell, character));
  });

  // feat spells are handled slightly differently
  ddb.character.spells.feat.forEach(spell => {
    // for feat spells the spell spellCastingAbilityId is on the spell
    let spellCastingAbility = convertSpellCastingAbilityId(
      spell.spellCastingAbilityId
    );

    let abilityModifier = utils.calculateModifier(
      character.data.abilities[spellCastingAbility].value
    );

    let featInfo = lookups.feat.find(
      ft => ft.id === spell.componentId
    );

    // add some data for the parsing of the spells into the data structure
    spell.flags = {
      vtta: {
        dndbeyond: {
          lookup: "feat",
          lookupName: featInfo.name,
          lookupId: featInfo.id,
          level: spell.castAtLevel,
          ability: spellCastingAbility,
          mod: abilityModifier,
          dc: 8 + proficiencyModifier + abilityModifier
        }
      }
    };

    items.push(parseSpell(spell, character));
  });

  return items;
}

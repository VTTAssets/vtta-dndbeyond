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
    const classPrepMode = utils.findByProperty(
      DICTIONARY.spell.preparationModes,
      "name",
      data.flags.vtta.dndbeyond.class
    ).value;
    if (data.alwaysPrepared) {
      prepMode = "always";
    } else if (prepMode) {
      prepMode = classPrepMode;
    };
    // Warlocks should use Pact spells, but these are not yet handled well
    // in VTTA (no slots are showed). Instead we mark as prepared, and 
    // pretend they are regular spells.
    if (["Warlock", "Blood Hunter"].includes(data.flags.vtta.dndbeyond.class)) {
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
  } else if (data.flags.vtta.dndbeyond.look === "item " && data.definition.level !== 0) {
    prepared = false;
    prepMode = "prepared";
  } else {
    // If spell doesn't use a spell slot and is not a cantrip, mark as always preped
    let always = (!data.usesSpellSlot && data.definition.level !== 0);
    let ritaulOnly = (data.ritualCastingType !== null|| data.castOnlyAsRitual); // e.g. Book of ancient secrets & totem barb
    if (always && ritaulOnly) {
      // in this case we want the spell to appear in the spell list unprepared
      prepared = false;
    } else if (always) {
      // these spells are always prepared, and have a limited use that's
      // picked up by getUses() later
      // this was changed to "atwill"
      prepMode = "atwill";
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
  let resetType = null;
  let limitedUse = null;
  // we check this, as things like items have useage attached to the item, not spell
  if (data.flags.vtta.dndbeyond.limitedUse !== undefined && 
      data.flags.vtta.dndbeyond.limitedUse !== null
  ){
    limitedUse = data.flags.vtta.dndbeyond.limitedUse
    resetType = DICTIONARY.resets.find(
      reset => reset.id == limitedUse.resetType
    );

  } else if (data.limitedUse !== undefined && data.limitedUse !== null){
    limitedUse = data.limitedUse
    resetType = DICTIONARY.resets.find(
      reset => reset.id == limitedUse.resetType
    );
  };
  
  if (resetType !== null && resetType !== undefined) {
    return {
      value: limitedUse.numberUsed
        ? limitedUse.maxUses - limitedUse.numberUsed
        : limitedUse.maxUses,
      max: limitedUse.maxUses,
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
    data.definition.duration
  ) {
    let units = "";
    if (data.definition.duration.durationUnit !== null) {
      units = data.definition.duration.durationUnit.toLowerCase()
    } else {
      units = data.definition.duration.durationType.toLowerCase().substring(0, 4)
    };
    return {
      value: data.definition.duration.durationInterval || "",
      units: units,
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
  let scaleType = null; //defaults to null, so will be picked up as a None scaling spell.

  // spell scaling
  if (data.definition.canCastAtHigherLevel) {
    // iterate over each spell modifier
    data.definition.modifiers
      .filter(
        mod =>
          mod.type === "damage" ||
          (mod.type === "bonus" && mod.subType === "hit-points")
      )
      .forEach(mod => {
        // if the modifier has a die for damage, lets use the string or fixed value
        // for the base damage
        if (mod && mod.die) {
          if (mod.die.diceString !== null) {
            baseDamage = mod.die.diceString;
          }

          if (mod.die.fixedValue !== null && baseDamage === "") {
            baseDamage = mod.die.fixedValue;
          }
        }

        // defines some details about higher level casting
        if (mod.atHigherLevels) {
          // scaleTypes:
          // SPELLSCALE - typical spells that scale
          // SPELLLEVEL - these spells have benefits that come in at particular levels e.g. bestow curse, hex. typically  duration changes
          // CHARACTERLEVEL - typical cantrip based levelling, some expections (eldritch blast)

          let modScaleType = mod.atHigherLevels.scaleType;
          // mod.atHigherLevels.higherLevelDefinitions contains info about the
          // spells damage die at higher levels, but we can't use this for cantrips as
          // FVTT use a formula to work out the scaling (ddb has a fixed value structure)
          const isHigherLevelDefinitions = 
            mod.atHigherLevels.higherLevelDefinitions &&
            Array.isArray(mod.atHigherLevels.higherLevelDefinitions) &&
            mod.atHigherLevels.higherLevelDefinitions.length >= 1;

          // lets handle normal spell leveling first
          if (
            isHigherLevelDefinitions &&
            modScaleType === "spellscale"
          ) {
            const definition = mod.atHigherLevels.higherLevelDefinitions[0];
            if (definition) {
              const modScaleDamage =
                definition.dice && definition.dice.diceString // if dice string
                  ? definition.dice.diceString // use dice string
                  : definition.dice && definition.dice.fixedValue //else if fixed value
                  ? definition.dice.fixedValue // use fixed value
                  : definition.value; // else use value
              
              // some spells have multiple scaling damage (e.g. Wall of Ice, 
              // Glyph of warding, Acid Arrow, Arcane Hand, Dragon's Breath,
              // Chromatic Orb, Absorb Elements, Storm Sphere, Spirit Guardians)
              // it's hard to model most of these in FVTT, and for some it makes
              // no difference. so...
              // lets optimistically use the highest
              // assumptions: these are going to be dice strings, and we don't care
              // about dice value, just number of dice
              const diceFormula = /(\d*)d\d*/;
              const existingMatch = diceFormula.exec(scaleDamage);
              const modMatch = diceFormula.exec(modScaleDamage);

              if (!existingMatch || modMatch[1] > existingMatch[1]) {
                scaleDamage = modScaleDamage;
              }
              // finally update scaleType
              scaleType = modScaleType;

            } else {
              console.warn("No definition found for " + data.definition.name);
            }

          } else if(
            modScaleType === "spellscale"
          ) {
            // lets handle cases where there is a spellscale type but no damage
            // increase/ higherleveldefinitins e.g. chain lighting
            // these type of spells typically increase targets so we set the
            // scaling to null as we don't want to increase damage when upcast.
            // this also deals with cases like Ice Knife where the upscale damage
            // is in one of the two mods provided.
            // we are capturing this else because we don't want to trigger
            // an update to scaleType or a warning.
          } else if (modScaleType === "characterlevel") {
            // lets handle odd cantrips like Eldritch Blast
            // (in fact this might be the only case)
            if (mod.atHigherLevels.higherLevelDefinitions.length === 0) {
              // if this array is empty it does not contain levelling information
              // the only case found is Eldritch Blast.
              // this does have some info around multiple beams in
              // data.atHigherLevels but we ignore this. we will set the scaling
              // to null as each beam is best modelled by "casting" the cantrip again/
              // pressing the attack/damage buttons in FVTT
              scaleType = null;
            } else {
              scaleType = modScaleType;
            }
          } else if (modScaleType === "spelllevel"){
            // spells that have particular level associated benefits
            // these seem to be duration increases or target increases for
            // the most part we can't handle these in FVTT right now (we could
            // in theory create a new spell at a higher level).
            // some duration upcasting (like bestow curse) affects concentration
            // for now we will do nothing with these spells.
            // examples include: hex, shadowblade, magic weapon, bestow curse
            scaleType = modScaleType;
          } else {
            console.warn(
              data.definition.name +
              ' parse failed: ' +
              JSON.stringify(modScaleType)
            );
            scaleType = modScaleType; // if this is new/unknow will use default
          }
        }
    });
  }

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
    case "spelllevel":
    case null:
      return {
        mode: "none",
        formula: ""
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
    classInfo.subclassDefinition &&
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

let getEldritchInvocations = (data, character) => {
  let damage = 0;
  let range = 0;

  const eldritchBlastMods = data.character.modifiers.class.filter(
    modifier => modifier.type === "eldritch-blast" && modifier.isGranted
  );

  eldritchBlastMods.forEach(mod =>{
    switch(mod.subType) {
      case "bonus-damage":
        // almost certainly CHA :D
        const abilityModifier = DICTIONARY.character.abilities.find(
          ability => ability.id === mod.statId
        ).value;
        damage = `@abilities.${abilityModifier}.mod`;
        break;
      case "bonus-range":
        range = mod.value;
        break;
      default:
        console.warn(`Not yet able to process ${mod.subType}, please raise an issue.`)
    }   
  });

  return {
    damage: damage,
    range: range
  };
};

let getLookups = (character) => {
  // racialTraits
  let lookups = {
    race: [],
    feat: [],
    class: [],
    classFeature: [],
    item: [],
  };
  character.race.racialTraits.forEach( trait => {
    lookups.race.push({
      id: trait.definition.id,
      name: trait.definition.name,
    })
  })

  character.classes.forEach( playerClass => {
    lookups.class.push({
      id: playerClass.definition.id,
      name: playerClass.definition.name,
    });

    if (playerClass.subclassDefinition) {
      lookups.class.push({
        id: playerClass.subclassDefinition.id,
        name: playerClass.subclassDefinition.name,
      })
    };

    if (playerClass.classFeatures) {
      playerClass.classFeatures.forEach( trait => {
        lookups.classFeature.push({
          id: trait.definition.id,
          name: trait.definition.name,
          componentId: trait.definition.componentId,
        });
      });
    };
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

  character.inventory.forEach( trait => {
    lookups.item.push({
      id: trait.definition.id,
      name: trait.definition.name,
      limitedUse: trait.limitedUse,
      equipped: trait.equipped,
      isAttuned: trait.isAttuned,
      canAttune: trait.definition.canAttune,
      canEquip: trait.definition.canEquip,
    })
  });

  return lookups;
};

let parseSpell = (data, character) => {
  /**
   * MAIN parseSpell
   */
  let spell = {
    type: "spell",
    data: JSON.parse(utils.getTemplate("spell")),
    flags: {
      vtta: {
        dndbeyond: data.flags.vtta.dndbeyond
      }
    }
  };

  // spell name
  if (data.flags.vtta.dndbeyond.nameOverride !== undefined) {
    spell.name = data.flags.vtta.dndbeyond.nameOverride;
  } else {
    spell.name = data.definition.name;
  };

  // add tags
  spell.flags.vtta.dndbeyond.tags = data.definition.tags;

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
    // If the spell has an ability attached, use that
    let spellCastingAbility = undefined;
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
          level: character.flags.vtta.dndbeyond.totalLevels,
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
    // if there is no ability on spell, we default to wis
    let spellCastingAbility = "wis";
    if (hasSpellCastingAbility(spell.spellCastingAbilityId)) {
      spellCastingAbility = convertSpellCastingAbilityId(
        spell.spellCastingAbilityId
      );
    };

    let abilityModifier = utils.calculateModifier(
      character.data.abilities[spellCastingAbility].value
    );

    let raceInfo = lookups.race.find(
      rc => rc.id === spell.componentId
    );

    if (!raceInfo) {
      // for some reason we haven't matched the race option id with the spell
      // this happens with at least the SCAG optional spells casting half elf
      raceInfo = {
        name: "Racial spell",
        id: spell.componentId,
      };
    };

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
    // If the spell has an ability attached, use that
    // if there is no ability on spell, we default to wis
    let spellCastingAbility = "wis";
    if (hasSpellCastingAbility(spell.spellCastingAbilityId)) {
      spellCastingAbility = convertSpellCastingAbilityId(
        spell.spellCastingAbilityId
      );
    };

    let abilityModifier = utils.calculateModifier(
      character.data.abilities[spellCastingAbility].value
    );

    let featInfo = lookups.feat.find(
      ft => ft.id === spell.componentId
    );

    if (!featInfo) {
      // for some reason we haven't matched the feat option id with the spell
      // we fiddle the result
      featInfo = {
        name: "Feat option spell",
        id: spell.componentId,
      };
    };

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

  // Eldritch Blast is a special little kitten and has some fun Eldritch 
  // Invocations which can adjust it.
  items.filter(
    spell => spell.name === "Eldritch Blast"
  ).map(eb => {
    const eldritchBlastMods = getEldritchInvocations(ddb, character);
    eb.data.damage.parts[0][0] += " + " + eldritchBlastMods['damage'];
    eb.data.range.value += eldritchBlastMods['range'];
    eb.data.range.long += eldritchBlastMods['range'];
  });

  return items;
}

export function parseItemSpells(ddb, character) {
  let items = [];
  let proficiencyModifier = character.data.attributes.prof;
  let lookups = getLookups(ddb.character);

  // feat spells are handled slightly differently
  ddb.character.spells.item.forEach(spell => {
    let itemInfo = lookups.item.find(
      it => it.id === spell.componentId
    );

    //lets see if we have the item equipped/attuned to actually grant anythings
    if (
      (!itemInfo.canEquip && !itemInfo.canAttune) || // if item just gives a thing
      (itemInfo.isAttuned) || // if it is attuned (assume equipped)
      (!itemInfo.canAttune && itemInfo.equipped) // can't attune but is equipped
    ) {
      // for item spells the spell dc is often on the item spell
      let spellDC = 8;
      if (spell.overrideSaveDc) {
        spellDC = spell.overrideSaveDc;
      } else if (spell.spellCastingAbilityId) {
        // If the spell has an ability attached, use that
        // if there is no ability on spell, we default to wis
        let spellCastingAbility = "wis";
        if (hasSpellCastingAbility(spell.spellCastingAbilityId)) {
          spellCastingAbility = convertSpellCastingAbilityId(
            spell.spellCastingAbilityId
          );
        };
    
        let abilityModifier = utils.calculateModifier(
          character.data.abilities[spellCastingAbility].value
        );
        spellDC = 8 + proficiencyModifier + abilityModifier;
      } else {
        spellDC = null;
      }; 

      // add some data for the parsing of the spells into the data structure
      spell.flags = {
        vtta: {
          dndbeyond: {
            lookup: "item",
            lookupName: itemInfo.name,
            lookupId: itemInfo.id,
            level: spell.castAtLevel,
            dc: spellDC,
            limitedUse: itemInfo.limitedUse,
            nameOverride: `${spell.definition.name} (${itemInfo.name})`,
          }
        }
      };
      items.push(parseSpell(spell, character));
    };
  });
  return items;
}

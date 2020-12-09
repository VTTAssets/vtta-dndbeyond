import utils from "../../utils.js";

// Import parsing functions
import { getLookups } from "./metadata.js";
import { fixSpells } from "./special.js";
import { parseSpell } from "./parseSpell.js";
import { getSpellCastingAbility, hasSpellCastingAbility, convertSpellCastingAbilityId } from "./ability.js";
import logger from "../../logger.js";

export function getCharacterSpells(ddb, character) {
  let items = [];
  const proficiencyModifier = character.data.attributes.prof;
  const lookups = getLookups(ddb.character);

  // each class has an entry here, each entry has spells
  // we loop through each class and process
  ddb.character.classSpells.forEach((playerClass) => {
    const classInfo = ddb.character.classes.find((cls) => cls.id === playerClass.characterClassId);
    const spellCastingAbility = getSpellCastingAbility(classInfo);
    const abilityModifier = utils.calculateModifier(character.data.abilities[spellCastingAbility].value);

    const cantripBoost =
      ddb.character.modifiers.class.filter(
        (mod) =>
          mod.type === "bonus" &&
          mod.subType === `${classInfo.definition.name.toLowerCase()}-cantrip-damage` &&
          (mod.restriction === null || mod.restriction === "")
      ).length > 0;

    // parse spells chosen as spellcasting (playerClass.spells)
    playerClass.spells.forEach((spell) => {
      if (!spell.definition) return;
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
            dc: 8 + proficiencyModifier + abilityModifier,
            cantripBoost: cantripBoost,
            overrideDC: false,
          },
        },
      };

      // Check for duplicate spells, normally domain ones
      // We will import spells from a different class that are the same though
      // as they may come from with different spell casting mods
      const duplicateSpell = items.findIndex(
        (existingSpell) =>
          existingSpell.name === spell.definition.name &&
          classInfo.definition.name === existingSpell.flags.vtta.dndbeyond.class
      );
      if (!items[duplicateSpell]) {
        items.push(parseSpell(spell, character));
      } else if (spell.alwaysPrepared) {
        // if our new spell is always known we overwrite!
        // it's probably domain
        items[duplicateSpell] = parseSpell(spell, character);
      } else {
        // we'll emit a console message if it doesn't match this case for future debugging
        logger.warn(`Duplicate Spell ${spell.definition.name} detected in class ${classInfo.definition.name}.`);
      }
    });
  });

  // Parse any spells granted by class features, such as Barbarian Totem
  ddb.character.spells.class.forEach((spell) => {
    if (!spell.definition) return;
    // If the spell has an ability attached, use that
    let spellCastingAbility = undefined;
    const classInfo = lookups.classFeature.find((cls) => cls.id === spell.componentId);

    if (!classInfo) {
      // No class features found with an ID of the given spell.componentId
      throw new Error(
        `Unable to associate the spell "${spell.definition.name}" to a class feature ` +
        `with ID "${spell.componentId}", please log a bug report and supply your character sheet JSON`
      );
    }

    const klass = utils.getClassFromOptionID(ddb, spell.componentId);

    if (hasSpellCastingAbility(spell.spellCastingAbilityId)) {
      spellCastingAbility = convertSpellCastingAbilityId(spell.spellCastingAbilityId);
    } else if (klass) {
      spellCastingAbility = getSpellCastingAbility(klass);
      // force these spells to always be prepared
      spell.alwaysPrepared = true;
    } else {
      // if there is no ability on spell, we default to wis
      spellCastingAbility = "wis";
    }

    const abilityModifier = utils.calculateModifier(character.data.abilities[spellCastingAbility].value);

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
          dc: 8 + proficiencyModifier + abilityModifier,
          overrideDC: false,
        },
      },
    };

    // Check for duplicate spells, normally domain ones
    // We will import spells from a different class that are the same though
    // as they may come from with different spell casting mods
    const duplicateSpell = items.findIndex(
      (existingSpell) =>
        existingSpell.name === spell.definition.name &&
        klass &&
        klass.definition.name === existingSpell.flags.vtta.dndbeyond.class
    );
    if (!items[duplicateSpell]) {
      items.push(parseSpell(spell, character));
    } else if (spell.alwaysPrepared) {
      // if our new spell is always known we overwrite!
      // it's probably domain
      items[duplicateSpell] = parseSpell(spell, character);
    } else {
      // we'll emit a console message if it doesn't match this case for future debugging
      utils.log(`Duplicate Spell ${spell.definition.name} detected in class ${classInfo.name}.`);
    }
  });

  // Race spells are handled slightly differently
  ddb.character.spells.race.forEach((spell) => {
    if (!spell.definition) return;
    // for race spells the spell spellCastingAbilityId is on the spell
    // if there is no ability on spell, we default to wis
    let spellCastingAbility = "wis";
    if (hasSpellCastingAbility(spell.spellCastingAbilityId)) {
      spellCastingAbility = convertSpellCastingAbilityId(spell.spellCastingAbilityId);
    }

    const abilityModifier = utils.calculateModifier(character.data.abilities[spellCastingAbility].value);

    let raceInfo = lookups.race.find((rc) => rc.id === spell.componentId);

    if (!raceInfo) {
      // for some reason we haven't matched the race option id with the spell
      // this happens with at least the SCAG optional spells casting half elf
      raceInfo = {
        name: "Racial spell",
        id: spell.componentId,
      };
    }

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
          dc: 8 + proficiencyModifier + abilityModifier,
          overrideDC: false,
        },
      },
    };

    items.push(parseSpell(spell, character));
  });

  // feat spells are handled slightly differently
  ddb.character.spells.feat.forEach((spell) => {
    if (!spell.definition) return;
    // If the spell has an ability attached, use that
    // if there is no ability on spell, we default to wis
    let spellCastingAbility = "wis";
    if (hasSpellCastingAbility(spell.spellCastingAbilityId)) {
      spellCastingAbility = convertSpellCastingAbilityId(spell.spellCastingAbilityId);
    }

    const abilityModifier = utils.calculateModifier(character.data.abilities[spellCastingAbility].value);

    let featInfo = lookups.feat.find((ft) => ft.id === spell.componentId);

    if (!featInfo) {
      // for some reason we haven't matched the feat option id with the spell
      // we fiddle the result
      featInfo = {
        name: "Feat option spell",
        id: spell.componentId,
      };
    }

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
          dc: 8 + proficiencyModifier + abilityModifier,
          overrideDC: false,
        },
      },
    };

    items.push(parseSpell(spell, character));
  });

  if (items) fixSpells(ddb, items);

  return items;
}


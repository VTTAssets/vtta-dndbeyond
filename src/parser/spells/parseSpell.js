import utils from "../../utils.js";

// Import parsing functions
import { getMaterials, getComponents } from "./components.js";
import { getSpellPreparationMode } from "./prepartion.js";
import { getUses } from "./uses.js";
import { getActivation } from "./activation.js";
import { getDuration } from "./duration.js";
import { getTarget } from "./target.js";
import { getRange } from "./range.js";
import { getActionType } from "./action.js";
import { getDamage } from "./damage.js";
import { getSave } from "./save.js";
import { getSpellScaling } from "./scaling.js";

export function parseSpell(data, character) {
  /**
   * MAIN parseSpell
   */
  let spell = {
    type: "spell",
    data: JSON.parse(utils.getTemplate("spell")),
    flags: {
      vtta: {
        dndbeyond: data.flags.vtta.dndbeyond,
      },
    },
  };

  // spell name
  if (data.flags.vtta.dndbeyond.nameOverride !== undefined) {
    spell.name = data.flags.vtta.dndbeyond.nameOverride;
  } else {
    spell.name = data.definition.name;
  }

  // add tags
  spell.flags.vtta.dndbeyond.tags = data.definition.tags;

  // spell level
  spell.data.level = data.definition.level;

  // get the spell school
  spell.data.school = utils.findInConfig("spellSchools", data.definition.school);

  /**
   * Gets the necessary spell components VSM + material
   */
  spell.data.components = getComponents(data);

  spell.data.materials = getMaterials(data);

  spell.data.preparation = getSpellPreparationMode(data);

  spell.data.description = {
    value: data.definition.description,
    chat: data.definition.description,
    unidentified: data.definition.type,
  };

  spell.data.source = utils.parseSource(data.definition);

  spell.data.activation = getActivation(data);

  spell.data.duration = getDuration(data);

  spell.data.target = getTarget(data);

  spell.data.range = getRange(data);

  spell.data.actionType = getActionType(data);

  spell.data.damage = getDamage(data);

  spell.data.save = getSave(data);

  spell.data.scaling = getSpellScaling(data);

  spell.data.uses = getUses(data);

  // attach the spell ability id to the spell data so VTT always uses the
  // correct one, useful if multi-classing and spells have different
  // casting abilities
  if (character.data.attributes.spellcasting !== data.flags.vtta.dndbeyond.ability) {
    spell.data.ability = data.flags.vtta.dndbeyond.ability;
  }

  // If using better rolls we set alt to be versatile for spells like
  // Toll The Dead
  spell.flags.betterRolls5e = {
    quickVersatile: {
      altValue: true,
    },
  };

  return spell;
}

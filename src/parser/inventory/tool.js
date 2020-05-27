import DICTIONARY from "../dictionary.js";
import utils from "../../utils.js";

/**
 * Checks the proficiency of the character with this specific weapon
 * @param {obj} data Item data
 * @param {array} proficiencies The character's proficiencies as an array of `{ name: 'PROFICIENCYNAME' }` objects
 */
let getProficient = (data, proficiencies) => {
  return proficiencies.find((proficiency) => proficiency.name === data.definition.name) !== undefined;
};

/**
 * Checks if the character can attune to an item and if yes, if he is attuned to it.
 */
let getAttuned = (data) => {
  if (data.definition.canAttune !== undefined && data.definition.canAttune === true) {
    return data.isAttuned;
  } else {
    return false;
  }
};

/**
 * Checks if the character can equip an item and if yes, if he is has it currently equipped.
 */
let getEquipped = (data) => {
  if (data.definition.canEquip !== undefined && data.definition.canEquip === true) {
    return data.equipped;
  } else {
    return false;
  }
};

/**
 * Gets Limited uses information, if any
 * uses: { value: 0, max: 0, per: null }
 */
let getUses = (data) => {
  if (data.limitedUse !== undefined && data.limitedUse !== null) {
    let resetType = DICTIONARY.resets.find((reset) => reset.id == data.limitedUse.resetType);
    return {
      max: data.limitedUse.maxUses,
      value: data.limitedUse.numberUsed
        ? data.limitedUse.maxUses - data.limitedUse.numberUsed
        : data.limitedUse.maxUses,
      per: resetType.value,
    };
  } else {
    return { value: 0, max: 0, per: null };
  }
};

export default function parseTool(data, character) {
  /**
   * MAIN parseTool
   */
  let tool = {
    name: data.definition.name,
    type: "tool",
    data: JSON.parse(utils.getTemplate("tool")),
    flags: {
      vtta: {
        dndbeyond: {
          type: data.definition.type,
        },
      },
    },
  };

  /* "ability": "int", */
  // well. How should I know how YOU are using those tools. By pure intellect? Or with your hands?
  tool.data.ability = "dex";

  // description: {
  //     value: '',
  //     chat: '',
  //     unidentified: ''
  // },
  tool.data.description = {
    value: data.definition.description,
    chat: data.definition.description,
    unidentified: data.definition.type,
  };

  /* proficient: true, */
  tool.data.proficient = getProficient(data, character.flags.vtta.dndbeyond.proficiencies) ? 1 : 0; // note: here, proficiency is not a bool, but a number (0, 0.5, 1, 2) based on not/jack of all trades/proficient/expert.

  /* source: '', */
  tool.data.source = utils.parseSource(data.definition);

  /* quantity: 1, */
  tool.data.quantity = data.quantity ? data.quantity : 1;

  /* weight */
  const bundleSize = data.definition.bundleSize ? data.definition.bundleSize : 1;
  const totalWeight = data.definition.weight ? data.definition.weight : 0;
  tool.data.weight = totalWeight / bundleSize;

  /* price */
  tool.data.price = data.definition.cost ? data.definition.cost : 0;

  /* attuned: false, */
  tool.data.attuned = getAttuned(data);

  /* equipped: false, */
  tool.data.equipped = getEquipped(data);

  /* rarity: '', */
  tool.data.rarity = data.definition.rarity;

  /* identified: true, */
  tool.data.identified = true;

  tool.data.uses = getUses(data);

  return tool;
}

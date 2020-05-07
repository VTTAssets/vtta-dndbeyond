import DICTIONARY from "../dictionary.js";
import utils from "../../utils.js";

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
 * Checks if the character can attune to an item and if yes, if he is attuned to it.
 */
let getAttuned = data => {
  if (
    data.definition.canAttune !== undefined &&
    data.definition.canAttune === true
  )
    return data.isAttuned;
};

/**
 * Checks if the character can equip an item and if yes, if he is has it currently equipped.
 */
let getEquipped = data => {
  if (
    data.definition.canEquip !== undefined &&
    data.definition.canEquip === true
  )
    return data.equipped;
};

export default function parseLoot(data, character) {
  /**
   * MAIN parseLoot
   */
  let loot = {
    name: data.definition.name,
    type: "loot",
    data: JSON.parse(utils.getTemplate("loot")), // was: tool
    flags: {
      vtta: {
        dndbeyond: {
          type: data.definition.type
        }
      }
    }
  };

  /* description: { 
        value: '', 
        chat: '', 
        unidentified: '' 
    }, */
  loot.data.description = {
    value: data.definition.description,
    chat: data.definition.description,
    unidentified: data.definition.type
  };

  /* source: '', */
  loot.data.source = getSource(data);

  /* quantity: 1, */
  loot.data.quantity = data.quantity ? data.quantity : 1;

  /* weight */
  const bundleSize = data.definition.bundleSize ? data.definition.bundleSize : 1;
  const totalWeight = data.definition.weight ? data.definition.weight : 0;
  loot.data.weight = totalWeight / bundleSize;

  /* price */
  loot.data.price = data.definition.cost ? data.definition.cost : 0;

  /* attuned: false, */
  loot.data.attuned = getAttuned(data);

  /* equipped: false, */
  loot.data.equipped = getEquipped(data);

  /* rarity: '', */
  loot.data.rarity = data.definition.rarity;

  /* identified: true, */
  loot.data.identified = true;

  return loot;
}

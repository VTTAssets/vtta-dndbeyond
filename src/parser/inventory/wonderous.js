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

/**
 * Gets Limited uses information, if any
 * uses: { value: 0, max: 0, per: null }
 */
let getUses = data => {
  if (data.limitedUse !== undefined && data.limitedUse !== null){
    let resetType = DICTIONARY.resets.find(
      reset => reset.id == data.limitedUse.resetType
    );
    return {
      max: data.limitedUse.maxUses,
      value: data.limitedUse.numberUsed
        ? data.limitedUse.maxUses - data.limitedUse.numberUsed
        : data.limitedUse.maxUses,
      per: (!!resetType) ? resetType.value : "",
      description: data.limitedUse.resetTypeDescription,
    };
  } else {
    return { value: 0, max: 0, per: null };
  };
};

export default function parseWonderous(data, character) {
  /**
   * MAIN parseEquipment
   */
  let item = {
    name: data.definition.name,
    type: "equipment",
    data: JSON.parse(utils.getTemplate("equipment")),
    flags: {
      vtta: {
        dndbeyond: {
          type: data.definition.type
        }
      }
    }
  };

  /* 
    "armor": {
    "type": "trinket",
    "value": 10,
    "dex": null
  } */
  item.data.armor = {
    "type": "trinket",
    "value": 10,
    "dex": null
  };

  /* "strength": 0 */
  item.data.strength = 0;

  /* "stealth": false,*/
  item.data.stealth = false;

  /* proficient: true, */
  item.data.proficient = true;

  /* description: { 
            value: '', 
            chat: '', 
            unidentified: '' 
        }, */
  item.data.description = {
    value: data.definition.description,
    chat: data.definition.description,
    unidentified: data.definition.type
  };

  /* source: '', */
  item.data.source = getSource(data);

  /* quantity: 1, */
  item.data.quantity = data.quantity ? data.quantity : 1;

  /* weight */
  //item.data.weight = data.definition.weight ? data.definition.weight : 0;
  let bundleSize = data.definition.bundleSize ? data.definition.bundleSize : 1;
  let totalWeight = data.definition.weight ? data.definition.weight : 0;
  item.data.weight =
    (totalWeight / bundleSize) * (item.data.quantity / bundleSize);

  /* price */
  item.data.price = data.definition.cost ? data.definition.cost : 0;

  /* attuned: false, */
  item.data.attuned = getAttuned(data);

  /* equipped: false, */
  item.data.equipped = getEquipped(data);

  /* rarity: '', */
  item.data.rarity = data.definition.rarity;

  /* identified: true, */
  item.data.identified = true;

  item.data.uses = getUses(data);

  return item;
}

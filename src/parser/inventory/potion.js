import DICTIONARY from "../dictionary.js";
import utils from "../../utils.js";

/**
 * Gets Limited uses information, if any
 */
let getUses = data => {
  // uses: { value: 0, max: 0, per: null }
  if (data.limitedUse) {
    if (data.limitedUse.resetType === "Consumable") {
      return {
        max: data.limitedUse.maxUses,
        value: data.limitedUse.numberUsed
          ? data.limitedUse.maxUses - data.limitedUse.numberUsed
          : data.limitedUse.maxUses,
        per: "charges",
        autoUse: false,
        autoDestroy: true
      };
    } else {
      return {
        max: data.limitedUse.maxUses,
        value: data.limitedUse.numberUsed
          ? data.limitedUse.maxUses - data.limitedUse.numberUsed
          : data.limitedUse.maxUses,
        per: "charges",
        autoUse: false,
        autoDestroy: true
      };
    }
  } else {
    // default
    return { value: 0, max: 0, per: null, autoUse: false, autoDestroy: false };
  }
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

let getActionType = data => {
  if (data.definition.tags.includes("Healing")) {
    return "heal";
  }
  if (data.definition.tags.includes("Damage")) {
    // ranged spell attack. This is a good guess
    return "rsak";
  }
  return "other";
};

let getDamage = (data, actionType) => {
  // is this a damage potion
  switch (actionType) {
    case "heal":
      // healing potion
      // we only get the first matching modifier
      let healingModifier = data.definition.grantedModifiers.find(
        mod => mod.type === "bonus" && mod.subType === "hit-points"
      );
      if (healingModifier) {
        return {
          parts: [[healingModifier.dice.diceString, "healing"]],
          versatile: ""
        };
      } else {
        return { parts: [], versatile: "" };
      }
      break;
    case "rsak":
      // damage potion
      let damageModifier = data.definition.grantedModifiers.find(
        mod => mod.type === "damage" && mod.dice
      );
      if (damageModifier) {
        return {
          parts: [[damageModifier.dice.diceString, damageModifier.subType]],
          versatile: ""
        };
      } else {
        return { parts: [], versatile: "" };
      }
      break;
    default:
      // anything else we don't support
      return { parts: [], versatile: "" };
  }
};

export default function parsePotion(data, character) {
  /**
   * MAIN parseWeapon
   */
  let consumable = {
    name: data.definition.name,
    type: "consumable",
    data: JSON.parse(utils.getTemplate("consumable")),
    flags: {
      vtta: {
        dndbeyond: {
          type: data.definition.type
        }
      }
    }
  };

  // "consumableType": "potion",
  consumable.data.consumableType = "potion";
  consumable.data.uses = getUses(data);

  /* description: { 
        value: '', 
        chat: '', 
        unidentified: '' 
    }, */
  consumable.data.description = {
    value: data.definition.description,
    chat: data.definition.description,
    unidentified: data.definition.type
  };

  /* source: '', */
  consumable.data.source = getSource(data);

  /* quantity: 1, */
  consumable.data.quantity = data.quantity ? data.quantity : 1;

  /* weight */
  //consumable.data.weight = data.definition.weight ? data.definition.weight : 0;
  let bundleSize = data.definition.bundleSize ? data.definition.bundleSize : 1;
  let totalWeight = data.definition.weight ? data.definition.weight : 0;
  consumable.data.weight =
    (totalWeight / bundleSize) * (consumable.data.quantity / bundleSize);

  /* price */
  consumable.data.price = data.definition.cost ? data.definition.cost : 0;

  /* attuned: false, */
  consumable.data.attuned = getAttuned(data);

  /* equipped: false, */
  consumable.data.equipped = getEquipped(data);

  /* rarity: '', */
  consumable.data.rarity = data.definition.rarity;

  /* identified: true, */
  consumable.data.identified = true;

  /* activation: { type: '', cost: 0, condition: '' }, */
  consumable.data.activation = { type: "action", cost: 1, condition: "" };

  /* duration: { value: null, units: '' }, */
  // we leave that as-is

  /* target: { value: null, units: '', type: '' }, */
  // we leave that as-is

  /* range: { value: null, long: null, units: '' }, */
  // we leave that as is

  consumable.data.actionType = getActionType(data);

  consumable.data.damage = getDamage(data, getActionType(data));

  return consumable;
}

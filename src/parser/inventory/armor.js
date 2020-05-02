import DICTIONARY from "../dictionary.js";
import utils from "../../utils.js";
/**
 * Gets the DND5E weapontype (simpleM, martialR etc.) as string
 * Supported Types only: Simple/Martial Melee/Ranged and Ammunition (Firearms in D&DBeyond)
 * @param {obj} data item data
 */
let getArmorType = data => {
  // get the generic armor type
  const entry = DICTIONARY.equipment.armorType.find(
    type => type.name === data.definition.type
  );

  // get the armor class
  const baseArmorClass = data.definition.armorClass;
  const bonusArmorClass = data.definition.grantedModifiers.reduce((prev, cur) => {
    if (cur.type === "bonus" && cur.subType === "armor-class" && cur.value) {
      return cur.value;
    } else {
      return 0;
    }
  }, 0);

  // get the max dex modifier (Medium Armor: 2, Heavy: 0)
  let maxDexModifier 
  switch (data.definition.type) {
    case "Heavy Armor":
      maxDexModifier = 0;
      break;
    case "Medium Armor":
      maxDexModifier = 2;
      break;
    default:
      maxDexModifier = "";
  }


  return {
    type: entry !== undefined ? entry.value : "medium",
    value: baseArmorClass + bonusArmorClass,
    dex: maxDexModifier
  };
};

/**
 * Gets the strength requirement to wear this armor, if any
 * @param {obj} data Item data
 */
let getStrength = data => {
  return data.definition.strengthRequirement !== null
    ? data.definition.strengthRequirement
    : 0;
};

/**
 * Wearing this armor can give a disadvantage on stealth checks
 */
let getStealthPenalty = data => {
  return data.definition.stealthCheck === 2;
};

/**
 * Checks the proficiency of the character with this specific weapon
 * @param {obj} data Item data
 * @param {array} proficiencies The character's proficiencies as an array of `{ name: 'PROFICIENCYNAME' }` objects
 */
let getProficient = (data, proficiencies) => {
  // Proficiency in armor category (Light Armor, Shield)
  if (
    proficiencies.find(
      proficiency => proficiency.name === data.definition.type
    ) !== -1
  )
    return true;
  // Specific proficiency
  if (
    proficiencies.find(
      proficiency => proficiency.name === data.definition.baseArmorName
    ) !== -1
  )
    return true;
  return false;
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
      per: resetType.value,
      description: data.limitedUse.resetTypeDescription,
    };
  } else {
    return { value: 0, max: 0, per: null };
  };
};

export default function parseArmor(data, character) {
  /**
   * MAIN parseEquipment
   */
  let armor = {
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
        "type": "light",
        "value": 10,
        "dex": null
    } */
  armor.data.armor = getArmorType(data);

  /* "strength": 0 */
  armor.data.strength = getStrength(data);

  /* "stealth": false,*/
  armor.data.stealth = getStealthPenalty(data);

  /* proficient: true, */
  armor.data.proficient = getProficient(
    data,
    character.flags.vtta.dndbeyond.proficiencies
  );

  /* description: { 
            value: '', 
            chat: '', 
            unidentified: '' 
        }, */
  armor.data.description = {
    value: data.definition.description,
    chat: data.definition.description,
    unidentified: data.definition.type
  };

  /* source: '', */
  armor.data.source = getSource(data);

  /* quantity: 1, */
  armor.data.quantity = data.quantity ? data.quantity : 1;

  /* weight */
  //armor.data.weight = data.definition.weight ? data.definition.weight : 0;
  let bundleSize = data.definition.bundleSize ? data.definition.bundleSize : 1;
  let totalWeight = data.definition.weight ? data.definition.weight : 0;
  armor.data.weight =
    (totalWeight / bundleSize) * (armor.data.quantity / bundleSize);

  /* price */
  armor.data.price = data.definition.cost ? data.definition.cost : 0;

  /* attuned: false, */
  armor.data.attuned = getAttuned(data);

  /* equipped: false, */
  armor.data.equipped = getEquipped(data);

  /* rarity: '', */
  armor.data.rarity = data.definition.rarity;

  /* identified: true, */
  armor.data.identified = true;

  //armor.data.uses = getUses(data);

  return armor;
}

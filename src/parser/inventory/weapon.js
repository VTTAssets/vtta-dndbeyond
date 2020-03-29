import DICTIONARY from "../dictionary.js";
import utils from "../../utils.js";

/**
 * Gets the DND5E weapontype (simpleM, martialR etc.) as string
 * Supported Types only: Simple/Martial Melee/Ranged and Ammunition (Firearms in D&DBeyond)
 * @param {obj} data item data
 */
let getWeaponType = data => {
  let entry = DICTIONARY.weapon.weaponType.find(
    type =>
      type.categoryId === data.definition.categoryId &&
      type.attackType === data.definition.attackType
  );

  return entry !== undefined ? entry.value : "simpleM";
};

/**
 * Gets the weapons's properties (Finesse, Reach, Heavy etc.)
 * @param {obj} data Item data
 */
let getProperties = data => {
  let result = {};
  DICTIONARY.weapon.properties.forEach(property => {
    if (
      data.definition.properties &&
      Array.isArray(data.definition.properties)
    ) {
      result[property.value] =
        data.definition.properties.find(prop => prop.name === property.name) !==
        undefined;
    }
  });
  return result;
};

/**
 * Checks the proficiency of the character with this specific weapon
 * @param {obj} data Item data
 * @param {string} weaponType The DND5E weaponType
 * @param {array} proficiencies The character's proficiencies as an array of `{ name: 'PROFICIENCYNAME' }` objects
 */
let getProficient = (data, weaponType, proficiencies) => {
  // if it's a simple weapon and the character is proficient in simple weapons:
  if (
    proficiencies.find(proficiency => proficiency.name === "Simple Weapons") &&
    weaponType.indexOf("simple") !== -1
  )
    return true;
  if (
    proficiencies.find(proficiency => proficiency.name === "Martial Weapons") &&
    weaponType.indexOf("martial") !== -1
  )
    return true;
  return (
    proficiencies.find(
      proficiency => proficiency.name === data.definition.type
    ) !== undefined
  );
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
 * Gets the range(s) of a given weapon
 */
let getRange = data => {
  // range: { value: null, long: null, units: '' },
  return {
    value: data.definition.range ? data.definition.range : 5,
    long: data.definition.longRange ? data.definition.longRange : 5,
    units: "ft."
  };
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
    };
  } else {
    return { value: 0, max: 0, per: null };
  };
};

/**
 * Gets the ability which the to hit modifier is baed on
 * Melee: STR
 * Ranged: DEX
 * Finesse: STR || DEX
 * Thrown: STR, unless Finesse, then STR || DEX
 * @param {obj} data item data
 * @param {obj} weaponProperties weapon properties
 * @param {obj} weaponRange weapon range information
 * @param {obj} abilities character abilities (scores)
 */
let getAbility = (weaponProperties, weaponRange, abilities) => {
  // finesse weapons can choose freely, so we choose the higher one
  if (weaponProperties.fin) {
    return abilities.str.value > abilities.dex.value ? "str" : "dex";
  }

  // thrown, but not finesse weapon: STR
  if (weaponProperties.thr) {
    return "str";
  }

  // if it's a ranged weapon, and hot a reach weapon (long = 10 (?))
  if (weaponRange.long !== 5 && !weaponProperties.rch) {
    return "dex";
  }

  // the default is STR
  return "str";
};

/**
 * Searches for a magical attack bonus granted by this weapon
 * @param {obj} data item data
 */
let getMagicalBonus = data => {
  let boni = data.definition.grantedModifiers.filter(
    mod =>
      mod.type === "bonus" &&
      mod.subType === "magic" &&
      mod.value &&
      mod.value !== 0
  );
  let bonus = boni.reduce((prev, cur) => prev + cur.value, 0);
  return bonus;
};

/**
 *
 * @param {obj} data item data
 * @param {obj} weaponProperties weapon properties
 * /* damage: { parts: [], versatile: '' }, * /
 */
let getDamage = (data, magicalDamageBonus) => {
  let versatile = data.definition.properties.find(
    property => property.name === "Versatile"
  );
  if (versatile && versatile.notes) {
    versatile =
      utils.parseDiceString(versatile.notes + `+${magicalDamageBonus}`)
        .diceString + " + @mod";
  } else {
    versatile = "";
  }

  let parts = [];

  // first damage part
  // blowguns and other weapons rely on ammunition that provides the damage parts
  if (
    data.definition.damage &&
    data.definition.damage.diceString &&
    data.definition.damageType
  ) {
    // if there is a magical damage bonus, it probably should only be included into the first damage part.
    parts.push([
      utils.parseDiceString(
        data.definition.damage.diceString + `+${magicalDamageBonus}`
      ).diceString + " + @mod",
      utils.findInConfig("damageTypes", data.definition.damageType)
    ]);
  }

  // additional damage parts
  // Note: For the time being, restricted additional bonus parts are not included in the damage
  //       The Saving Throw Freature within Foundry is not fully implemented yet, to this will/might change
  data.definition.grantedModifiers
    .filter(
      mod =>
        mod.type === "damage" && mod.restriction && mod.restriction.length === 0
    )
    .forEach(mod => {
      if (mod.dice) {
        parts.push([mod.dice.diceString, mod.subType]);
      } else {
        if (mod.value) {
          parts.push([mod.value, mod.subType]);
        }
      }
    });

  let result = {
    parts: parts,
    versatile: versatile
  };

  return result;
};

export default function parseWeapon(data, character) {
  /**
   * MAIN parseWeapon
   */
  let weapon = {
    name: data.definition.name,
    type: "weapon",
    data: JSON.parse(utils.getTemplate("weapon")),
    flags: {
      vtta: {
        dndbeyond: {
          type: data.definition.type
        }
      }
    }
  };

  /* weaponType: { value: 'simpleM' }, */
  // NOTE: In game, it's `weaponType: 'simpleM'`, checking with Andrew is that is intended (I suppose so, but then the template.json is incorrect)
  weapon.data.weaponType = getWeaponType(data);
  /* properties: {
            amm: false,
            fin: false,
            hvy: true,
            lgt: false,
            rel: false,
            fir: false,
            rch: true,
            spc: false,
            thr: false,
            two: true,
            ver: false
        } */
  weapon.data.properties = getProperties(data);

  /* proficient: true, */
  weapon.data.proficient = getProficient(
    data,
    weapon.data.weaponType,
    character.flags.vtta.dndbeyond.proficiencies
  );

  /* description: { 
            value: '', 
            chat: '', 
            unidentified: '' 
        }, */
  weapon.data.description = {
    value: data.definition.description,
    chat: data.definition.description,
    unidentified: data.definition.type
  };

  /* source: '', */
  weapon.data.source = getSource(data);

  /* quantity: 1, */
  weapon.data.quantity = data.quantity ? data.quantity : 1;

  /* weight */
  //weapon.data.weight = data.definition.weight ? data.definition.weight : 0;
  let bundleSize = data.definition.bundleSize ? data.definition.bundleSize : 1;
  let totalWeight = data.definition.weight ? data.definition.weight : 0;
  weapon.data.weight =
    (totalWeight / bundleSize) * (weapon.data.quantity / bundleSize);

  /* price */
  weapon.data.price = data.definition.cost ? data.definition.cost : 0;

  /* attuned: false, */
  weapon.data.attuned = getAttuned(data);

  /* equipped: false, */
  weapon.data.equipped = getEquipped(data);

  /* rarity: '', */
  weapon.data.rarity = data.definition.rarity;

  /* identified: true, */
  weapon.data.identified = true;

  /* activation: { type: '', cost: 0, condition: '' }, */
  weapon.data.activation = { type: "action", cost: 1, condition: "" };

  /* duration: { value: null, units: '' }, */
  // we leave that as-is

  /* target: { value: null, units: '', type: '' }, */
  // we leave that as-is

  /* range: { value: null, long: null, units: '' }, */
  weapon.data.range = getRange(data);

  /* uses: { value: 0, max: 0, per: null }, */
  weapon.data.uses = getUses(data);

  /* ability: null, */
  weapon.data.ability = getAbility(
    weapon.data.properties,
    weapon.data.range,
    character.data.abilities
  );

  /* actionType: null, */
  weapon.data.actionType = weapon.data.range.long === 5 ? "mwak" : "rwak";

  /* attackBonus: 0, */
  weapon.data.attackBonus = getMagicalBonus(data);

  /* chatFlavor: '', */
  // we leave that as-is

  /* critical: null, */
  // we leave that as-is

  /* damage: { parts: [], versatile: '' }, */
  // We are adding the magical bonus here, too.
  // Not a friend of calculating it twice, but it's more obvious about what is happening and the calc is somewhat cheap
  weapon.data.damage = getDamage(data, getMagicalBonus(data));

  /* formula: '', */
  // we leave that as-is

  /* save: { ability: '', dc: null } */
  // we leave that as-is
  return weapon;
}

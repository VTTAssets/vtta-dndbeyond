import DICTIONARY from "../dictionary.js";
import utils from "../../utils.js";

function martialArtsDamage(ddb, action) {
  /* damage: { parts: [], versatile: '' }, */
  const damageType = DICTIONARY.actions.activationTypes.find((type) => type.id === action.damageTypeId).value;

  // are we dealing with martial arts?
  if (action.isMartialArts) {
    const classes = ddb.character.classes.filter(
      (cls) => cls.classFeatures.find((feature) => feature.name === "Martial Arts") !== -1
    );

    const die = classes.map((cls) => {
      const feature = cls.classFeatures.find((feature) => feature.definition.name === "Martial Arts");

      if (feature && feature.levelScale && feature.levelScale.dice && feature.levelScale.dice.diceString) {
        return feature.levelScale.dice.diceString;
      } else if (action.dice !== null) {
        // On some races bite is considered a martial art, damage
        // is different and on the action itself
        return action.dice.diceString;
      } else {
        return "1d4";
      }
    });

    // set the weapon damage
    return {
      parts: [[die + "+ @mod", damageType]],
      versatile: "",
    };
  } else if (action.dice !== null) {
    // The Lizardfolk jaws have a different base damage, its' detailed in
    // dice so lets capture that for actions if it exists
    return {
      parts: [[action.dice.diceString + " + @mod", damageType]],
      versatile: "",
    };
  } else {
    // default to basics
    return {
      parts: [["1 + @mod", damageType]],
      versatile: "",
    };
  }
}

function getAttackAction(ddb, character, action) {
  let weapon = null;
  try {
    weapon = {
      name: action.name,
      type: "weapon",
      data: JSON.parse(utils.getTemplate("weapon")),
    };

    if (action.isMartialArts) {
      weapon.flags = {
        vtta: {
          dndbeyond: {
            type: "Martial Arts",
          },
        },
      };
    }

    weapon.data.proficient = action.isProficient ? 1 : 0;
    weapon.data.description = {
      value: action.snippet ? action.snippet : "",
      chat: action.snippet ? action.snippet : "",
      unidentified: "",
    };
    weapon.data.equipped = true;
    weapon.data.rarity = "common";
    weapon.data.identified = true;
    const actionType = DICTIONARY.actions.activationTypes.find((type) => type.id === action.activation.activationType);
    weapon.data.activation = !actionType
      ? {}
      : {
          type: actionType.value,
          cost: action.activation.activationTime || 1,
          condition: "",
        };

    // TODO: This is not entirely correct. Should look up if it has a special reach feature
    weapon.data.range = { value: 5, units: "ft.", long: "" };
    weapon.data.ability = action.isMartialArts
      ? character.data.abilities.dex.value >= character.data.abilities.str.value
        ? "dex"
        : "str"
      : "str";
    // TODO: we can also parse this out of the action block
    weapon.data.actionType = "mwak";
    weapon.data.damage = martialArtsDamage(ddb, action);
  } catch (err) {
    utils.warn(`Unrecognized Attack Action: ${action.name}, please log a bug report. Err: ${err.message}`, "extension");
  }
  console.log("Weapon Parsed: " + JSON.stringify(weapon));
  return weapon;
}

/**
 * Everyone has an Unarmed Strike
 * @param {*} ddb
 */
function getUnarmedStrike(ddb, character) {
  const unarmedStikeMock = {
    limitedUse: null,
    name: "Unarmed Strike",
    description: null,
    snippet:
      "Instead of using a weapon to make a melee weapon attack, you can use an unarmed strike: a punch, kick, head-butt, or similar forceful blow (none of which count as weapons). On a hit, an unarmed strike deals bludgeoning damage equal to 1 + your Strength modifier. You are proficient with your unarmed strikes.",
    abilityModifierStatId: null,
    attackTypeRange: 1,
    actionType: 1,
    attackSubtype: 3,
    dice: null,
    value: 1,
    damageTypeId: 1,
    isMartialArts: true,
    isProficient: true,
    displayAsAttack: true,
    range: {
      range: null,
      longRange: null,
      aoeType: null,
      aoeSize: null,
      hasAoeSpecialDescription: false,
    },
    activation: {
      activationTime: null,
      activationType: 1,
    },
  };
  const unarmedStrike = getAttackAction(ddb, character, unarmedStikeMock);
  return unarmedStrike;
}

/**
 * Try and parse attack actions - this will at the moment only really support basic melee attacks
 * @param {*} ddb
 * @param {*} character
 */
function getAttackActions(ddb, character) {
  console.log(
    JSON.stringify([ddb.character.actions.class, ddb.character.actions.race, ddb.character.actions.feat].flat())
  );
  const debug = [ddb.character.actions.class, ddb.character.actions.race, ddb.character.actions.feat]
    .flat()
    .filter((action) => action.displayAsAttack && action.displayAsAttack === true);
  console.log(JSON.stringify(debug));
  const actions = [ddb.character.actions.class, ddb.character.actions.race, ddb.character.actions.feat]
    .flat()
    .filter((action) => action.displayAsAttack && action.displayAsAttack === true)
    .map((action) => {
      return getAttackAction(ddb, character, action);
    });

  console.log("Attack Actions: " + JSON.stringify(actions));
  return actions;
}

/**
 * Lets Parse remaining actions
 * @param {*} ddb
 * @param {*} items
 */
function getOtherActions(ddb, items) {
  const debug = [ddb.character.actions.race, ddb.character.actions.class, ddb.character.actions.feat].flat().filter(
    (action) =>
      // lets grab other actions and add, make sure we don't get attack based ones that haven't parsed
      !action.displayAsAttack ||
      (action.displayAsAttack === true && !items.some((attack) => attack.name === action.name))
  );
  console.log(JSON.stringify(debug));
  const actions = [ddb.character.actions.race, ddb.character.actions.class, ddb.character.actions.feat]
    .flat()
    .filter(
      (action) =>
        // lets grab other actions and add, make sure we don't get attack based ones that haven't parsed
        !action.displayAsAttack ||
        (action.displayAsAttack === true && !items.some((attack) => attack.name === action.name))
    )
    .map((action) => {
      let feat = {
        name: action.name,
        type: "feat",
        data: JSON.parse(utils.getTemplate("feat")),
      };
      if (action.activation) {
        const actionType = DICTIONARY.actions.activationTypes.find(
          (type) => type.id === action.activation.activationType
        );
        const activation = !actionType
          ? {}
          : {
              type: actionType.value,
              cost: action.activation.activationTime || 1,
              condition: "",
            };
        feat.data.activation = activation;
      }

      feat.data.description = {
        value: action.snippet ? action.snippet : "",
        chat: action.snippet ? action.snippet : "",
        unidentified: "",
      };

      if (action.limitedUse && action.limitedUse.max) {
        const resetType = DICTIONARY.resets((type) => type.id === action.limitedUse.resetType);
        feat.data.uses = {
          value: action.limitedUse.value,
          max: action.limitedUse.max,
          per: resetType ? resetType.value : "",
        };
      }
      console.log("Feature Parsed: " + JSON.stringify(feat));
      return feat;
    });
  console.log("Other Actions: " + JSON.stringify(actions));
  // TODO: We maybe able to look up other entities here to get details for things like Sneak Attack
  return actions;
}

export default function parseActions(ddb, character) {
  let actions = [
    // Get Attack Actions that we know about, typically natural attacks etc
    ...getAttackActions(ddb, character),
    // Everyone has an Unarmed Strike
    getUnarmedStrike(ddb, character),
  ];
  actions = [
    ...actions,
    // Try and parse other relevant actions
    ...getOtherActions(ddb, actions),
  ];

  console.warn(JSON.stringify(actions));
  // sort alphabetically, then by action type
  actions.sort().sort((a, b) => {
    console.log(JSON.stringify(a));
    if (!a.data.activation.activationType) {
      return 1;
    } else if (!b.data.activation.activationType) {
      return -1;
    } else {
      const aActionTypeID = DICTIONARY.actions.activationTypes.find(
        (type) => type.value === a.data.activation.activationType
      ).id;
      const bActionTypeID = DICTIONARY.actions.activationTypes.find(
        (type) => type.value === b.data.activation.activationType
      ).id;
      if (aActionTypeID > bActionTypeID) {
        return 1;
      } else if (aActionTypeID < bActionTypeID) {
        return -1;
      } else {
        return 0;
      }
    }
  });

  console.log(JSON.stringify(actions));
  return actions;
}

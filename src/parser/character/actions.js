import DICTIONARY from "../dictionary.js";
import utils from "../../utils.js";

export default function parseActions(ddb, character) {
  let items = [];

  let actions = [ddb.character.actions.class, ddb.character.actions.race, ddb.character.actions.background]
    .filter((action) => action !== undefined)
    .flat()
    .filter((action) => action.displayAsAttack === true);

  actions.forEach((action) => {
    let weapon = null;
    switch (action.name) {
      case "Unarmed Strike":
      case "Hooves":
      case "Talon":
      case "Bite":
        weapon = {
          name: action.name,
          type: "weapon",
          data: JSON.parse(utils.getTemplate("weapon")),
        };
        weapon.flags = {
          vtta: {
            dndbeyond: {
              type: "Martial Arts",
            },
          },
        };

        // Unarmed Strikes are always proficient
        weapon.data.proficient = 1;

        // description
        weapon.data.description = {
          value: action.description,
          chat: action.description,
          unidentified: "",
        };

        weapon.data.equipped = true;

        /* rarity: '', */
        weapon.data.rarity = "common";

        /* identified: true, */
        weapon.data.identified = true;

        /* activation: { type: '', cost: 0, condition: '' }, */
        weapon.data.activation = { type: "action", cost: 1, condition: "" };

        // This is not entirely correct. Should look up if it has a special reach feature
        weapon.data.range = { value: 5, units: "ft.", long: "" };

        /* ability: null, */
        weapon.data.ability = action.isMartialArts
          ? character.data.abilities.dex.value >= character.data.abilities.str.value
            ? "dex"
            : "str"
          : "str";

        /* actionType: null, */
        weapon.data.actionType = "mwak";

        /* damage: { parts: [], versatile: '' }, */
        // are we dealing with martial arts?
        if (action.isMartialArts) {
          let classes = ddb.character.classes.filter(
            (cls) => cls.classFeatures.find((feature) => feature.name === "Martial Arts") !== -1
          );

          let die = classes.map((cls) => {
            let feature = cls.classFeatures.find((feature) => feature.definition.name === "Martial Arts");

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
          weapon.data.damage = {
            parts: [[die + "+ @mod", "bludgeoning"]],
            versatile: "",
          };
        } else if (action.dice !== null) {
          // The Lizardfolk jaws have a different base damage, its' detailed in
          // dice so lets capture that for actions if it exists
          weapon.data.damage = {
            parts: [[action.dice.diceString + " + @mod", "bludgeoning"]],
            versatile: "",
          };
        } else {
          // default to basics
          weapon.data.damage = {
            parts: [["1d4 + @mod", "bludgeoning"]],
            versatile: "",
          };
        }

        items.push(weapon);
        break;

      default:
        utils.log(`Unrecognized Action: ${action.name}`, "extension");
    }
  });

  // check if we don't have an unarmed strike item now
  if (items.find((item) => item.name === "Unarmed Strike") === undefined) {
    let weapon = {
      name: "Unarmed Strike",
      type: "weapon",
      data: JSON.parse(utils.getTemplate("weapon")),
    };
    weapon.flags = {
      vtta: {
        dndbeyond: {
          type: "Martial Arts",
        },
      },
    };

    // Unarmed Strikes are always proficient
    weapon.data.proficient = 1;

    // description
    weapon.data.description = {
      value:
        "Instead of using a weapon to make a melee weapon attack, you can use an unarmed strike: a punch, kick, head-butt, or similar forceful blow (none of which count as weapons). On a hit, an unarmed strike deals bludgeoning damage equal to 1 + your Strength modifier. You are proficient with your unarmed strikes.",
      chat:
        "Instead of using a weapon to make a melee weapon attack, you can use an unarmed strike: a punch, kick, head-butt, or similar forceful blow (none of which count as weapons). On a hit, an unarmed strike deals bludgeoning damage equal to 1 + your Strength modifier. You are proficient with your unarmed strikes.",
      unidentified: "",
    };

    weapon.data.equipped = true;

    /* rarity: '', */
    weapon.data.rarity = "common";

    /* identified: true, */
    weapon.data.identified = true;

    /* activation: { type: '', cost: 0, condition: '' }, */
    weapon.data.activation = { type: "action", cost: 1, condition: "" };

    // This is not entirely correct. Should look up if it has a special reach feature
    weapon.data.range = { value: 5, units: "ft.", long: "" };

    /* ability: null, */
    weapon.data.ability = "str";

    /* actionType: null, */
    weapon.data.actionType = "mwak";

    // set the weapon damage
    weapon.data.damage = {
      parts: [["1 + @mod", "bludgeoning"]],
      versatile: "",
    };

    items.push(weapon);
  }

  // check limited use actions, too
  actions = [ddb.character.actions.race, ddb.character.actions.class, ddb.character.actions.feat]
    .flat()
    .filter((action) => action.limitedUse && action.limitedUse.maxUses)
    .map((action) => {
      const activationType = DICTIONARY.spell.activationTypes.find(
        (type) => type.activationType === action.activation.activationType
      );
      const activation = !activationType
        ? {}
        : {
            type: activationType.value,
            cost: action.activation.activationTime,
            condition: "",
          };

      return {
        name: action.name,
        description: action.snippet ? action.snippet : "",
        activation: activation,
        value: action.limitedUse.maxUses - action.limitedUse.numberUsed,
        max: action.limitedUse.maxUses,
        sr: action.limitedUse.resetType === 1,
        lr: action.limitedUse.resetType === 1 || action.limitedUse.resetType === 2,
      };
    })
    // sort by maxUses, I guess one wants to track the most uses first, because it's used more often
    .sort((a, b) => {
      if (a.max > b.max) return -1;
      if (a.max < b.max) return 1;
      return 0;
    });

  // the first three are already included in the resources tab, so we do not include them again
  // actions = actions.slice(3, actions.length);
  actions.forEach((action) => {
    let feat = {
      name: action.name,
      type: "feat",
      data: JSON.parse(utils.getTemplate("feat")),
    };

    feat.data.description.value = action.description;
    feat.data.activation = action.activation;
    feat.data.uses = {
      value: action.value,
      max: action.max,
      per: action.sr ? "sr" : action.lr ? "lr" : "",
    };

    items.push(feat);
  });

  return items;
}

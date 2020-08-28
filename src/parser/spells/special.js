import DICTIONARY from "../dictionary.js";
import logger from "../../logger.js";

let getEldritchInvocations = (data) => {
  let damage = 0;
  let range = 0;

  const eldritchBlastMods = data.character.modifiers.class.filter(
    (modifier) => modifier.type === "eldritch-blast" && modifier.isGranted
  );

  eldritchBlastMods.forEach((mod) => {
    switch (mod.subType) {
      case "bonus-damage": {
        // almost certainly CHA :D
        const abilityModifier = DICTIONARY.character.abilities.find((ability) => ability.id === mod.statId).value;
        damage = `@abilities.${abilityModifier}.mod`;
        break;
      }
      case "bonus-range":
        range = mod.value;
        break;
      default:
        logger.warn(`Not yet able to process ${mod.subType}, please raise an issue.`);
    }
  });

  return {
    damage: damage,
    range: range,
  };
};

/**
 * Some spells we need to fix up or massage because they are modified
 * in interesting ways
 * @param {*} ddb
 * @param {*} items
 */
export function fixSpells(ddb, items) {
  items.forEach((spell) => {
    switch (spell.name) {
      // Eldritch Blast is a special little kitten and has some fun Eldritch
      // Invocations which can adjust it.
      case "Eldritch Blast": {
        const eldritchBlastMods = getEldritchInvocations(ddb);
        spell.data.damage.parts[0][0] += " + " + eldritchBlastMods["damage"];
        spell.data.range.value += eldritchBlastMods["range"];
        break;
      }
      // The target/range input data are incorrect on some AOE spells centreted
      // on self.
      // Range is self with an AoE target of 15 ft cube
      // i.e. affects all creatures within 5 ft of caster
      case "Thunderclap":
      case "Word of Radiance":
        spell.data.range = { value: null, units: "self", long: null };
        spell.data.target = { value: "15", units: "ft", type: "cube" };
        break;
      case "Sleep": {
        spell.data.damage = { parts: [["5d8", ""]], versatile: "", value: "" };
        spell.data.scaling = { mode: "level", formula: "2d8" };
        break;
      }
      case "Color Spray": {
        spell.data.damage = { parts: [["6d10", ""]], versatile: "", value: "" };
        spell.data.scaling = { mode: "level", formula: "2d10" };
        break;
      }
      case "Produce Flame":
        spell.data.range = { value: 30, units: "ft", long: null };
        spell.data.target.type = "creature";
        break;
      case "Cloud of Daggers":
      case "Magic Missile":
        spell.data.actionType = "other";
        break;
      case "Chaos Bolt":
        spell.data.damage = { parts: [["2d8", ""], ["1d6", ""]], versatile: "", value: "" };
        break;
      // no default
    }
  });
}

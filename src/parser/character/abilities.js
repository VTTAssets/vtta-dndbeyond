import DICTIONARY from "../dictionary.js";
import utils from "../../utils.js";
/**
 * Retrieves character abilities, including proficiency on saving throws
 * @param {obj} data JSON Import
 * @param {obj} character Character template
 */
export function getAbilities(data) {
  // go through every ability

  let result = {};
  DICTIONARY.character.abilities.forEach((ability) => {
    result[ability.value] = {
      value: 0,
      min: 3,
      proficient: 0,
    };

    const stat = data.character.stats.find((stat) => stat.id === ability.id).value || 0;
    const bonusStat = data.character.bonusStats.find((stat) => stat.id === ability.id).value || 0;
    const overrideStat = data.character.overrideStats.find((stat) => stat.id === ability.id).value || 0;
    const abilityScoreMaxBonus = utils
      .filterBaseModifiers(data, "bonus", "ability-score-maximum")
      .filter((mod) => mod.statId === ability.id)
      .reduce((prev, cur) => prev + cur.value, 0);
    const bonus = utils
      .filterBaseModifiers(data, "bonus", `${ability.long}-score`)
      .filter((mod) => mod.entityId === ability.id)
      .reduce((prev, cur) => prev + cur.value, 0);
    const setAbilities = utils
      .filterBaseModifiers(data, "set", `${ability.long}-score`, [null, "", "if not already higher"])
      .map((mod) => mod.value);
    const cappedBonusExp = /Maximum of (\d*)/i;
    const cappedBonus = utils
      .filterBaseModifiers(data, "bonus", `${ability.long}-score`, false)
      .filter((mod) => mod.entityId === ability.id && mod.restriction && mod.restriction.startsWith("Maximum of "))
      .reduce(
        (prev, cur) => {
          const restricted = cur.restriction ? cappedBonusExp.exec(cur.restriction) : undefined;
          const max = restricted ? restricted[1] : 20;
          return {
            value: prev.value + cur.value,
            cap: Math.max(prev.cap, max),
          };
        },
        { value: 0 + abilityScoreMaxBonus, cap: 20 + abilityScoreMaxBonus }
      );

    const setAbility = Math.max(...[0, ...setAbilities]);
    const calculatedStat = overrideStat === 0 ? stat + bonusStat + bonus + cappedBonus.value : overrideStat;
    const maxAdjustedStat = Math.min(cappedBonus.cap, calculatedStat);
    const overRiddenStat = maxAdjustedStat > setAbility ? maxAdjustedStat : setAbility;
    const proficient =
      data.character.modifiers.class.find(
        (mod) => mod.subType === ability.long + "-saving-throws" && mod.type === "proficiency"
      ) !== undefined
        ? 1
        : 0;

    // update value, mod and proficiency
    result[ability.value].value = overRiddenStat;
    result[ability.value].mod = utils.calculateModifier(result[ability.value].value);
    result[ability.value].proficient = proficient;
  });

  return result;
}

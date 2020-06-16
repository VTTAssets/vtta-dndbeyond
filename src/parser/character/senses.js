import DICTIONARY from "../dictionary.js";
import utils from "../../utils.js";

export function getSensesLookup(data) {
  let senses = [];
  let hasDarkvision = false;
  // custom senses
  if (data.character.customSenses) {
    data.character.customSenses
      .filter((sense) => !sense.distance)
      .forEach((sense) => {
        const s = DICTIONARY.character.senses.find((s) => s.id === sense.senseId);

        const senseName = s ? s.name : null;
        // remember that this darkvision has precedence
        if (senseName === "Darkvision") hasDarkvision = true;

        // remember this sense
        senses.push({ name: senseName, value: sense.distance });
      });
  }

  if (!hasDarkvision) {
    utils.filterBaseModifiers(data, "set-base", "darkvision").forEach((sense) => {
      senses.push({ name: sense.friendlySubtypeName, value: sense.value });
    });
  }

  // Magical bonuses
  utils
    .getActiveItemModifiers(data)
    .filter((mod) => mod.type === "sense")
    .map((mod) => {
      return {
        name: DICTIONARY.character.senses.find((s) => s.id === mod.entityId).name,
        value: mod.value,
      };
    })
    .forEach((mod) => {
      let sense = senses.find((sense) => sense.name === mod.name);
      if (sense) {
        sense.value += mod.value;
      } else {
        if (mod.name === "Darkvision") hasDarkvision = true;
        senses.push({ name: mod.name, value: mod.value });
      }
    });

  return senses;
}

export function getSenses(data) {
  let senses = getSensesLookup(data);

  // sort the senses alphabetically
  senses = senses.sort((a, b) => a.name >= b.name);

  return senses.map((e) => e.name + ": " + e.value + " ft.").join(", ");
}

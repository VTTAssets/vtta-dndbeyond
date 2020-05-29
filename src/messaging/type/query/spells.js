import utils from "../../../utils.js";

const querySpells = async (message) => {
  let compendium = await game.settings.get("vtta-dndbeyond", "entity-spell-compendium");

  if (Array.isArray(message.name)) {
    let results = {};

    await Promise.all(message.name.map(async (name) => {
      const details = await utils.queryCompendium(compendium, name);
      results[name] = details;
    }));

    return { spell: results };
  } else {
    const details = await utils.queryCompendium(compendium, message.name);
    return { spell: details };
  }
};

export default querySpells;

import utils from "../../../utils.js";

const querySpells = async (message) => {
  let compendium = game.settings.get(
    "vtta-dndbeyond",
    "entity-spell-compendium"
  );

  if (Array.isArray(message.name)) {
    let result = {};
    for (let i = 0; i < message.name.length; i++) {
      result[message.name[i]] = await utils.queryCompendium(
        compendium,
        message.name[i]
      );
      return { spell: result };
    }
  } else {
    let result = await utils.queryCompendium(compendium, message.name);
    return { spell: result };
  }
};

export default querySpells;

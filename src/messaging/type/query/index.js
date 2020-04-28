import queryId from "./id.js";
import queryMonster from "./monster.js";
import querySpell from "./spell.js";
import querySpells from "./spells.js";

const query = async (message) => {
  let response;
  switch (message.type) {
    case "id":
      response = await queryId(message);
      break;
    case "monster":
      response = await queryMonster(message);
      break;
    case "spell":
    case "spellref":
      response = await querySpell(message);
      break;
    case "spells":
    case "spellsref":
      response = await querySpells(message);
      break;
  }

  return response;
};

export default query;

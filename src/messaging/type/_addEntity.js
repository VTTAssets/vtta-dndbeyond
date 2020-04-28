import addPage from "./add/page.js";
import addNPC from "./add/npc.js";
import addSpell from "./add/spell.js";

export default function (body) {
  switch (body.type) {
    case "spell":
      return addSpell(body);
    case "npc":
      return addNPC(body);
    case "page":
      return addPage(body);
    default:
      return new Promise((resolve, reject) => reject("Unknown body type"));
  }
}

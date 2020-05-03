import addPage from "./page.js";
import addNPC from "./npc.js";
import addSpell from "./spell.js";

export default function (body) {
  switch (body.type) {
    case "spell":
      return addSpell(body);
    case "npc":
      return addNPC(body);
    case "sourcebook":
      return addPage(body);
    default:
      return new Promise((resolve, reject) => reject("Unknown body type"));
  }
}

import getCharacter from "./character/index.js";
import getFeatures from "./character/features.js";
import getClasses from "./character/classes.js";
import { default as getSpells, parseItemSpells as getItemSpells } from "./character/spells.js";
import getInventory from "./inventory/index.js";
import getActions from "./character/actions.js";

let parseJson = (ddb) => {
  let character = getCharacter(ddb);
  let features = getFeatures(ddb);
  let classes = getClasses(ddb);
  let spells = getSpells(ddb, character);
  let actions = getActions(ddb, character);
  let itemSpells = getItemSpells(ddb, character);
  let inventory = getInventory(ddb, character, itemSpells);

  return {
    character: character,
    features: features,
    classes: classes,
    inventory: inventory,
    spells: spells,
    actions: actions,
    itemSpells: itemSpells,
  };
};

let parser = {
  parseJson: parseJson,
};

export default parser;

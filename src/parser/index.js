import getCharacter from "./character/index.js";
import getFeatures from "./character/features.js";
import getClasses from "./character/classes.js";

import getSpells from "./character/spells.js";
import getInventory from "./inventory/index.js";
import getActions from "./character/actions.js";

let parseJson = ddb => {
  let character = getCharacter(ddb);
  let features = getFeatures(ddb, character);
  let classes = getClasses(ddb, character);
  let inventory = getInventory(ddb, character);
  let spells = getSpells(ddb, character);
  let actions = getActions(ddb, character);

  return {
    character: character,
    features: features,
    classes: classes,
    inventory: inventory,
    spells: spells,
    actions: actions
  };
};

let parser = {
  parseJson: parseJson
};

export default parser;

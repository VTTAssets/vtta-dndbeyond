import DICTIONARY from '../dictionary.js';
// type: weapon
import parseWeapon from './weapon.js';
import parseAmmunition from './ammunition.js';
import parseStaff from './staves.js';

// type: armor
import parseEquipment from './equipment.js';

// type: consumables
import parsePotion from './potion.js';
import parseScroll from './scroll.js';

// type: tool
import parseTool from './tool.js';

// other loot
import parseLoot from './loot.js';
import utils from '../../utils.js';

let parseItem = (data, character) => {
  // is it a weapon?
  if (data.definition.filterType) {
    switch (data.definition.filterType) {
      case 'Weapon':
        if (data.definition.type === 'Ammunition') {
          return parseAmmunition(data, character);
        } else {
          return parseWeapon(data, character);
        }
        break;

      case 'Armor':
        return parseEquipment(data, character);
        break;

      case 'Staff':
        return parseStaff(data, character);
        break;

      case 'Potion':
        return parsePotion(data, character);
        break;
      case 'Scroll':
        return parseScroll(data, character);
        break;
      case 'Other Gear':
        switch (data.definition.subType) {
          case 'Tool':
            return parseTool(data, character);
            break;
          default:
            return parseLoot(data, character);
        }
        break;
      default:
        return parseLoot(data, character);
        break;
    }
  }
  utils.log(
    `Unknown item: ${data.definition.name}, ${data.definition.type}/${data.definition.filterType}`,
    'character'
  );
  return {};
};

export default function getInventory(ddb, character) {
  let items = [];
  // first, check custom name, price or weight
  ddb.character.characterValues.forEach(cv => {
    // try to find a matching item based on the characterValues (an array of custom adjustements to different parts of the character)
    let item = ddb.character.inventory.find(item => item.id === cv.valueId);
    if (item) {
      // check if this property is in the list of supported ones, based on our DICT
      let property = DICTIONARY.item.characterValues.find(entry => entry.typeId === cv.typeId);
      // overwrite the name, weight or price with the custom value
      if (property && cv.value.length !== 0) item.definition[property.value] = cv.value;
    }
  });

  // now parse all items
  for (let entry of ddb.character.inventory) {
    var item = Object.assign({}, parseItem(entry, character));
    if (item) {
      items.push(item);
    }
  }

  // character.customItems missing

  return items;
}

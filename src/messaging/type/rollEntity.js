import utils from '../../utils.js';
import { Dice5e } from '../../../../../systems/dnd5e/module/dice.js';

export default function(entity, data) {
  return new Promise((resolve, reject) => {
    let result = null;

    let roll = data.roll;
    let event = data.event;

    switch (roll.rollType) {
      case 'ABILITY':
        let ability = entity.data.data.abilities[roll.name];

        switch (roll.subtype) {
          case 'SAVE':
            result = Dice5e.d20Roll({
              event: event,
              data: ability,
              title:
                game.i18n.localize('DND5E.Ability' + (roll.name.charAt(0).toUpperCase() + roll.name.slice(1))) +
                ' Saving Throw',
              parts: ['@save'],
              speaker: { actor: entity, alias: data.name },
            });
            resolve(result);
            break;
          case 'CHECK':
            result = Dice5e.d20Roll({
              event: event,
              data: ability,
              title:
                game.i18n.localize('DND5E.Ability' + (roll.name.charAt(0).toUpperCase() + roll.name.slice(1))) +
                ' Ability Check',
              parts: ['@mod'],
              speaker: { actor: entity, alias: data.name },
            });

            resolve(result);
            break;
        }
        break;
      case 'SKILL':
        let skill = entity.data.data.skills[roll.name];
        switch (roll.subtype) {
          // only checks available at this time
          default:
            result = Dice5e.d20Roll({
              event: event,
              data: skill,
              title:
                game.i18n.localize('DND5E.Skill' + (roll.name.charAt(0).toUpperCase() + roll.name.slice(1))) +
                ' Skill Check',
              parts: ['@mod'],
              speaker: { actor: entity, alias: data.name },
            });

            resolve(result);
        }
        break;
      // try to roll an item
      default:
        let item = entity.items.find(item => item.name === roll.name);
        if (item) {
          // Roll spells through the actor
          if (item.data.type === 'spell') {
            return entity.useSpell(item, { configureDialog: !event.shiftKey });
          }

          // Otherwise roll the Item directly
          else return item.roll();
        } else {
          reject('Unknown item');
        }
        break;
    }

    reject('Unknown roll command');
  });
}

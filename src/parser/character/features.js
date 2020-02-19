import utils from '../../utils.js';
import DICTIONARY from '../dictionary.js';

let getSource = data => {
  if (data.definition.sourceId) {
    let source = DICTIONARY.sources.find(source => source.id === data.definition.sourceId);
    if (source) {
      return data.definition.sourcePageNumber ? `${source.name} pg. ${data.definition.sourcePageNumber}` : source.name;
    }
  }
  return '';
};

export default function parseFeatures(ddb, character) {
  let items = [];

  let characterClasses = ddb.character.classes;
  characterClasses.forEach(cls => {
    let features = cls.definition.classFeatures.filter(
      feat =>
        feat.name !== 'Proficiencies' && feat.name !== 'Ability Score Improvement' && feat.requiredLevel <= cls.level
    );
    let source = cls.definition.name;

    features.forEach(feat => {
      // filter proficiencies and Ability Score Improvement
      let item = {
        name: feat.name,
        type: 'feat',
        data: JSON.parse(utils.getTemplate('feat')),
      };

      /* description: { 
          value: '', 
          chat: '', 
          unidentified: '' 
      }, */
      item.data.description = {
        value: feat.description,
        chat: feat.description,
        unidentified: feat.description,
      };

      item.data.source = source;

      items.push(item);
    });

    // subclasses
    if (cls.subclassDefinition && cls.subclassDefinition.classFeatures) {
      features = cls.subclassDefinition.classFeatures.filter(
        feat =>
          feat.name !== 'Bonus Proficiency' &&
          feat.name !== 'Ability Score Improvement' &&
          feat.requiredLevel <= cls.level
      );
      let subSource = cls.subclassDefinition.name;

      features.forEach(feat => {
        // filter proficiencies and Ability Score Improvement
        let item = {
          name: feat.name,
          type: 'feat',
          data: JSON.parse(utils.getTemplate('feat')),
        };

        /* description: { 
          value: '', 
          chat: '', 
          unidentified: '' 
      }, */
        item.data.description = {
          value: feat.description,
          chat: feat.description,
          unidentified: feat.description,
        };

        item.data.source = subSource;

        items.push(item);
      });
    }
  });

  let feats = ddb.character.feats;
  feats.forEach(feat => {
    let item = {
      name: feat.definition.name,
      type: 'feat',
      data: JSON.parse(utils.getTemplate('feat')),
    };

    item.data.description = {
      value: feat.definition.description,
      chat: feat.definition.description,
      unidentified: feat.definition.description,
    };

    item.data.source = getSource(feat);

    items.push(item);
  });

  let racialTraits = ddb.character.race.racialTraits
    .filter(
      trait =>
        !['Ability Score Increase', 'Age', 'Alignment', 'Size', 'Speed', 'Languages'].includes(trait.definition.name)
    )
    .forEach(feat => {
      let item = {
        name: feat.definition.name,
        type: 'feat',
        data: JSON.parse(utils.getTemplate('feat')),
      };

      item.data.description = {
        value: feat.definition.description,
        chat: feat.definition.description,
        unidentified: feat.definition.description,
      };

      item.data.source = getSource(feat);

      items.push(item);
    });

  return items;
}

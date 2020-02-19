import SettingsExtender from './settingsExtender.js';
SettingsExtender();

export default function() {
  const actorCompendiums = game.packs
    .filter(pack => pack.entity === 'Actor')
    .reduce((choices, pack) => {
      choices[pack.collection] = pack.metadata.label;
      return choices;
    }, {});

  const itemCompendiums = game.packs
    .filter(pack => pack.entity === 'Item')
    .reduce((choices, pack) => {
      choices[pack.collection] = pack.metadata.label;
      return choices;
    }, {});

  game.settings.register('vtta-dndbeyond', 'image-upload-directory', {
    name: 'vtta-dndbeyond.image-upload-directory.name',
    hint: 'vtta-dndbeyond.image-upload-directory.hint',
    scope: 'world',
    config: true,
    //type: String,
    type: Azzu.SettingsTypes.DirectoryPicker,
    default: '',
  });

  game.settings.register('vtta-dndbeyond', 'entity-import-policy', {
    name: 'vtta-dndbeyond.entity-import-policy.name',
    hint: 'vtta-dndbeyond.entity-import-policy.hint',
    scope: 'world',
    config: true,
    type: Number,
    default: 2,
    choices: [
      'vtta-dndbeyond.entity-import-policy.0',
      'vtta-dndbeyond.entity-import-policy.1',
      // 'vtta-dndbeyond.entity-import-policy.2',
    ],
  });

  game.settings.register('vtta-dndbeyond', 'entity-item-compendium', {
    name: 'vtta-dndbeyond.entity-item-compendium.name',
    hint: 'vtta-dndbeyond.entity-item-compendium.hint',
    scope: 'world',
    config: true,
    type: String,
    isSelect: true,
    choices: itemCompendiums,
  });

  game.settings.register('vtta-dndbeyond', 'entity-spell-compendium', {
    name: 'vtta-dndbeyond.entity-spell-compendium.name',
    hint: 'vtta-dndbeyond.entity-spell-compendium.hint',
    scope: 'world',
    config: true,
    type: String,
    isSelect: true,
    choices: itemCompendiums,
  });

  game.settings.register('vtta-dndbeyond', 'entity-monster-compendium', {
    name: 'vtta-dndbeyond.entity-monster-compendium.name',
    hint: 'vtta-dndbeyond.entity-monster-compendium.hint',
    scope: 'world',
    config: true,
    type: String,
    isSelect: true,
    choices: actorCompendiums,
  });
}

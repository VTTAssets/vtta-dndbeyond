export default async function () {
  let compendiumCreated = false;

  let createIfNotExists = async (settingName, compendiumType, compendiumLabel) => {
    let compendiumName = game.settings.get("vtta-dndbeyond", settingName);
    let compendium = game.packs.find((pack) => pack.collection === compendiumName);
    let sanitizedLabel = sanitize(compendiumLabel);
    if (compendium) { return false; }
    // create a compendium for the user
    await Compendium.create({
      entity: compendiumType,
      label: `My DDB ${compendiumLabel}`,
      name: `${game.world.name}-ddb-${sanitizedLabel}`,
      package: "world"
    });
    await game.settings.set("vtta-dndbeyond", settingName, `world.${game.world.name}-ddb-${sanitizedLabel}`);
    return true;
  };

  let sanitize = (text) => {
    if (text && typeof text === "string") {
      return text.replace(/\s/g, '-').toLowerCase();
    }
    return text;
  }

  compendiumCreated = createIfNotExists("entity-spell-compendium", "Item", "Spells")
    || createIfNotExists("entity-item-compendium", "Item", "Items")
    || createIfNotExists("entity-feature-compendium", "Item", "Features")
    || createIfNotExists("entity-monster-compendium", "Actor", "Monsters")
    //||createIfNotExists("entity-class-compendium", "Item", "Classes")
    || createIfNotExists("entity-monster-feature-compendium", "Item", "Monster Features");

  if (compendiumCreated) location.reload();
}

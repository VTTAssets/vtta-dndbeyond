export default async function () {
  let compendiumCreated = false;

  let compendiumName = game.settings.get("vtta-dndbeyond", "entity-spell-compendium");
  let compendium = game.packs.find((pack) => pack.collection === compendiumName);

  if (!compendium) {
    compendiumCreated = true;
    // create a compendium for the user
    await Compendium.create({
      entity: "Item",
      label: "My DDB Spells",
      name: `${game.world.name}-ddb-spells`,
      package: "world",
    });
    await game.settings.set("vtta-dndbeyond", "entity-spell-compendium", `world.${game.world.name}-ddb-spells`);
  }

  compendiumName = game.settings.get("vtta-dndbeyond", "entity-item-compendium");
  compendium = game.packs.find((pack) => pack.collection === compendiumName);

  if (!compendium) {
    compendiumCreated = true;
    // create a compendium for the user
    await Compendium.create({
      entity: "Item",
      label: "My DDB Items",
      name: `${game.world.name}-ddb-items`,
      package: "world",
    });
    await game.settings.set("vtta-dndbeyond", "entity-item-compendium", `world.${game.world.name}-ddb-items`);
  }

  compendiumName = game.settings.get("vtta-dndbeyond", "entity-feature-compendium");
  compendium = game.packs.find((pack) => pack.collection === compendiumName);

  if (!compendium) {
    compendiumCreated = true;
    // create a compendium for the user
    await Compendium.create({
      entity: "Item",
      label: "My DDB Features",
      name: `${game.world.name}-ddb-features`,
      package: "world",
    });
    await game.settings.set("vtta-dndbeyond", "entity-feature-compendium", `world.${game.world.name}-ddb-features`);
  }

  compendiumName = game.settings.get("vtta-dndbeyond", "entity-class-compendium");
  compendium = game.packs.find((pack) => pack.collection === compendiumName);

  if (!compendium) {
    compendiumCreated = true;
    // create a compendium for the user
    await Compendium.create({
      entity: "Item",
      label: "My DDB Classes",
      name: `${game.world.name}-ddb-classes`,
      package: "world",
    });
    await game.settings.set("vtta-dndbeyond", "entity-class-compendium", `world.${game.world.name}-ddb-classes`);
  }

  compendiumName = game.settings.get("vtta-dndbeyond", "entity-monster-compendium");
  compendium = game.packs.find((pack) => pack.collection === compendiumName);

  if (!compendium) {
    compendiumCreated = true;
    // create a compendium for the user
    await Compendium.create({
      entity: "Actor",
      label: "My DDB Monsters",
      name: `${game.world.name}-ddb-monsters`,
      package: "world",
    });
    await game.settings.set("vtta-dndbeyond", "entity-monster-compendium", `world.${game.world.name}-ddb-monsters`);
  }

  if (compendiumCreated) location.reload();
}

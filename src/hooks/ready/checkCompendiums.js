export default function () {
  let compendiumName = game.settings.get(
    "vtta-dndbeyond",
    "entity-spell-compendium"
  );
  let compendium = game.packs.find(
    (pack) => pack.collection === compendiumName
  );

  if (!compendium) {
    ui.notifications.error("VTTA D&DBeyond: Invalid spell compendium set");
  }

  compendiumName = game.settings.get(
    "vtta-dndbeyond",
    "entity-item-compendium"
  );
  compendium = game.packs.find((pack) => pack.collection === compendiumName);

  if (!compendium) {
    ui.notifications.error("VTTA D&DBeyond: Invalid item compendium set");
  }

  compendiumName = game.settings.get(
    "vtta-dndbeyond",
    "entity-monster-compendium"
  );
  compendium = game.packs.find((pack) => pack.collection === compendiumName);

  if (!compendium) {
    ui.notifications.error("VTTA D&DBeyond: Invalid monster compendium set");
  }
}

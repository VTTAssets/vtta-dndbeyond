export default function () {
  // check for failed registered settings
  let hasErrors = false;
  if (game.settings.settings instanceof Map) {
    for (let s of game.settings.settings.values()) {
      if (s.module === "vtta-dndbeyond") {
        try {
          game.settings.get(s.module, s.key);
        } catch (err) {
          hasErrors = true;
          ui.notifications.info(
            `[${s.module}] Erroneous module settings found, resetting to default.`
          );
          game.settings.set(s.module, s.key, s.default);
        }
      }
    }
  } else {
    for (let prop in game.settings.settings) {
      let s = game.settings.settings[prop];
      if (s.module === "vtta-dndbeyond") {
        try {
          game.settings.get(s.module, s.key);
        } catch (err) {
          hasErrors = true;
          ui.notifications.info(
            `[${s.module}] Erroneous module settings found, resetting to default.`
          );
          game.settings.set(s.module, s.key, s.default);
        }
      }
    }
  }
  if (hasErrors) {
    ui.notifications.warn(
      "Please review the module settings to re-adjust them to your desired configuration."
    );
  }
}

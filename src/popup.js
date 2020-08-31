import utils from "./utils.js";

export default async () => {
  let hasShownPopup =
    utils.versionCompare(
      game.modules.get("vtta-dndbeyond").data.version,
      game.settings.get("vtta-dndbeyond", "popup-version")
    ) !== 1;
  if (hasShownPopup) {
    return true;
  }

  // display the popup for this release
  let result = await window.vtta.hint.show(
    `<h1>VTTA D&D Beyond Integration v${game.modules.get("vtta-dndbeyond").data.version}</h1>
    <h2>Character Import</h2>
    <p>Please note that the <b>character import is now working differently</b> by using a more user-friendly workflow, you can find the <b>updated instructions</b> found in the character import window accessible by the [B] button.</p>
    <p>We don't know if that workflow is reliably working or if D&amp;D Beyond is <b>flagging us as a bot</b> in the future, rendering this possibility unusable. This preview version is part of finding that out before rolling it out to the masses.</p>
    <hr />
       `,
    {
      element: null,
      align: "CENTER",
      hide: {
        selector: '#sidebar-tabs a[data-tab="compendium"]',
        event: "click",
      },
      buttons: ["Dismiss until updated", "Close"],
      width: window.innerWidth / 2,
    }
  );

  if (result !== "Close") {
    // set the version number for the popup to be shown to this version
    game.settings.set("vtta-dndbeyond", "popup-version", game.modules.get("vtta-dndbeyond").data.version);
  }
  return result;
};

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
    <p>Please note that the character import URL changed to</p>
    <p><code>https://www.dndbeyond.com/profile/SolFolango/characters/<b>[number]</b></code></p>
    <p>You can find the number at the end of the URL from your regular D&amp;D Beyond character sheet. This message will be displayed for the next couple of versions</p>
    <h2>Module Import</h2>
    <ol>
      <li>You can choose which image format you want to use when importing scenes, defaulting to WEBP. The only reason changing this default is 
      having players insisting on using Apple Safari as their main browser. Everyone else can enjoy greatly reduced (1.7GB vs 800MB in total) file sizes and the tears of joy of your low-bandwidth players.
      <li>Re-import of scenes will update existing Journal Entries and Scenes instead of generating duplicates</li>
      <li>All scenes have their respective Journal Entries assigned now and will import correctly.</li>
      <li>Numbering of the Journal Entry <b>names</b> is harmonized: [1K, 2K, ...], [A, B, ...] or [Area 1, Area 2, ...] will now changed to a numeric ordering: [01, 02, 03, ...].</li>
      <li>Map Notes based on the imported Journal Entries will now be displayed with a numeric icon corresponding to the harmonized numbering scheme.</li>
    </ol>
    <h2>Scene Sharing</h2>
    <p>While logged in and being a Patreon, you can access Scene Sharing in the context menu of the scene navigation on top of the screen. You can use that to submit your scene adjustments for review and for
      a possible update for future imports of that scene. Walls, Lights, Map Notes and grid/ image dimensions adjustments will be transferred. Hop onto the Discord to get more details.</p>
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

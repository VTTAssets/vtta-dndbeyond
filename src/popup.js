import utils from "./utils.js";

export default async () => {
  let hasShownPopup =
    utils.versionCompare(
      game.modules.get("vtta-dndbeyond").data.version,
      game.settings.get("vtta-dndbeyond", "popup-version")
    ) !== 1;
  console.log("Version compare: " + hasShownPopup);
  if (hasShownPopup) {
    return true;
  }

  // set the version number for the popup to be shown to this version
  game.settings.set("vtta-dndbeyond", "popup-version", game.modules.get("vtta-dndbeyond").data.version);

  // display the popup for this release
  return window.vtta.hint.show(
    `<h1>VTTA D&D Beyond Integration v${game.modules.get("vtta-dndbeyond").data.version}</h1>
        <p>Please note that D&D Beyond has removed access to the URLs we used get the raw character data for the imports. Fear not! We found a (temporary?) solution:
        <p>Instead of <code>https://www.dndbeyond.com/[profile]/characters/[characterName]/json</code> you can now use the following URL to retrieve the JSON:</p>
        <ol>
        <li><code>https://character-service.dndbeyond.com/character/v3/character/<b>[number]</b></code></li>
        </ol>
        <p>Replace <code><b>[number]</b></code> with the number found at the end of the URL of your D&D Beyond character sheet, e.g.
        <p style="text-align: center"><code>https://www.dndbeyond.com/profile/SolFolango/characters/<b>17238039</b></code></p><p> yields</p> <p style="text-align: center"><code>https://character-service.dndbeyond.com/character/v3/character/<b>17238039</b></code></p>
        
        <p><b>Note:</b> You need to switch your Character Privacy to "Public". You can do this by entering the D&D Beyond editing mode, head to the first page (Home) and change the setting at the very bottom.</p>
        <hr />
        <p>Holding ALT while clicking on the [B] on the Foundry character sheet (and if you inserted your character sheet URL in the import dialog), you will be automatically redirected to the correct, new URL as usual.</p>
        <p>Please <a href="https://discord.gg/RjW74a3">join the Discord</a> to stay up-to-date on these changes, <a href="https://www.dndbeyond.com/forums/d-d-beyond-general/d-d-beyond-feedback/71065-removed-undocumented-api-endpoints-regarding" target="_blank">my thread on the official D&D Beyond forums</a> is worth a visit, too.</p>
    <hr />
       `,
    {
      element: null,
      align: "CENTER",
      hide: {
        selector: '#sidebar-tabs a[data-tab="compendium"]',
        event: "click",
      },
      buttons: ["Close"],
      width: window.innerWidth / 2,
    }
  );
};

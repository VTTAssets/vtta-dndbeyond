import CharacterImport from "../../character/import.js";

export default function () {
  // reference to the D&D Beyond popup
  let dndBeyondPopup = null;
  let dndBeyondJsonPopup = null;

  /**
   * Character sheets
   */
  let pcSheetNames = Object.values(CONFIG.Actor.sheetClasses.character)
    .map((sheetClass) => sheetClass.cls)
    .map((sheet) => sheet.name);

  pcSheetNames.forEach((sheetName) => {
    Hooks.on("render" + sheetName, (app, html, data) => {
      // only for GMs or the owner of this character
      if (!data.owner || !data.actor) return;

      let button = $(
        '<button type="button" id="ddbImportButton" class="inactive"></button>'
      );
      if (
        app.entity.data.flags.vtta &&
        app.entity.data.flags.vtta.dndbeyond &&
        app.entity.data.flags.vtta.dndbeyond.url
      ) {
        button.removeClass("inactive");
      }

      let characterImport;

      button.click((event) => {
        let url = null;
        if (
          app.entity.data.flags.vtta &&
          app.entity.data.flags.vtta.dndbeyond &&
          app.entity.data.flags.vtta.dndbeyond.url
        ) {
          url = app.entity.data.flags.vtta.dndbeyond.url;
        }

        if (event.shiftKey) {
          event.preventDefault();
          if (dndBeyondPopup && !dndBeyondPopup.closed) {
            dndBeyondPopup.focus();
            dndBeyondPopup.location.href = url;
          } else {
            let ratio = window.innerWidth / window.innerHeight;
            let width = Math.round(window.innerWidth * 0.5);
            let height = Math.round(window.innerWidth * 0.5 * ratio);
            dndBeyondPopup = window.open(
              url,
              "ddb_sheet_popup",
              `resizeable,scrollbars,location=no,width=${width},height=${height},toolbar=1`
            );
          }
        }

        if (event.altKey) {
          event.preventDefault();
          if (dndBeyondJsonPopup && !dndBeyondJsonPopup.closed) {
            dndBeyondJsonPopup.focus();
            dndBeyondPopup.location.href = url;
          } else {
            let ratio = window.innerWidth / window.innerHeight;
            let width = Math.round(window.innerWidth * 0.5);
            let height = Math.round(window.innerWidth * 0.5 * ratio);
            dndBeyondJsonPopup = window.open(
              url + "/json",
              "ddb_sheet_popup",
              `resizeable,scrollbars,location=no,width=${width},height=${height},toolbar=1`
            );
          }
        }

        if (
          (!event.shiftKey && !event.ctrlKey && !event.altKey) ||
          url === null
        ) {
          characterImport = new CharacterImport(
            CharacterImport.defaultOptions,
            data.actor
          );
          characterImport.render(true);
        }
      });

      let wrap = $('<div class="ddbCharacterName"></div>');
      $(html).find("input[name='name']").wrap(wrap);
      $(html).find("input[name='name']").parent().prepend(button);
    });
  });

  /**
   * NPC sheets
   */
  let npcSheetNames = Object.values(CONFIG.Actor.sheetClasses.npc)
    .map((sheetClass) => sheetClass.cls)
    .map((sheet) => sheet.name);

  npcSheetNames.forEach((sheetName) => {
    Hooks.on("render" + sheetName, (app, html, data) => {
      // only for GMs or the owner of this npc
      if (!data.owner || !data.actor) return;
      let button = $('<button type="button" id="ddbImportButton"></button>');

      if (
        app.entity.data.flags.vtta &&
        app.entity.data.flags.vtta.dndbeyond &&
        app.entity.data.flags.vtta.dndbeyond.url
      ) {
        button.click((event) => {
          let url = null;

          url = app.entity.data.flags.vtta.dndbeyond.url;

          event.preventDefault();
          if (dndBeyondPopup && !dndBeyondPopup.closed) {
            dndBeyondPopup.focus();
          } else {
            let ratio = window.innerWidth / window.innerHeight;
            let width = Math.round(window.innerWidth * 0.5);
            let height = Math.round(window.innerWidth * 0.5 * ratio);
            dndBeyondPopup = window.open(
              url,
              "ddb_sheet_popup",
              `resizeable,scrollbars,location=no,width=${width},height=${height},toolbar=1`
            );
          }
        });
      }

      let wrap = $('<div class="ddbCharacterName"></div>');
      $(html).find("input[name='name']").wrap(wrap);
      $(html).find("input[name='name']").parent().prepend(button);
    });
  });
}

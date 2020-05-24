export default function (directory, html, user) {
  $(html)
    .find("ol.directory-list > li.directory-item.folder")
    .each((index, element) => {
      let folderId = $(element).attr("data-folder-id");
      let folder = game.folders.get(folderId);
      const labelText =
        folder.data.flags &&
        folder.data.flags.vtta &&
        folder.data.flags.vtta.dndbeyond &&
        folder.data.flags.vtta.dndbeyond.sourcebook
          ? folder.data.flags.vtta.dndbeyond.sourcebook
          : null;
      if (labelText) {
        const label = $(`<span class="vtta-folder-label">${labelText.toUpperCase()}</span>`);
        $(label).on("click", (event) => {
          const data = {
            senderId: game.user.data._id,
            action: "labelClick",
            label: labelText,
          };
          game.socket.emit("module.vtta-dndbeyond", data);
        });

        $(element).find("> header").prepend(label);
      }
    });

  $(html)
    .find("ol.directory-list li.directory-item.folder")
    .each((index, element) => {
      let folderId = $(element).attr("data-folder-id");
      let folder = game.folders.get(folderId);
      const label =
        folder.data.flags &&
        folder.data.flags.vtta &&
        folder.data.flags.vtta.dndbeyond &&
        folder.data.flags.vtta.dndbeyond.sourcebook
          ? folder.data.flags.vtta.dndbeyond.sourcebook
          : null;
      if (label) {
        $(element).attr("data-type", "vtta-folder");
      }
    });
}

export default function (directory, html, user) {
  $(html)
    .find("ol.directory-list > li.directory-item.folder")
    .each((index, element) => {
      let folderId = $(element).attr("data-folder-id");
      let folder = game.folders.get(folderId);
      console.log(folder.data.flags);
      const label =
        folder.data.flags &&
        folder.data.flags.vtta &&
        folder.data.flags.vtta.dndbeyond &&
        folder.data.flags.vtta.dndbeyond.sourcebook
          ? folder.data.flags.vtta.dndbeyond.sourcebook
          : null;
      if (label) {
        $(element)
          .find("> header")
          .prepend(
            `<span class="vtta-folder-label">${label.toUpperCase()}</span>`
          );
      }
    });
}

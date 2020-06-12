export default () => {
  $("#scene-list li a").contextmenu((event) => {
    // wait for the contextmenu to appear
    const sceneId = $(event.currentTarget).parent().data("sceneId");
    const scene = game.scenes.get(sceneId);
    console.log(scene.data.flags);
    if (scene.data.flags && scene.data.flags.vtta && scene.data.flags.vtta.alt) {
      setTimeout(() => {
        const menu = $("#context-menu ol");
        for (let version in scene.data.flags.vtta.alt) {
          console.log("Version: " + version);
          const icon = scene.data.img === scene.data.flags.vtta.alt[version] ? "fas" : "far";
          const contextItem = $(`<li class="context-item"><i class="${icon} fa-map"></i> ${version}</li>`);
          $(contextItem).on("click", async () => {
            await scene.update({ img: scene.data.flags.vtta.alt[version] });
            canvas.draw();
          });
          $(menu).append(contextItem);
        }
      }, 200);
    }
  });
};

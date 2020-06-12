export default (html, contextOptions) => {
  contextOptions.push({
    name: "vtta-dndbeyond.scenes.gm-enabled",
    callback: (li) => {
      return true;
    },
    condition: (li) => {
      const scene = game.scenes.get(li.data("sceneId"));
      console.log(scene);
      return (
        scene.data.flags &&
        scene.data.flags.vtta &&
        scene.data.flags.vtta.alt &&
        scene.data.flags.vtta.alt.GM &&
        scene.img === scene.data.flags.vtta.alt.GM
      );
    },
    icon: "<i class='fas fa-map active'></i>",
  });

  contextOptions.push({
    name: "vtta-dndbeyond.scenes.gm-enable",
    callback: (li) => {
      const scene = game.scenes.get(li.data("sceneId"));
      const thumb = scene.data.thumb;
      scene.update({ img: scene.data.flags.vtta.alt.GM }).then(() => {
        scene.update({ thumb: thumb });
        if (scene.visible) {
          return canvas.draw();
        }
      });
    },
    condition: (li) => {
      const scene = game.scenes.get(li.data("sceneId"));
      return (
        scene.data.flags &&
        scene.data.flags.vtta &&
        scene.data.flags.vtta.alt &&
        scene.data.flags.vtta.alt.GM &&
        scene.img !== scene.data.flags.vtta.alt.GM
      );
    },
    icon: "<i class='far fa-map'></i>",
  });

  contextOptions.push({
    name: "vtta-dndbeyond.scenes.player-enabled",
    callback: (li) => {
      return true;
    },
    condition: (li) => {
      $(li).addClass("active");
      const scene = game.scenes.get(li.data("sceneId"));
      console.log(scene);
      return (
        scene.data.flags &&
        scene.data.flags.vtta &&
        scene.data.flags.vtta.alt &&
        scene.data.flags.vtta.alt.Player &&
        scene.img === scene.data.flags.vtta.alt.Player
      );
    },
    icon: "<i class='fas fa-map active'></i>",
  });

  contextOptions.push({
    name: "vtta-dndbeyond.scenes.player-enable",
    callback: (li) => {
      const scene = game.scenes.get(li.data("sceneId"));
      scene.update({ img: scene.data.flags.vtta.alt.Player, thumb: scene.data.thumb }).then(() => {
        if (scene.visible) {
          canvas.draw();
        }
      });
    },
    condition: (li) => {
      const scene = game.scenes.get(li.data("sceneId"));
      return (
        scene.data.flags &&
        scene.data.flags.vtta &&
        scene.data.flags.vtta.alt &&
        scene.data.flags.vtta.alt.Player &&
        scene.img !== scene.data.flags.vtta.alt.Player
      );
    },
    icon: "<i class='far fa-map'></i>",
  });
};

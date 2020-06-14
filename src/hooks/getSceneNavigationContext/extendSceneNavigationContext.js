export default (html, contextOptions) => {
  contextOptions.push({
    name: "vtta-dndbeyond.scenes.gm-enabled",
    callback: () => {
      return true;
    },
    condition: (li) => {
      const scene = game.scenes.get(li.data("sceneId"));
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
      // keep Foundry from setting the image dimensions to original image dimensions
      const { width, height, thumb } = scene.data;

      return scene.update({ img: scene.data.flags.vtta.alt.GM }).then(() => {
        // re-set to the original thumb and the original dimensions
        return scene
          .update({
            thumb: scene.data.flags.vtta.thumb,
            width: scene.data.flags.vtta.width,
            height: scene.data.flags.vtta.height,
          })
          .then(() => {
            return canvas.draw();
          });
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
    callback: () => {
      return true;
    },
    condition: (li) => {
      $(li).addClass("active");
      const scene = game.scenes.get(li.data("sceneId"));
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
      const { width, height, thumb } = scene.data;

      return scene.update({ img: scene.data.flags.vtta.alt.Player }).then(() => {
        // re-set to the original thumb
        // we cannot keep Foundry from generating it's own
        return scene
          .update({
            thumb: scene.data.flags.vtta.thumb,
            width: scene.data.flags.vtta.width,
            height: scene.data.flags.vtta.height,
          })
          .then(() => {
            return canvas.draw();
          });
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

  contextOptions.push({
    name: "vtta-dndbeyond.scenes.share",
    callback: (li) => {
      const scene = game.scenes.get(li.data("sceneId"));

      const data = {};

      const { width, height, thumb } = scene.data;

      return scene.update({ img: scene.data.flags.vtta.alt.Player }).then(() => {
        // re-set to the original thumb
        // we cannot keep Foundry from generating it's own
        return scene
          .update({
            thumb: scene.data.flags.vtta.thumb,
            width: scene.data.flags.vtta.width,
            height: scene.data.flags.vtta.height,
          })
          .then(() => {
            return canvas.draw();
          });
      });
    },
    condition: (li) => {
      const scene = game.scenes.get(li.data("sceneId"));
      return (
        scene.data.flags &&
        scene.data.flags.vtta &&
        window.vtta &&
        window.vtta.pid !== undefined &&
        window.vtta.pid !== null
      );
    },
    icon: '<i class="fas fa-share-alt"></i>',
  });
};

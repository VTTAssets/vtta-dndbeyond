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

      return scene
        .update({
          img: scene.data.flags.vtta.alt.GM,
          width: scene.data.flags.vtta.width,
          height: scene.data.flags.vtta.height,
          thumb: scene.data.flags.vtta.thumb,
        })
        .then(() => {
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
      let data = collectSceneData(scene);
    },
    condition: (li) => {
      const scene = game.scenes.get(li.data("sceneId"));
      return (
        scene.data.flags &&
        scene.data.flags.vtta &&
        scene.data.flags.vtta.id &&
        window.vtta &&
        window.vtta.pid !== undefined &&
        window.vtta.pid !== null
      );
    },
    icon: '<i class="fas fa-share-alt"></i>',
  });
};

/**
 * Prepares the scene data for upload to vttassets.com as a user-submission for walling/scene adjustments
 * @param {Scene} scene
 */
const collectSceneData = (scene) => {
  if (!scene.data.flags.vtta || !scene.data.flags.vtta.id) {
    window.vtta.notification.show("Scene share failed: No VTTA imported scene");
    return;
  }
  if (!window.vtta.pid) {
    window.vtta.notification.show("Scene share failed: No Collaborateur flag found");
    return;
  }

  /**
   * Extracts all notes that have been placed by VTTA
   * Creates the expected data structure for the database by
   * getting the real label from the appropriate Journal Entry
   * @param {Scene} scene The scene to extract the notes from
   */
  const getNotes = (scene) => {
    // get all notes in the Journal related to this scene
    let relatedJournalEntries = game.journal.filter(
      (je) =>
        je.data.flags &&
        je.data.flags.vtta &&
        je.data.flags.vtta.sceneId &&
        je.data.flags.vtta.sceneId === scene.data.flags.vtta.id
    );

    // get all notes placed on the map
    let notes = scene.data.notes
      // the user might have placed a note, unless it is based on an imported Journal Entry, we will not carry
      // that one over
      // .filter((note) => note.flags.vtta)
      .filter((note) => {
        let je = relatedJournalEntries.find((je) => je._id === note.entryId);
        return !!(je && je.data.flags.vtta && je.data.flags.vtta.name);
      })
      .map((note) => {
        let je = relatedJournalEntries.find((je) => je._id === note.entryId);
        const index = parseInt(je.data.name.substring(0, 2));
        return {
          index: index,
          label: je.data.name.substring(3),
          name: je.data.flags.vtta.name,
          x: note.x,
          y: note.y,
        };
      })
      .reduce((notes, note) => {
        let idx = notes.find((n) => n.index === note.index);
        if (idx) {
          idx.positions.push({ x: note.x, y: note.y });
        } else {
          notes.push({ label: note.name, index: note.index, positions: [{ x: note.x, y: note.y }] });
        }
        return notes;
      }, [])
      .sort((a, b) => {
        return a.index - b.index;
      })
      .map((note) => ({ label: note.label, positions: note.positions }));

    return notes;

    // let indices = notes.reduce((indices, note) => {
    //   if (!indices.includes(note.index)) indices.push(index);
    //   return indices.sort();
    // }, []);
    // let result = [];
    // for (let index of indices) {
    //   let indexNotes = notes.filter((note) => NodeIterator.index === index).map();
    // }
  };

  let notes;
  try {
    notes = getNotes(scene);
  } catch (error) {
    window.vtta.notification.show(error);
    return;
  }

  const data = {
    pid: window.vtta.pid,
    id: scene.data.flags.vtta.id,
    name: scene.data.name,
    // dimensions
    width: scene.data.width,
    height: scene.data.height,
    // grid
    grid: scene.data.grid,
    gridDistance: scene.data.gridDistance,
    gridType: scene.data.gridType,
    gridUnits: scene.data.gridUnits,
    shiftX: scene.data.shiftX,
    shiftY: scene.data.shiftY,
    // customization
    backgroundColor: scene.data.backgroundColor,
    // notes
    descriptions: notes,
    walls: scene.data.walls.map((wall) => ({
      c: wall.c,
      door: wall.door,
      ds: wall.ds,
      move: wall.move,
      sense: wall.sense,
    })),
    lights: scene.data.lights.map((light) => ({
      angle: light.angle,
      bright: light.bright,
      darknessThreshold: light.darknessThreshold,
      dim: light.dim,
      rotation: light.rotation,
      t: light.t,
      tintAlpha: light.tintAlpha,
      x: light.x,
      y: light.y,
    })),
  };
  return data;
};

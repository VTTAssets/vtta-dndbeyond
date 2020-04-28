let processQuery = (message) => {
  return new Promise((resolve, reject) => {
    // simple query

    // try to discern the query

    let getFolderHierarchy = (folder) => {
      if (!folder || !folder._parent) return "/";
      return folder._parent._id !== null
        ? `${getFolderHierarchy(folder._parent)}/${folder.name}`
        : `/${folder.name}`;
    };

    // compendium to check on
    let compendiumName = null;
    let result = null;

    switch (message.type) {
      case "id":
        let { id, name, isGM } = game.user;
        let entities = game.actors.entities
          .filter((actor) => actor.owner)
          .map((actor) => {
            let aliases = game.scenes.active
              ? [
                  ...new Set(
                    game.scenes.active.data.tokens
                      .filter((token) => {
                        return (
                          token.actorId === actor.id &&
                          token.name !== actor.name
                        );
                      })
                      .map((token) => token.name)
                  ),
                ]
              : [];
            return {
              type: "id",
              id: actor.id,
              name: actor.name,
              aliases: aliases,
            };
          });
        resolve({
          user: {
            id: id,
            name: name,
            isGM: isGM,
          },
          entities: entities,
        });
        break;
      default:
        reject({
          code: 404,
          message: `Error processing query "${message}"`,
        });
      case "monster":
        result = {
          user: {
            name: game.user.name,
            isGM: game.user.isGM,
          },
          world: {
            name: game.world.name,
            entities: [],
          },
          scene: {
            name: game.scenes.active ? game.scenes.active.data.name : null,
            entities: [],
          },
          compendium: {
            name:
              game.settings
                .get("vtta-dndbeyond", "entity-monster-compendium")
                .trim() !== ""
                ? game.settings.get(
                    "vtta-dndbeyond",
                    "entity-monster-compendium"
                  )
                : null,
            entities: [],
          },
        };

        // check the world for this monster
        result.world.entities = game.actors.entities
          .filter(
            (entity) =>
              entity.data.type === "npc" &&
              entity.data.name === message.name &&
              entity.owner === true
          )
          .map((entity) => {
            return {
              id: entity.id,
              name: getFolderHierarchy(entity.folder),
            };
          });

        // check the current scene, too
        if (game.scenes.active) {
          // every actor will be listed once, only. This is to avoid having 20 "Goblin" entries on
          // dndbeyond on the monster's sheet as selectable actors
          // Only actors currently available in the world that have a token placed on the currently active scene
          // are forwarded to dndbeyond
          let actors = [];
          result.scene.entities = game.scenes.active.data.tokens
            .map((token) => {
              let actor = game.actors.entities.find(
                (actor) =>
                  actor.id === token.actorId &&
                  actor.name === message.name &&
                  actor.owner === true
              );
              if (actor && !actors.includes(token.name)) {
                // remember this token's name
                actors.push(token.name);

                return {
                  id: token.id,
                  name: token.name,
                };
              } else {
                return undefined;
              }
            })
            .filter((entity) => entity !== undefined);

          // sort the result alphabetically
          result.scene.entities.sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
          });
        }

        //  check the monster compendium, too
        compendiumName = game.settings.get(
          "vtta-dndbeyond",
          "entity-monster-compendium"
        );
        if (compendiumName !== "") {
          /*let compendium = game.packs.find(
                compendium => compendium.metadata.label === compendiumName
              );*/
          let compendium = game.packs.find(
            (pack) => pack.collection === compendiumName
          );
          if (compendium) {
            compendium
              .getIndex()
              .then((index) => {
                let entity = index.find(
                  (entity) => entity.name === message.name
                );
                if (entity) {
                  // add the entities to the result response object
                  result.compendium.entities.push({
                    id: entity.id,
                    name: compendium.metadata.label,
                  });
                }

                // send it on it's merry way
                resolve(result);
                //this.respond(event, result);
              })
              .catch((error) => utils.log(error, "extension"));
          } else {
            result.compendium.name = null;
            resolve(result);
          }
        } else {
          result.compendium.name = null;
          resolve(result);
        }
        break;

      case "spell":
        //  check the spell compendium
        compendiumName = game.settings.get(
          "vtta-dndbeyond",
          "entity-spell-compendium"
        );
        if (compendiumName !== "") {
          //let compendium = game.packs.find(compendium => compendium.metadata.label === compendiumName);
          let compendium = game.packs.find(
            (pack) => pack.collection === compendiumName
          );
          if (compendium) {
            compendium
              .getIndex()
              .then((index) => {
                let entity = index.find(
                  (entity) =>
                    entity.name.toLowerCase() === message.name.toLowerCase()
                );
                if (entity) {
                  // get the spell and deliver it back to the query
                  compendium
                    .getEntity(entity.id)
                    .then((spell) => resolve(spell)) //this.respond(event, { code: 200, spell: spell }))
                    .catch((error) => reject(error)); //this.respond(event, { code: 500, spell: null }));
                } else {
                  reject({ code: 404, spell: null });
                  // this.respond(event, { code: 404, spell: null });
                }
              })
              .catch((error) => reject({ code: 500, spell: null })); //this.respond(event, { code: 500, spell: null }));
          }
        } else {
          //this.respond(event, { result: result });
          reject({ code: 404, spell: null });
          //this.respond(event, { code: 404, spell: null });
        }

        break;

      case "spellref":
        //  check the spell compendium
        result = {
          user: {
            name: game.user.name,
            isGM: game.user.isGM,
          },
          compendium: {
            name:
              game.settings
                .get("vtta-dndbeyond", "entity-spell-compendium")
                .trim() !== ""
                ? game.settings.get("vtta-dndbeyond", "entity-spell-compendium")
                : null,
            entity: null,
          },
        };
        compendiumName = game.settings.get(
          "vtta-dndbeyond",
          "entity-spell-compendium"
        );
        if (compendiumName !== "") {
          //let compendium = game.packs.find(compendium => compendium.metadata.label === compendiumName);
          let compendium = game.packs.find(
            (pack) => pack.collection === compendiumName
          );
          if (compendium) {
            compendium
              .getIndex()
              .then((index) => {
                let entity = index.find(
                  (entity) =>
                    entity.name.toLowerCase() === message.name.toLowerCase()
                );
                if (entity) {
                  result.compendium.entity = entity;
                }
                resolve(result);
              })
              .catch((error) => {
                utils.log(
                  `Error searching through compendium ${compendiumName}`,
                  "extension"
                );
                utils.log(error, "extension");
                reject({ code: 500, spell: null });
              }); //this.respond(event, { code: 500, spell: null }));
          }
        } else {
          //this.respond(event, { result: result });
          reject({ code: 404, spell: null });
          //this.respond(event, { code: 404, spell: null });
        }

        break;

      case "spells":
        //  check the spell compendium
        compendiumName = game.settings.get(
          "vtta-dndbeyond",
          "entity-spell-compendium"
        );
        if (compendiumName !== "") {
          //let compendium = game.packs.find(compendium => compendium.metadata.label === compendiumName);
          let compendium = game.packs.find(
            (pack) => pack.collection === compendiumName
          );
          if (compendium) {
            compendium
              .getIndex()
              .then(async (index) => {
                let result = {};

                for (let i = 0; i < message.name.length; i++) {
                  let entity = index.find(
                    (entity) =>
                      entity.name.toLowerCase() ===
                      message.name[i].toLowerCase()
                  );
                  if (entity) {
                    // get the spell and deliver it back to the query
                    let spell = await compendium.getEntity(entity.id);
                    result[message.name[i]] = spell;
                  } else {
                    result[message.name[i]] = null;
                  }
                }
                reject({ code: 404, spells: result });
                //this.respond(event, { code: 404, spells: result });
              })
              .catch((error) => {
                utils.log(
                  `Error searching through compendium ${compendiumName}`,
                  "extension"
                );
                utils.log(error, "extension");
                reject({ code: 500, spell: null });
                //this.respond(event, { code: 500, spell: null });
              });
          }
        } else {
          //this.respond(event, { result: result });
          reject({ code: 404, spell: null });
          //this.respond(event, { code: 404, spell: null });
        }

        break;

      case "spellsref":
        //  check the spell compendium
        compendiumName = game.settings.get(
          "vtta-dndbeyond",
          "entity-spell-compendium"
        );
        if (compendiumName !== "") {
          //let compendium = game.packs.find(compendium => compendium.metadata.label === compendiumName);
          let compendium = game.packs.find(
            (pack) => pack.collection === compendiumName
          );
          if (compendium) {
            compendium
              .getIndex()
              .then((index) => {
                let result = {};

                for (let i = 0; i < message.name.length; i++) {
                  let entity = index.find(
                    (entity) =>
                      entity.name.toLowerCase() ===
                      message.name[i].toLowerCase()
                  );
                  if (entity) {
                    // get the spell and deliver it back to the query
                    result[message.name[i]] = entity;
                  } else {
                    result[message.name[i]] = null;
                  }
                }
                //this.respond(event, { code: 404, spells: result });
                resolve({ code: 200, spell: result });
              })
              .catch((error) => {
                utils.log(
                  `Error searching through compendium ${compendiumName}`,
                  "extension"
                );
                utils.log(error, "extension");
                //this.respond(event, { code: 500, spells: null });
                reject({
                  code: 500,
                  message: "Compendium inaccessible (unknown error)",
                });
              });
          } else {
            reject({
              code: 404,
              message: "Compendium inaccessible (check name)",
            });
          }
        } else {
          //this.respond(event, { result: result });
          reject({ code: 404, message: "Spell compendium not set" });
          //this.respond(event, { code: 404, spells: null });
        }

        break;
    }
  });
};

export default processQuery;

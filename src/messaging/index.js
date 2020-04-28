import utils from "../utils.js";
//import queryEntity from "./type/queryEntity.js";
//import addEntity from "./type/addEntity.js";
import roll from "./type/roll.js";

import query from "./type/query/index.js";
import add from "./type/add/index.js";

let uuidv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

class EventPort {
  constructor() {
    this.id = uuidv4();
  }

  start() {
    document.addEventListener(
      "vtta-dndbeyond:module:message",
      async (event) => {
        utils.log("Foundry module: Received message", "communication");
        utils.log(event.detail, "communication");
        let { head, body } = event.detail;

        // switching to see how to process each message received
        if (head.type === "query") {
          try {
            let result = await query(body);
            document.dispatchEvent(
              new CustomEvent(head.id, {
                detail: {
                  head: {
                    id: head.id,
                    type: body.type,
                    code: 200,
                  },
                  body: result,
                },
              })
            );
          } catch (error) {
            console.log(error);
            document.dispatchEvent(
              new CustomEvent(head.id, {
                detail: {
                  head: {
                    id: head.id,
                    type: body.type,
                    code: 500,
                  },
                  body: error.message,
                },
              })
            );
          }
        }

        if (head.type === "import" || head.type === "add") {
          try {
            let result = await add(body);
            document.dispatchEvent(
              new CustomEvent(head.id, {
                detail: {
                  head: {
                    id: head.id,
                    type: body.type,
                    code: 200,
                  },
                  body: result,
                },
              })
            );
          } catch (error) {
            console.log(error);
            document.dispatchEvent(
              new CustomEvent(head.id, {
                detail: {
                  head: {
                    id: head.id,
                    type: body.type,
                    code: 500,
                  },
                  body: error.message,
                },
              })
            );
          }
        }

        if (head.type === "roll") {
          let entityName = body.data.name;

          // check the current scene first
          let persona = undefined;
          if (game.scenes.active) {
            let token = game.scenes.active.data.tokens.find((token) => {
              return (
                (token.actorData &&
                  token.actorData.name &&
                  token.actorData.name === entityName) ||
                token.name === entityName
              );
            });

            if (token) {
              persona = game.actors.entities.find(
                (actor) => actor.id === token.actorId
              );

              // overwrite the name for the roll
              if (token.actorData.name) {
                persona.data.name = token.actorData.name;
              }
            }
          }
          if (persona === undefined) {
            persona = game.actors.entities.find(
              (actor) => actor.name === entityName
            );
          }

          // report failure to roll to the user
          if (persona === undefined) {
            document.dispatchEvent(
              new CustomEvent(head.id, {
                detail: {
                  head: {
                    id: head.id,
                    type: body,
                    code: 404,
                  },
                  body: entityName,
                },
              })
            );
          } else {
            roll(persona, body.data)
              .then((response) => {
                utils.log("Add successful", "extension");
                utils.log(response, "extension");
                document.dispatchEvent(
                  new CustomEvent(head.id, {
                    detail: {
                      head: {
                        id: head.id,
                        type: body,
                        code: 200,
                      },
                      body: response,
                    },
                  })
                );
              })
              .catch((error) => {
                utils.log("Error in import", "extension");
                utils.log(error, "extension");
                document.dispatchEvent(
                  new CustomEvent(head.id, {
                    detail: {
                      head: {
                        id: head.id,
                        type: body,
                        code: error.code,
                      },
                      body: error.message,
                    },
                  })
                );
              });
          }
        }
      }
    );

    // send an initialisation helo
    this.send("ping").then((response) => utils.log(response, "communication"));
  }

  send(type, data = null) {
    return new Promise((resolve, reject) => {
      let message = {
        head: {
          id: uuidv4(),
          type: type,
        },
        body: data,
      };

      utils.log("Foundry module: Sending data", "communication");
      utils.log(message);

      // once a response is received, dispatch it to the port again
      let listener = (event) => {
        utils.log("Foundry module: Received response", "communication");
        utils.log(event.detail, "communication");

        resolve(event.detail);
        // remove the event listener for this message id
        document.removeEventListener(message.head.id, listener);
      };

      document.addEventListener(message.head.id, listener);
      document.dispatchEvent(
        new CustomEvent("vtta-dndbeyond:extension:message", {
          detail: message,
        })
      );
    });
  }
}

export default EventPort;

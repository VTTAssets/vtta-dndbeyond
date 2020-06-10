/**
 * Shows notifcations and hints to the user
 */
const registerNotifications = () => {
  // register the notification global object
  console.log("Registering notifications");
  $("body").append(`<div id="vtta-notifications"></div>`);
  $("body").append(`<div id="vtta-hints"></div>`);

  window.vtta = window.vtta || {
    notification: {
      clear: () => {
        $("#vtta-notifications div").hide(200, (event) => {
          console.log(event);
          $("#vtta-notifications").empty();
        });
      },
      show: (message, timeout = 2000) => {
        let note = $(`<div style="display: none">${message}</div>`);
        $("#vtta-notifications").append(note);
        $(note).fadeIn(2000);

        setTimeout(() => {
          $(note).hide(200, (event) => {
            console.log(event);
            $(note).remove();
          });
        }, timeout);
      },
    },
    hint: {
      clear: () => {
        $("#vtta-hints div").hide(200, () => {
          $("#vtta-hints").empty();
        });
      },
      show: (message, options = {}) => {
        return new Promise((resolve) => {
          $("#vtta-hints").css("width", options.width ? options.width : 300);

          // construct the note
          let note = $(`<div style="display: none">${message}<div class="buttons"></div></div>`);
          $("#vtta-hints").append(note);
          $(note).fadeIn(200);
          const MARGIN = 10;

          if (!options.align) options.align = options.element ? "RIGHT" : "CENTER";

          let anchor = {
            width: 0,
            height: 0,
            top: Math.round(window.innerHeight / 2),
            left: Math.round(window.innerWidth / 2),
          };

          if (options.element) {
            anchor = Object.assign(
              { width: $(options.element).width(), height: $(options.element).height() },
              $(options.element).offset()
            );
          }
          const noteInfo = Object.assign(
            { width: $("#vtta-hints").width(), height: $("#vtta-hints").height() },
            $("#vtta-hints").position()
          );

          switch (options.align) {
            case "RIGHT":
              $("#vtta-hints").css("top", anchor.top);
              $("#vtta-hints").css("left", anchor.left + anchor.width + MARGIN);
              break;
            case "LEFT":
              $("#vtta-hints").css("top", anchor.top);
              $("#vtta-hints").css("left", anchor.left - noteInfo.width - MARGIN);
              break;
            case "TOP":
              $("#vtta-hints").css("top", anchor.top - noteInfo.height - MARGIN);
              $("#vtta-hints").css("left", anchor.left);
              break;
            case "BOTTOM":
              $("#vtta-hints").css("top", anchor.top + anchor.height + MARGIN);
              $("#vtta-hints").css("left", anchor.left);
              break;

            default:
              // eslint-disable-next-line no-mixed-operators
              $("#vtta-hints").css("top", anchor.top - Math.round(noteInfo.height / 2));
              // eslint-disable-next-line no-mixed-operators
              $("#vtta-hints").css("left", anchor.left - Math.round(noteInfo.width / 2));
          }

          if (options.buttons) {
            for (let name of options.buttons) {
              let btn = $("<button>" + name + "</button>");
              $("div.buttons", note).append(btn);
              $(btn).on("click", () => {
                $(note).fadeOut(100, () => {
                  $(note).remove();
                  resolve(name);
                });
              });
            }
          }
          if (options.hide) {
            $(options.hide.selector).on(options.hide.event, () => {
              $(note).fadeOut(100, () => {
                $(note).remove();
                resolve(true);
              });
            });
          }
        });
      },
    },
  };
};

export default registerNotifications;

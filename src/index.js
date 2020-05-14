import { init, ready, renderSidebarTab } from "./hooks.js";

// socket messaging
import onSocketMessage from "./hooks/socket/onSocketMessage.js";

// register hooks
Hooks.once("init", init);
Hooks.once("ready", ready);
Hooks.on("renderSidebarTab", renderSidebarTab);

Hooks.on("module.vtta-dndbeyond", (data) => {
  console.log("Socket Message received");
  if (data.senderId === game.user.data._id) {
    console.log("I sent this");
    return;
  }

  const sender = game.users.get(data.senderId);
  delete data.senderId;
  onSocketMessage(sender, data);
});

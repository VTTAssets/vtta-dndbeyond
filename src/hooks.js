import utils from "./utils.js";

import EventPort from "./messaging/index.js";
import OutgoingCommunication from "./messaging/outgoing.js";

// init hooks
import setupLogging from "./hooks/init/setupLogging.js";

// ready hooks
import registerSheets from "./hooks/ready/registerSheets.js";
import checkCompendiums from "./hooks/ready/checkCompendiums.js";
import repairGameSettings from "./hooks/ready/repairGameSettings.js";
import registerGameSettings from "./hooks/ready/registerGameSettings.js";
//import registerSceneNavigation from "./hooks/ready/registerSceneNavigation.js";
import extendSceneNavigationContext from "./hooks/getSceneNavigationContext/extendSceneNavigationContext.js";

// other hooks
import addFolderLabel from "./hooks/renderSidebarTab/addFolderLabel.js";
import linkImages from "./hooks/renderJournalSheet/linkImages.js";
import startTutorial from "./tutorial/index.js";
import showPopup from "./popup.js";
import checkVersion from "./hooks/init/checkVersion.js";
import checkElectron from "./hooks/ready/checkElectron.js";

// socket messaging
import onSocketMessage from "./hooks/socket/onSocketMessage.js";

// foundry is initializing
export function init() {
  setupLogging();
  utils.log("Init");
}

// foundry is ready
export function onceReady() {
  // register the game settings
  registerGameSettings();

  // repair corrupted game settings
  repairGameSettings();

  // check for valid compendiums
  checkCompendiums();

  // check for the running version
  checkVersion();

  // check if ran in electron app
  checkElectron();

  // delay the startup just a tiny little bit
  setTimeout(() => {
    utils.log("Starting EventPort", "messaging");
    let port = new EventPort();
    port.start();

    let com = OutgoingCommunication(port);

    // register the D&DBeyond Button on the character sheets
    registerSheets();

    // send a notification to dndbeyond that it should update the actor data
    Hooks.on("preUpdateActor", com.updateActorHP);

    showPopup().then(() => startTutorial());
  }, 500);
}

export function onReady() {
  // register scene change on contextmenu in scene navigation
  //registerSceneNavigation();

  game.socket.on("module.vtta-dndbeyond", (data) => {
    console.log("Socket Message received");
    if (data.sender === game.user.data._id) {
      return;
    }

    const sender = game.users.get(data.sender);
    delete data.sender;
    onSocketMessage(sender, data);
  });
}

// these functions are hooked in, we don't use all the data, so lets stop eslint complaining
/* eslint-disable no-unused-vars */
export function renderSidebarTab(directory, html, user) {
  addFolderLabel(html);
}

export function renderJournalSheet(sheet, html, data) {
  linkImages(html);
}

export function getSceneNavigationContext(html, contextItems) {
  extendSceneNavigationContext(html, contextItems);
}
/* eslint-enable no-unused-vars */

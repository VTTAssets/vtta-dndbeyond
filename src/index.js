import { init, ready, renderSidebarTab } from "./hooks.js";

// register hooks
Hooks.once("init", init);
Hooks.once("ready", ready);
Hooks.on("renderSidebarTab", renderSidebarTab);

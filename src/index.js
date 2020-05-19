import { init, onReady, onceReady, renderSidebarTab, renderJournalSheet } from "./hooks.js";

// register hooks
Hooks.once("init", init);
Hooks.once("ready", onceReady);
Hooks.on("ready", onReady);
Hooks.on("renderSidebarTab", renderSidebarTab);
Hooks.on("renderJournalSheet", renderJournalSheet);

import { init, ready } from './hooks.js';

// register hooks
Hooks.once('init', init);
Hooks.once('ready', ready);

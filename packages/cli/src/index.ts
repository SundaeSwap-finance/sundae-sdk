import { mainMenu } from "./menus/main.js";
import { fillRemainingSettings, readSettings } from "./menus/settings.js";
import { State } from "./types.js";

const state: State = new State();

await readSettings(state);

await fillRemainingSettings(state);

await mainMenu(state);

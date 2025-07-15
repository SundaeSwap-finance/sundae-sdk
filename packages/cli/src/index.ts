import { mainMenu } from "./menus/main";
import { fillRemainingSettings, readSettings } from "./menus/settings";
import { State } from "./types";

const state: State = new State();

await readSettings(state);

await fillRemainingSettings(state);

await mainMenu(state);

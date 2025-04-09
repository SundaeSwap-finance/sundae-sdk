import { mainMenu } from "./menus/main";
import { fillRemainingSettings, readSettings } from "./menus/settings";
import type { IState } from "./types";

const state: IState = {
  settings: {},
};

readSettings(state);

await fillRemainingSettings(state);

await mainMenu(state);

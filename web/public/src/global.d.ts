type cssAnim = { in: string, out: string, dt: number };

type UtilityAction = ((this: HTMLDivElement, ev: MouseEvent) => any) | null
type UtilityActions = {
  [k: string]: UtilityAction;
}

type ThemeState   = { css: string, active: boolean };
type ThemeLibrary = { [k: string]: ThemeState };
interface ThemeController {
  lib           : ThemeLibrary;
  select        : (string) => void;
  cycleCurrent  : (HTMLElement) => void;
  getSavedTheme : () => string | null;
}

interface UtilityMenu { title: string; actions: UtilityActions; }

interface ViewScaleDims { width?: string; height?: string; }

interface ViewScalingTable {
  default?: ViewScaleDims;
  min?:     ViewScaleDims;
  max?:     ViewScaleDims;
}

interface WinSpec {
  id              : string;
  name            : string;
  color?          : string;
  bgColor?        : string;
  header?         : string;
  toggle?         : Toggler;
  exit?           : () => void;
  template?       : string;
  scales?         : ViewScalingTable;
  utilities?      : UtilityMenu[];
  fullscreenable? : boolean;
}

interface WindowView {
  id           : string;
  root         : HTMLElement;
  spec         : WinSpec;
  updateHeader : (s: string) => void;
  toggle?      : Toggler;
}

interface TogglerSpec {
  winName     : string,
  classId     : string,
  transition? : [string, string, number],
  onToggle?   : (w: WindowView) => void,
}

type Toggler = () => void;

interface MasterView {
  viewTable:        { [n: string]: HTMLElement | null },
  _fullscreenView:   HTMLElement | null,
  _windowTable:     { [string]: WindowView },

  togglers:         { [n: string]: Toggler },
  attachToggler:    (spec: TogglerSpec) => Toggler,

  windowFrom:       (spec: WinSpec) => WindowView | null,
  getWindow:        (id: string)     => WindowView,
  resetSizes:       (vw: WindowView, orr?: ViewScalingTable) => void,

  toggleFullscreen: (id: string)     => void,
}

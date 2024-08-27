import {RevealDir, MouseFlag} from "./common"
import * as common from "./common"

function _injectToolbar(spec: WinSpec, mv: MasterView)
: HTMLElement | undefined | null {
  const WIN_TOOL_BAR_HTML = `
    <div class="winbar">
      <div class="winbar-left"></div>
      ${spec.header ? `<div class="header-area">${spec.header}</div>`: ""}
      <div class="winbar-right">
      ${spec.fullscreenable ?
            `<div class="winbar-min-max">
                <span class="material-symbols-outlined" id="fullscreen-open">
                  fullscreen
                </span>
                <span class="hidden material-symbols-outlined"
                      id="fullscreen-close">
                  close_fullscreen
                </span>
              </div>`: ""}
      ${spec.exit
        ? `<span class="winbar-close material-symbols-outlined"
            id="winbar-close">
            close
          </span>`
        : ""}
      </div>
    </div>
  `
  const CONSTRUCT_UTILITY_MENU_BTNS = (uts: Element, um: UtilityMenu) => {
    const btn    = document.createElement("div");
    const btnLbl = document.createElement("span");
    btnLbl.innerText = um.title;
    btn.appendChild(btnLbl);
    btn.classList.add("utility-menu-btn")
    const menu = document.createElement("div");
    menu.classList.add("utility-menu", "hidden");
    document.body.appendChild(menu);
    btn.addEventListener("click", () => {
      common.revealMenu(btn, menu, RevealDir.DOWN);
      btn.classList.toggle("utility-menu-btn-on");
    });
    common.hideMenuOnMouseEvent(
      MouseFlag.UNBOUNDED_CLICK |
      MouseFlag.BOUNDED_CLICK   |
      MouseFlag.MOUSE_EXIT,
      btn, menu
    );

    for (const [lbl, fn] of Object.entries(um.actions)) {
      common.constructMenuField(menu, lbl, fn);
    }
    uts.appendChild(btn);
  }

  const {id, utilities, template} = spec;
  const root = common.getIdOrCry(id);
  if (!root) return;
  if (template) {
    const tmpl = document.getElementById(template) as HTMLTemplateElement;
    if (tmpl) root.appendChild(tmpl.content);
  }
  const winbarContainer = document.createElement("div");
  winbarContainer.innerHTML = WIN_TOOL_BAR_HTML;
  const winbar = winbarContainer.querySelector(".winbar");

  if (spec.bgColor) {
    (winbar as HTMLElement).style.backgroundColor = spec.bgColor;
  }
  if (spec.color) (winbar as HTMLElement).style.backgroundColor = spec.color;

  if (winbar) root.insertBefore(winbar, root.firstChild);
  if (winbar) {
    const barLeft = winbar.querySelector(".winbar-left");
    if (barLeft) {
      utilities?.forEach(um => {
        CONSTRUCT_UTILITY_MENU_BTNS(barLeft, um);
      });
    }
    if (spec.exit) {
      root
        ?.querySelector("#winbar-close")
        ?.addEventListener("click", () => {
          if (spec.exit) spec.exit();
          root.classList.remove("fullscreen");
          root.style.maxWidth  = spec.scales?.max?.width      as string;
          root.style.maxHeight = spec.scales?.max?.height     as string;
          root.style.minWidth  = spec.scales?.min?.width      as string;
          root.style.minHeight = spec.scales?.min?.height     as string;
          root.style.width     = spec.scales?.default?.width  as string;
          root.style.height    = spec.scales?.default?.height as string;
        });
    }
    if (spec.fullscreenable) {
      root
        ?.querySelector(".winbar-min-max")
        ?.addEventListener("click", () => mv.toggleFullscreen(spec.name));
    }
  } else console.error("No element with 'winbar' found in HTML.");
  return root;
}

function _resetSizes(vw: WindowView, override?: ViewScalingTable) {
  /* TODO:
     incorporate appropriate testing so that minWidth/height can be
     appropriately utilized, omitting for simplicity for the time being.
  */
  const source = override ? override : vw.spec.scales;
  if (!source) return;
  vw.root.style.maxWidth  = source.max?.width      as string;
  vw.root.style.maxHeight = source.max?.height     as string;
  vw.root.style.minWidth  = source.min?.width      as string;
  vw.root.style.minHeight = source.min?.height     as string;
  vw.root.style.width     = source.default?.width  as string;
  vw.root.style.height    = source.default?.height as string;
}

function _wrapWin(spec: WinSpec, mv: MasterView): WindowView | null {
  const root = _injectToolbar(spec, mv);
  if (!root) {
    console.error("failed to inject into root view div!");
    return null;
  }
  root?.classList.add("hidden", "view-win");
  if (spec.bgColor) root.style.borderColor = spec.bgColor;
  const vw = {
    id: spec.id, root, spec,
    updateHeader: (s: string) => {
      const hd = root.querySelector<HTMLElement>(".header-area");
      if (hd) hd.innerText = s;
    }
  };
  _resetSizes(vw);
  return vw;
}

async function _classSwitch(
  className: string, viewMe: HTMLElement, anim?: cssAnim,
): Promise<void> {
  const vmClasses = viewMe.classList;
  if (!vmClasses.contains(className) && anim) {
    vmClasses.add(anim.out);
    return new Promise((res) => {
      setTimeout(() => {
        vmClasses.remove(anim.out);
        vmClasses.add(className, anim.in);
        res();
      }, anim.dt);
    })
  } else {
    if (anim) vmClasses?.add(anim.in);
    vmClasses?.toggle(className);
  }
}

function _createMasterView(initId: string): MasterView {
  return {
    _fullscreenView : null,
    viewTable       : { desktop: common.getIdOrCry(initId), },
    togglers        : {},
    _windowTable    : {},

    getWindow:
    function(name: string): WindowView {
      return (this._windowTable as any)[name];
    },

    resetSizes: _resetSizes,

    attachToggler:
    function ({classId, winName, transition, onToggle}): Toggler {
      const win  = this.getWindow(winName);
      if (!win) return () => console.warn("No toggler defined.");
      const toggler = () => {
        (async () => {
          await _classSwitch(classId, win.root, {
            in:  transition ? transition[0] : "",
            out: transition ? transition[1] : "",
            dt:  transition ? transition[2] : 0,
          });
          if (onToggle) onToggle(win);
        })();
      };
      win.spec.toggle = toggler;
      win.toggle = toggler;
      return toggler;
    },

    toggleFullscreen:
    function(name: string): void {
      const vw = this.getWindow(name);
      if (!vw) return;
      (async () => {
        await _classSwitch("fullscreen", vw.root, {
          in:  "fullscreen-view-in",
          out: "fullscreen-view-out",
          dt:  150
        });
      this.resetSizes(
        vw, vw.root.classList.contains("fullscreen")
          ? ({ default: { width: "100%", height: "100%" },
               max:     { width: "100%", height: "100%" }})
          : undefined );
      })();
    },

    windowFrom: function(spec: WinSpec): WindowView | null {
      console.error("UNIMPLEMENTED: did you call createMasterView?");
      return null;
    },

  }
}

export function createMasterView(initId: string = "view-desktop"): MasterView {
  const mv = _createMasterView(initId);
  mv.windowFrom = (spec: WinSpec) => {
    const vw = _wrapWin(spec, mv);
    if (!vw) {
      console.error("_wrapWin internal injection error");
      return null;
    }
    (mv._windowTable as any)[spec.name] = vw;
    return vw;
  }
  return mv;
}

const NAME_MIN_LENGTH    = 3;
const NAME_MAX_LENGTH    = 18;
const NAME_ALLOWED_CHARS =
  "abcdefghijklmnopqrstuvwxyz1234567890-~!$%+=_*&#";

export interface Result<T> {
  success : boolean;
  data?   : T;
  error?  : string;
}

export enum RevealDir {
  DOWN = "bottom",
  UP   = "top",
};

export const GUARD_NAME_LENGTH = (name: string): Result<string> =>
  NAME_MIN_LENGTH > name.length || name.length > NAME_MAX_LENGTH
    ? { success: false, error: "invalid name length, must be (4-18) characters"}
    : { success: true, data: name };

export const GUARD_NAME_CHARS = (name: string): Result<string> =>
  name.toLowerCase()
      .split("")
      .reduce((b, c) => NAME_ALLOWED_CHARS.includes(c) && b, true)
        ? { success: true, data: name }
        : { success: false, error: "string contains invalid character"};


export function getIdOrCry(id: string): HTMLElement | null {
  const el: HTMLElement | null = document.getElementById(id);
  if (!el) {
    console.error(`Couldn't find element with id ${id}`);
    return null;
  }
  return el;
}

export function getIdOrDie(id: string): HTMLElement | null {
  const el: HTMLElement | null = document.getElementById(id);
  if (!el) throw Error(`Couldn't find element with id ${id}`);
  return el;
}

export enum MouseFlag {
  UNBOUNDED_CLICK = 1 << 0,
  BOUNDED_CLICK   = 1 << 1,
  MOUSE_EXIT      = 1 << 2,
};

export function hideMenuOnMouseEvent(
  ef: MouseFlag, btn: HTMLElement, menu: HTMLElement
): void {
  const MOUNT_PRED
    = (pred: boolean, menu: HTMLElement, btn: HTMLElement) => {
      if (pred) {
        menu.classList.add("hidden");
        btn.classList.remove("utility-menu-btn-on");
      }
    };
  if (ef & MouseFlag.UNBOUNDED_CLICK) {
    document.addEventListener("click", (e) => {
      MOUNT_PRED(
        !btn.contains(e.target as Node) && !menu.contains(e.target as Node),
        menu, btn,
      )
    });
  }
  if (ef & MouseFlag.BOUNDED_CLICK) {
    document.addEventListener("click", (e) =>{
      MOUNT_PRED(menu.contains(e.target as Node), menu, btn);
    });
  }
  if (ef & MouseFlag.MOUSE_EXIT) {
    document.addEventListener("mousemove", (e) => {
      MOUNT_PRED(
        !btn.contains(e.target as Node) && !menu.contains(e.target as Node),
        menu, btn,
      )
    });
  }
}

export function revealMenu(
  btn: HTMLElement, menu: HTMLElement, dir: RevealDir
): void {
  menu.classList.toggle("hidden");
  const rectbtn = btn.getBoundingClientRect();
  menu.style[dir === RevealDir.DOWN
    ? RevealDir.UP
    : RevealDir.DOWN ]
    = `${
      dir == RevealDir.UP
          ? window.innerHeight - rectbtn[dir]
          : rectbtn[dir]
      }px`;
  menu.style.left = `${rectbtn.left}px`;
}

export function constructMenuField(
  menu: HTMLElement, lbl: string,
  fn: ((this: HTMLDivElement, ev: MouseEvent) => any) | null,
): HTMLElement {
  const div = document.createElement("div");
  div.classList.add("utility-menu-field-btn");
  const spanLabel = document.createElement("span");
  spanLabel.innerText = lbl;
  div.appendChild(spanLabel);
  div.addEventListener("click", fn ? fn : () => {});
  menu.appendChild(div);
  return div;
}

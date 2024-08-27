import "../css/style.css";
import * as cmn from "./common";

type LoginFieldType = "username" | "password" | "confirm password";
type LoginModeType  = "login" | "register";

export interface LoginInterface {
  currentMode:  LoginModeType;
  currentField: LoginFieldType;
  root:         HTMLElement;
  inputLegend:  HTMLLegendElement;
  inputField:   HTMLInputElement;
  errorField:   HTMLElement;
  loginBtn:     HTMLButtonElement;
  registerBtn:  HTMLButtonElement;
  onSubmit:
  (n: string, p: string, b: boolean) => Promise<Record<string, unknown>>;
}

export interface Session {
  loggedIn:  boolean;
  username?: string;
  userId?:   number;
}

const _toggler = (t: LoginModeType, IT: LoginInterface) => () => {
  IT.currentField = "username";
  IT.inputLegend.innerText = IT.currentField;
  IT.inputField.value = "";
  IT.inputField.type = "";
  const currBtn = IT[t+"Btn" as keyof LoginInterface] as HTMLButtonElement;
  IT.currentMode = t;
  if (!currBtn.classList.contains("login-btn-on")) {
    const c = t === "login" ? "register" : "login";
    const compBtn = IT[c+"Btn" as keyof LoginInterface] as HTMLButtonElement;
    currBtn.classList.toggle("login-btn-on");
    compBtn.classList.toggle("login-btn-on");
  };
}

function _setField(f: LoginFieldType, IT: LoginInterface) {
  IT.currentField = f;
  IT.inputLegend.innerText = f;
  IT.inputField.value = "";
  IT.inputField.type
    = (f === "password" || f === "confirm password") ? "password" : "";
}

export function init(S: Session, IT: LoginInterface): void {
  let _p1: string | null = null;
  let _p2: string | null = null;

  IT.loginBtn.addEventListener("click",    _toggler("login", IT));
  IT.registerBtn.addEventListener("click", _toggler("register", IT));

  IT.inputField.addEventListener("keydown", e => {
    if (e.key == "Enter") {
      if (IT.currentMode === "login") {
        switch (IT.currentField) {
          case "username":
            S.username = IT.inputField.value;
            _setField("password", IT);
            IT.errorField.innerText = "";
            break;
          case "password":
            _p1 = IT.inputField.value;
            if (S.username) {
              IT.onSubmit(S.username, _p1, false)
                .then(res => {
                  if (res.err) {
                    IT.errorField.innerText = "login failure, try again";
                    _setField("username", IT);
                  } else {
                    IT.root.classList.add("hidden");
                    S.loggedIn = true;
                  }
                })
            } else {
              IT.errorField.innerText = "empty username field, try again";
              _setField("username", IT);
            }
            _p1 = null;
            break;
        }
      } else if (IT.currentMode === "register") {
        switch (IT.currentField) {
        case "username":
          S.username = IT.inputField.value;
          _setField("password", IT);
          IT.errorField.innerText = "";
          break;
        case "password":
          IT.currentField = "confirm password";
          _p1 = IT.inputField.value;
          _setField("confirm password", IT);
          IT.errorField.innerText = "";
          break;
        case "confirm password":
          _p2 = IT.inputField.value;
          IT.inputField.value = "";
          if (_p1 !== _p2) {
            IT.errorField.innerText = "mismatched passwords, try again"
            _setField("username", IT);
            break;
          } else {
            if (!S.username) {
              IT.errorField.innerText = "username cannot be empty";
              _setField("username", IT);
              break;
            }
            if (S.username) {
              const glen_uname   = cmn.GUARD_NAME_LENGTH(S.username);
              const gchars_uname = cmn.GUARD_NAME_LENGTH(S.username);
              if (!glen_uname.success && glen_uname.error) {
                IT.errorField.innerText = glen_uname.error;
                _setField("username", IT);
                break;
              }
              else if (!gchars_uname.success && gchars_uname.error) {
                IT.errorField.innerText = gchars_uname.error;
                _setField("username", IT);
                break;
              }
              else {
                IT.onSubmit(S.username, _p1, true)
                  .then(res => {
                    if (res.err) {
                      IT.errorField.innerText = res.err+", try again";
                      _setField("username", IT);
                    } else {
                      IT.root.classList.add("hidden");
                      S.loggedIn = true;
                    }
                  });
              }
            }
          }
          break;
        }
      }
    }
  });
}

import "../css/style.css"

import * as common from "./common"
import * as themes from "./themes"
import * as    win from "./window"
import * as   chat from "./chat"
import     {ChSig} from "./chat"
import * as  login from "./login"
import * as    env from "./env"

function viewMountHandler(id: string, ev: string, fn: EventListener): void {
  const btn = common.getIdOrCry(id);
  if (!btn) return;
  btn.addEventListener(ev, fn);
}

function loadThemes(): void {
  const themeControl = themes.bootstrap();
  const savedTheme = themeControl.getSavedTheme();
  themeControl.select(savedTheme ? savedTheme : "NINEZIG");
  const btn = common.getIdOrDie("color-theme-btn");
  if (btn) {
    const menu = document.createElement("div");
    menu.classList.add("utility-menu", "hidden");
    document.body.append(menu);
    for (const theme of Object.keys(themeControl.lib)) {
      const curr = common.constructMenuField(menu, theme, () => {
        themeControl.select(theme);
        themeControl.cycleCurrent(curr);
      });
      if (theme == savedTheme) themeControl.cycleCurrent(curr);
    }
    btn.addEventListener("click", () => {
      common.revealMenu(btn, menu, common.RevealDir.UP);
      btn.classList.toggle("utility-menu-btn-on");
    });
    common.hideMenuOnMouseEvent(
      common.MouseFlag.UNBOUNDED_CLICK,
      btn, menu
    );
  }
}

function attachWindows(mv: MasterView, ch: chat.Session): void {
  mv.windowFrom({
    id: "view-login",
    template: "--templ-auth",
    name: "login",
    header: "login or register",
    scales: {
      default: { width: "40%",    height: "30%" },
      max:     { width: "1280px", height: "1040px" }
    },
  });

  mv.attachToggler({
    winName: "login",
    classId: "hidden",
    transition: ["win-pop-view-in", "win-pop-view-out", 150],
    onToggle: () => {
      document.getElementById("login-in")?.focus();
    }
  });

  mv.windowFrom({
    id: "view-chat-uname",
    template: "--templ-view-chat-uname",
    name: "chat-uname",
    header: "username",
    bgColor: "var(--color-blue)",
    exit: function() { if (this.toggle) this.toggle(); },
    scales: {
      default: { width: "30%",    height: "10%" },
      max:     { width: "1280px", height: "1040px" }
    },
  });

  mv.attachToggler({
    winName: "chat-uname",
    classId: "hidden",
    transition: ["win-pop-view-in", "win-pop-view-out", 150],
    onToggle: () => {
      document.getElementById("chat-uname-in")?.focus();
    }
  });

  mv.windowFrom({
    id: "view-chat-popup",
    template: "--templ-view-chat-popup",
    name: "chat-popup",
    header: "enter channel number",
    bgColor: "var(--color-blue)",
    exit: function() { if (this.toggle) this.toggle(); },
    scales: {
      default: { width: "30%",    height: "10%" },
      max:     { width: "1280px", height: "1040px" }
    },
  });

  mv.attachToggler({
    winName: "chat-popup",
    classId: "hidden",
    transition: ["win-pop-view-in", "win-pop-view-out", 150],
    onToggle: () => {
      document.getElementById("chat-connect-in")?.focus();
    }
  });

  const _curry_connect_utility =
  (mv: MasterView, ch: chat.Session) => () => {
    const chatChannelWin = mv.getWindow("chat-popup");
    (chatChannelWin.toggle as Toggler)();
    if (!ch.isInitialized.channels) {
      ch.isInitialized.channels = true;
      const connIn =
        document.getElementById("chat-connect-in") as HTMLInputElement;
      connIn.addEventListener("keydown", e => {
        if (e.key === "Enter") {
          ch.connect(Number(connIn.value))
            .then((ws) => {
              if (ws) {
                mv.getWindow("chat").updateHeader(
                  `chat [channel: ${ch.getChannel()}]`
                );
                (chatChannelWin.toggle as Toggler)();
                const stream = document
                  .getElementById("chat-stream-msg-container") as HTMLElement;
                stream.innerHTML = "";
                stream.appendChild(
                  ch.genMessage(
                    ChSig.INFO, `connected to channel ${ch.getChannel()}`
                  )
                );
                ws.send(chat.encode(ChSig.JOIN, ch.getUsername()));
              }
            });
        }
      });
    }
  }

  mv.windowFrom({
    id: "view-chat",
    template: "--templ-view-chat",
    name: "chat",
    header: "chat",
    fullscreenable: true,
    scales: {
      default: { width: "90%",    height: "90%" },
      max:     { width: "1280px", height: "1040px" }
    },
    exit: function() {
      if (this.toggle) this.toggle();
      mv.getWindow("chat-uname").root.classList.add("hidden");
      Array.from(document.getElementsByClassName("utility-menu"))
        .forEach((el) => el.classList.add("hidden"));
    },
    utilities: [
      {
        title: "run",
        actions: {
          connect: _curry_connect_utility(mv, ch),
        }
      },
    ]
  });

  mv.attachToggler({
    winName: "chat",
    classId:  "hidden",
    transition: ["win-pop-view-in", "win-pop-view-out", 150],
    onToggle: (vw) => {
      if (ch.getChannel() === null) {
        const stream
          = document.getElementById("chat-stream-msg-container") as HTMLElement;
        stream.innerHTML = "";
        stream.appendChild(
          ch.genMessage(
            ChSig.INFO, "Welcome! Please connect to a channel to chat!"
          )
        );
        ch.attachHandler(ChSig.MESG, (msg: string) => {
            const [_, sender_name, sender_msg] = msg.split(";");
            stream.appendChild(
              ch.genMessage(ChSig.MESG, sender_msg, sender_name)
            );
          })
          .attachHandler(ChSig.JOIN, (msg: string) => {
            const [_, sender_name] = msg.split(";");
            stream.appendChild(
              ch.genMessage(ChSig.INFO, `${sender_name} joined channel.`)
            );
          })
          .attachHandler(ChSig.INFO, (msg: string) => {
            const [_, __, info_msg] = msg.split(";");
            console.log(`${info_msg}`);
          })
      }
      if (vw.root.classList.contains("fullscreen")) mv.resetSizes(vw);
    },
  });
}

function main(): void {
  if (env.LOAD_VARS() === true) console.log("successfully lodaded environment");

  const mv: MasterView = win.createMasterView();
  loadThemes();

  const chSession = chat.startSession();
  attachWindows(mv, chSession);
  chat.INIT_MSG_INPUT(chSession);

  const SESSION: login.Session = { loggedIn: false };

  (async () => {
    const res = await fetch(`${env.VARS.GATEWAY_DB}/status`, {
      method: "GET",
      credentials: "include",
    });
    if (res.ok) {
      const user_data  = await res.json();
      SESSION.username = user_data.name;
      SESSION.loggedIn = true;
      SESSION.userId   = user_data.id;
      console.log(SESSION);
    }
    login.init(SESSION, {
      currentMode:  "login",
      currentField: "username",
      root:         document.getElementById("view-login")   as HTMLElement,
      inputLegend:  document.getElementById("input-legend") as HTMLLegendElement,
      inputField:   document.getElementById("login-in")     as HTMLInputElement,
      errorField:   document.getElementById("login-errors") as HTMLElement,
      loginBtn:
        document.getElementById("login-btn-login") as HTMLButtonElement,
      registerBtn:
        document.getElementById("login-btn-register") as HTMLButtonElement,
      onSubmit: async function(name: string, pwd: string, reg: boolean) {
        const to_server = new URLSearchParams();
        to_server.append("name", name);
        to_server.append("pwd", pwd);
        if (reg) to_server.append("reg", reg.toString());
        const endpoint = env.VARS.GATEWAY_DB +
          (this.currentMode === "login" ? "/login" : "/register");
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: to_server.toString(),
          credentials: "include",
        });
        if (!res.ok)  {
          switch (res.status) {
            case 401: case 402:
              if (this.currentMode === "login") return {"err": "login failure"};
              return {"err": "user already exists"};
            case 500:
              if (this.currentMode === "login") return {"err": "login failure"};
              return {"err": "failed to register user"};
            default:
              return { "err": `Unexpected error: ${res.status}` };
          }
        }
        return res.json();
      }
    });
    const login_view = mv.getWindow("login") as WindowView;
    if (!SESSION.loggedIn) (login_view.toggle as Toggler)();
  })();

  viewMountHandler("view-chat-btn", "click", () => {
    if (SESSION.loggedIn) {
      (mv.getWindow("chat").toggle as Toggler)();
      if (SESSION.username) chSession.setUsername(SESSION.username);
      chSession.goOnline();
    }
  });
}

window.onload = main

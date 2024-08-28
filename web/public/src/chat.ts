import "../css/style.css"
import * as cmn from "./common";
import * as env from "./env";

export enum ChSig { MESG, INFO, JOIN, EXIT };

type MsgTemplate = {
  sig   : ChSig,
  time? : string,
  name? : string,
  msg?  : string,
}

const MSG_FROM = (t: MsgTemplate): string => {
  switch (t.sig) {
    case ChSig.JOIN:
      return `
        <span class="material-symbols-outlined">person</span>
        <p>${t.name}</p>
      `;
    case ChSig.INFO:
      return `
        <div class="chat-stream-msg-inner">
          <p class="chat-stream-msg-time"
              style="color: var(--color-green);
                     background-color: var(--color-dark);">
            ${t.time}
          </p>
        </div>
        <p class="chat-stream-msg-post"
            style="color: var(--color-green);
                   background-color: var(--color-dark);">
          ${t.msg}
        </p>
      `;
    case ChSig.MESG: default:
      return `
        <div class="chat-stream-msg-inner">
          <p class="chat-stream-msg-time">${t.time}</p>
          <p class="chat-stream-msg-name">${t.name}</p>
        </div>
        <p class="chat-stream-msg-post">${t.msg}</p>
      `;
  }
}

export const INIT_MSG_INPUT = (s: Session) => {
  const input = document.getElementById("chat-input") as HTMLTextAreaElement;
  const btn_cancel = document.getElementById("chat-btn-cancel") as HTMLElement;
  const stream
    = document.getElementById("chat-stream-msg-container") as HTMLElement;
  input.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const skt = s.getConnection();
      if (skt) {
        /* Very simple encoding, just a ';' delimiter */
        skt.send(`${ChSig.MESG};${s.getUsername()};${input.value}`);
        stream.appendChild(
          s.genMessage(ChSig.MESG, input.value, s.getUsername())
        );
      }
      input.value = "";
    }
  });
  btn_cancel.addEventListener("click", () => {
    input.value = "";
  });
}

type handlerMap = { [key in ChSig]: ((...args: any) => void) | null };

export const encode =
  (s: ChSig, name: string, msg?: string) => `${s};${name};${msg}`;

export interface Session {
  isInitialized    : { input: boolean, stream: boolean, channels: boolean },
  goOnline         : () => void,
  getUsername      : () => string,
  setUsername      : (name: string) => cmn.Result<string>,
  getChannel       : () => number | null,
  genMessage       : (s: ChSig, m: string, n?: string) => HTMLElement,
  connect          : (chan: number) => Promise<WebSocket | null>,
  disconnect       : () => void,
  getConnection    : () => WebSocket | null,
  attachHandler    : (s: ChSig, fn: (msg: string) => void) => Session,
};

export function startSession(): Session {
  let _username                 = "guest";
  let _isOnline                 = false;
  let _channel: number | null   = null;
  let _socket: WebSocket | null = null;
  let _handlers: handlerMap = {
    [ChSig.MESG]: null,
    [ChSig.INFO]: null,
    [ChSig.JOIN]: null,
    [ChSig.EXIT]: null,
  }
  return {
    isInitialized : { input: false, stream: false, channels: false, },
    getChannel    : () => _channel,
    getUsername   : () => _username,
    setUsername   : function(name: string) {
      let res_len  = cmn.GUARD_NAME_LENGTH(name);
      let res_name = cmn.GUARD_NAME_CHARS(name);
      if (!res_len.success || !res_name.success) return {
        success : false,
        error   :
          (res_len.error  ? res_len.error + " " : "") +
          (res_name.error ? res_name.error : ""),
      }
      _username = name;
      return { success: true, data: _username };
    },
    genMessage: (sig: ChSig, msg: string, sender?: string) =>  {
      const now  = new Date();
      const hrs  = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      const div  = document.createElement("div");
      div.classList.add("chat-stream-msg-box");
      div.innerHTML = MSG_FROM(
        sig === ChSig.MESG
          ? {
            sig: sig,
            time: `${hrs}:${mins}`,
            name: sender,
            msg: msg
          }
          : {
            sig: sig,
            time: `${hrs}:${mins}`,
            msg: msg
          })
      return div;
    },
    goOnline: () => {
      if (!_isOnline) {
        const div = document.createElement("div");
        div.classList.add("chat-stream-online-username");
        div.id = `chat-stream-online-${_username}`;
        div.innerHTML = MSG_FROM({
          sig: ChSig.JOIN,
          name: _username
        });
        (document.getElementById("chat-stream-online") as HTMLElement)
          .appendChild(div);
        _isOnline = true;
      }
    },
    attachHandler: function(sig, fn) { _handlers[sig] = fn; return this; },

    connect:
    (channel_number: number) => new Promise<WebSocket | null>((yes, no) => {
      _channel = channel_number;
      console.log("Attempting connection to: ", env.VARS.GATEWAY_WS);
      _socket = new WebSocket(`${env.VARS.GATEWAY_WS}/${_channel}`);
      _socket.onopen  = () => yes(_socket);
      _socket.onclose = () => {
        _channel = null;
        _socket  = null;
        no(null);
      }
      _socket.onmessage = ({data}) => {
        const fn = _handlers[Number(data.split(";")[0]) as ChSig];
        if (fn) fn(data);
      };
    }),
    disconnect:    () => { if (_socket) _socket.close(); },
    getConnection: () => _socket,
  }
}

import APIAccess from "./api/api";

export class MsgEvent {
  type: string;
  data: any;
}

type MessageListener = (msg: MsgEvent | Blob) => void;

export default class SocketClient {
  ws: WebSocket;
  messageListeners: MessageListener[] = [];

  constructor(apiAccess: APIAccess) {
    const ws = new WebSocket('ws://' + location.hostname + '/pong-ws');
    this.ws = ws;
    ws.onopen = (ev) => {
      console.log('socket open');
      this.send({ type: 'auth', token: apiAccess.token });
    };
    ws.onclose = (ev) => {
      console.log('close', ev);
    };
    ws.onerror = (ev) => {
      console.log('error', ev);
    };
    ws.onmessage = (event) => {
      let msg: any;
      if (event.data instanceof Blob) {
        msg = event.data;
      } else if (typeof event.data == 'string') {
        const obj = JSON.parse(event.data);
        msg = new MsgEvent();
        msg.type = obj.type;
        msg.data = obj.data;

        if (msg.type == 'auth') {
          if (msg.code == 1) {
            apiAccess.resetToken();
            apiAccess.auth().then(() => {
              this.send({ type: 'auth', token: apiAccess.token });
            });
          }
        }
      }
      this.messageListeners.forEach((l) => l(msg));
    };
  }

  onMessage(l: MessageListener) {
    this.messageListeners.push(l);
  }

  sendBinary(data: ArrayBuffer) {
    this.ws.send(data);
  }

  send(message: any) {
    this.ws.send(JSON.stringify(message));
  }
}
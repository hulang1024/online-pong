import APIAccess from "./api/api";

export class ServerMsg {
  type: string;
  data: any;
}

type MessageListener = (msg: ServerMsg | Blob) => void;

export default class SocketClient {
  private ws: WebSocket;
  private messageListeners: MessageListener[] = [];
  // 模拟网络抖动
  private throttlingMsgQueue: ServerMsg[] = [];
  private _enableThrottling = false;

  set enableThrottling(enable: boolean) {
    if (this._enableThrottling && !enable) {
      // 如果从启用到禁用，清空之前的等待队列
      while (this.throttlingMsgQueue.length) {
        this.triggerMessageListeners( this.throttlingMsgQueue.shift() );
      }
    }
    this._enableThrottling = enable;
  }

  constructor(apiAccess: APIAccess) {
    const ws = new WebSocket('ws://' + location.hostname
      + (location.hostname == 'localhost' ? ':9999' : '/pong-ws'));
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
        msg = new ServerMsg();
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
      
      if (this._enableThrottling) {
        this.throttlingMsgQueue.push(msg);
        setTimeout(() => {
          this.triggerMessageListeners( this.throttlingMsgQueue.shift() );
        }, Math.random() * 500 + 50);
      } else {
        this.triggerMessageListeners(msg);
      }
    };
  }

  onMessage(l: MessageListener) {
    this.messageListeners.push(l);
  }

  triggerMessageListeners(msg: ServerMsg) {
    this.messageListeners.forEach((l) => l(msg));
  }

  sendBinary(data: ArrayBuffer) {
    this.ws.send(data);
  }

  send(message: any) {
    this.ws.send(JSON.stringify(message));
  }
}
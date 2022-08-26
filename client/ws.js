export default class SocketClient {
  constructor(uid) {
    // TODO: token
    const ws = new WebSocket('ws://' + location.hostname + ':9999?uid=' + uid);
    this.ws = ws;
    this.messageListeners = [];

    ws.onopen = (ev) => {
      console.log('open', ev);
    };
    ws.onclose = (ev) => {
      console.log('close', ev);
    };
    ws.onerror = (ev) => {
      console.log('error', ev);
    };
    ws.onmessage = (event) => {
      this.messageListeners.forEach((l) => l(event.data));
    };
  }

  onMessage(l) {
    this.messageListeners.push(l);
  }

  sendBinary(data) {
    this.ws.send(data);
  }

  send(message) {
    this.ws.send(JSON.stringify(message));
  }
}
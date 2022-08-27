import Input from './input/input';
import InputKey from './input/input-key';
import InputFrame from './input-frame';
import ServerUpdateFrame from './server-update-frame';
import Player from './player';
import SocketClient from '../ws';
import APIAccess from '../api/api';
import Viewport from './viewport';
import InputState from './input/Input-state';

export default class Game {
  apiAccess: APIAccess;
  players: Player[] = [];
  localPlayer: Player;
  // 当前帧号
  frameNo = 0;
  // 关键帧号
  keyFrameNo = 0;
    
  isStarted = false;
  isPause = true;
  // 等待服务器更新
  isWait = true;
  // 记录本地上一个关键帧到一个关键帧之间的帧输入，发送完后可以清空
  localInputFrameBuffer: InputFrame[] = [];
  // 记录服务端发送的更新消息
  lastServerUpdate: ServerUpdateFrame = null;
  // 每个玩家的InputFrame的缓冲区
  playerToInputFrameQueue = new Map<number, InputFrame[]>();

  socketClient: SocketClient;

  viewport: Viewport;
  canvas: HTMLCanvasElement;
  context2d: CanvasRenderingContext2D;

  constructor(apiAccess: APIAccess, socketClient: SocketClient) {
    this.apiAccess = apiAccess;
    this.socketClient = socketClient;

    this.viewport = new Viewport();
    this.viewport.width = 400;
    this.viewport.height = 400;

    const canvas = document.getElementById('canvas1') as HTMLCanvasElement;
    canvas.width = this.viewport.width;
    canvas.height = this.viewport.height;
    this.canvas = canvas;
    this.context2d = canvas.getContext('2d');
    this.context2d.font = '14px sans-serif';

    Input.addKeyListener(
      this.onKeyPressed.bind(this),
      this.onKeyReleased.bind(this));

    this._initSocket();
  }

  fixedUpdate(delta: number) {
    if (this.isPause) {
      return;
    } else if (this.isWait) {
      console.log('wait', this.frameNo);
      return;
    }

    // 已到关键帧
    if (this.frameNo == this.keyFrameNo) {
      //console.log(frameNo, keyFrameNo, this.lastServerUpdate.frameNo);
      // 关键帧时是否已经有更新数据？
      if (this.lastServerUpdate.frameNo >= this.frameNo) {
        // 更新下个关键帧号
        this.keyFrameNo = this.lastServerUpdate.nextKeyFrameNo;
        //console.log('next key frame', keyFrameNo);
        // 更新输入
        this.lastServerUpdate.playerInputFrames
          .forEach((inputFrames, playerId) => {
            this.playerToInputFrameQueue.set(playerId, inputFrames);
          });
        // 排除了起始帧时，以及特殊情况可能为空
        if (this.localInputFrameBuffer.length) {
          this._uploadBufferToServer();
          this.localInputFrameBuffer.length = 0;
        }
      } else {
        // 等待更新
        this.isWait = true;
        return;
      }
    }

    this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 统一处理players
    this.players.forEach((player, i) => {
      player.draw();
      this.context2d.fillText(player.position.toString(),
        this.viewport.width - 140, 20 + 20 * i);
      // 每帧消费一个输入帧
      const buffer = this.playerToInputFrameQueue.get(player.id);
      player.fixedUpdate(delta,
        buffer.length ? buffer.shift().toInputState() : InputState.EMPTY);
    });

    // 记录本地当前帧输入
    const inputFrame = InputFrame.fromInputState(this.frameNo, Input.state);
    this.localInputFrameBuffer.push(inputFrame);
    this.playerToInputFrameQueue.get(this.localPlayer.id).push(inputFrame);

    // 帧号递增
    this.frameNo++;
  }

  start(players: Player[]) {
    const colors = [
      '#0011ff', '#ff1100', '#00ff11',
      '#ffff11', '#11ffff', '#ff11ff'
    ];
    for (let i = 0; i < players.length; i++) {
      const isLocalPlayer = this.apiAccess.localUser.id == players[i].id;
      const player = new Player(
        players[i].id, colors[i], isLocalPlayer, this.viewport);
      if (isLocalPlayer) {
        this.localPlayer = player;
      }
      player.context2d = this.context2d;
      this.playerToInputFrameQueue.set(player.id, []);
      this.players.push(player);
    }

    this.isPause = false;
  }

  _initSocket() {
    this.socketClient.onMessage((msg) => {
      if (msg instanceof Blob) {
        ServerUpdateFrame.decode(msg, this.players, (frame) => {
          this.lastServerUpdate = frame;
          //console.log('lastServerUpdate.frameNo', this.lastServerUpdate.frameNo);
          //console.log('receive', JSON.stringify(frame));
          // 置为不等待
          this.isWait = false;
        });
      }
    });
  }

  
  _uploadBufferToServer() {
    this.socketClient.sendBinary(InputFrame.encode(this.localInputFrameBuffer));
    //console.log('send', JSON.stringify(this.localInputFrameBuffer));
    //console.log('send InputFrame count', localInputFrameBuffer.length);
  }

  onKeyPressed(key: InputKey) {
    if (key == InputKey.Enter) {
      this.isPause = !this.isPause;
      if (!this.isStarted) {
        this.isStarted = true;
        this.socketClient.send({ type: 'start' });
      }
    }
  }

  onKeyReleased() {

  }
}
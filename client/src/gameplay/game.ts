import Input from './input/input';
import InputFrame from './input-frame';
import ServerUpdateFrame from './server-update-frame';
import SocketClient from '../ws';
import APIAccess from '../api/api';
import Viewport from './viewport';
import InputState from './input/Input-state';
import Ball from './ball';
import Paddle from './paddle';
import Player from './player';
import { initRandomSeed } from './random';
import { createCanvas } from '../canvas';
import { SceneManager } from './scenes/scene';
import { ServeScene } from './scenes/serve-scene';
import { PlayScene } from './scenes/play-scene';

export default class Game {
  apiAccess: APIAccess;
  paddles: Paddle[] = [];
  ball: Ball;
  localPlayer: Player;
  localPaddle: Paddle;
  players: Player[];
  playerTable = new Map<number, Player>();
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

  socketClient: SocketClient;

  viewport: Viewport;
  canvas: HTMLCanvasElement;
  context2d: CanvasRenderingContext2D;

  sceneManager: SceneManager;

  constructor(apiAccess: APIAccess, socketClient: SocketClient) {
    this.apiAccess = apiAccess;
    this.socketClient = socketClient;

    this.sceneManager = new SceneManager([
      new ServeScene(this),
      new PlayScene(this)
    ]);
    this.viewport = new Viewport();
    this.viewport.width = 500;
    this.viewport.height = 500;

    const canvas = createCanvas({
      id: 'canvas1',
      width: this.viewport.width,
      height: this.viewport.height,
    });
    this.canvas = canvas;
    this.context2d = canvas.getContext('2d');
    this.context2d.font = '14px sans-serif';
    document.body.appendChild(canvas);

    this.initSocket();
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
            this.playerTable.get(playerId).inputFrameQueue = inputFrames;
          });
        // 排除了起始帧时，以及特殊情况可能为空
        if (this.localInputFrameBuffer.length) {
          this.uploadBufferToServer();
          this.localInputFrameBuffer.length = 0;
        }
      } else {
        // 等待更新
        this.isWait = true;
        return;
      }
    }

    this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 统一处理paddles
    this.paddles.forEach((paddle, i) => {
      paddle.draw();
      // 每帧消费一个输入帧
      const queue = this.playerTable.get(paddle.id).inputFrameQueue;
      const inputState = queue.length
        ? queue.shift().toInputState()
        : InputState.EMPTY;
      this.players[i].lastInputState = inputState;
      paddle.fixedUpdate(delta, inputState);
    });

    this.ball.draw();
    this.ball.fixedUpdate(delta);

    this.drawDebugInfo();
  
    // 记录本地当前帧输入
    const inputFrame = InputFrame.fromInputState(this.frameNo, Input.state);
    this.localInputFrameBuffer.push(inputFrame);
    this.playerTable.get(this.localPlayer.id).inputFrameQueue.push(inputFrame);

    this.sceneManager.current.update(delta);

    // 帧号递增
    this.frameNo++;
  }

  start(players: Player[]) {
    initRandomSeed(10);

    const colors = [
      '#9470db', '#3cb371', '#0011ff', '#ff1100',
      '#00ff11', '#ffff11', '#11ffff', '#ff11ff'
    ];
    this.players = players;
    players.forEach((player, i) => {
      const isLocal = this.apiAccess.localUser.id == player.id;
      const paddle = new Paddle(player.id, colors[i], isLocal, this);
      if (isLocal) {
        this.localPlayer = player;
        this.localPaddle = paddle;
      }
      if (i % 2 == 0) {
        paddle.position.set((this.viewport.width - paddle.width) / 2, 0);
      } else {
        paddle.position.set(
          (this.viewport.width - paddle.width) / 2,
          this.viewport.height - paddle.height);
      }

      paddle.context2d = this.context2d;
      this.playerTable.set(player.id, player);
      this.paddles.push(paddle);
    });

    this.ball = new Ball(this);
    this.ball.position.set(this.viewport.width / 2, this.viewport.height / 2);
    this.ball.context2d = this.context2d;

    this.sceneManager.enter('serve', players[0]);

    this.isPause = false;
  }

  initSocket() {
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

  private uploadBufferToServer() {
    this.socketClient.sendBinary(InputFrame.encode(this.localInputFrameBuffer));
    //console.log('send', JSON.stringify(this.localInputFrameBuffer));
    //console.log('send InputFrame count', localInputFrameBuffer.length);
  }

  private drawDebugInfo() {
    this.context2d.font = '12px monospace';
    this.context2d.fillStyle = '#00ff00';
    this.context2d.fillText('Local FrameNo:   ' + this.frameNo, 16, 20);
    this.context2d.fillText('Paddle Position: '
    + this.localPaddle.position.toString(), 16, 36);
  }
}
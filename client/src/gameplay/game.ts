import FrameInput from './frame-input';
import ServerUpdateFrame from './server-update-frame';
import SocketClient from '../ws';
import APIAccess from '../api/api';
import GameInput, { GameButton } from './game-input';
import Viewport from './viewport';
import Ball from './ball';
import Paddle from './paddle';
import Player from './player';
import { initRandomSeed } from './random';
import { createCanvas } from '../canvas';
import { SceneManager } from './scenes/scene';
import { ServeScene } from './scenes/serve-scene';
import { PlayScene } from './scenes/play-scene';
import ButtonStates from '../input/button-states';
import GameLoop from '../game-loop';

export default class Game {
  apiAccess: APIAccess;
  socketClient: SocketClient;
  
  players: Player[] = [];
  playerTable = new Map<number, Player>();
  localPlayer: Player;

  ball: Ball;

  // 当前（逻辑更新）帧号
  frameNo = 0;
  // 记录服务端发送的更新消息
  serverUpdateQueue: ServerUpdateFrame[] = [];
  lastSendFrameInput = 0;

  isStarted = false;
  isPause = true;
  // 等待服务器更新
  isWait = true;
  // 服务器每帧间隔的时长
  msPerServerUpdate = 3 / 60;
  // 计时器
  serverUpdateTimer = 0;

  gameLoop: GameLoop;
  viewport: Viewport;
  canvas: HTMLCanvasElement;
  context2d: CanvasRenderingContext2D;

  sceneManager: SceneManager;

  constructor(gameLoop: GameLoop,
    apiAccess: APIAccess, socketClient: SocketClient) {
    this.gameLoop = gameLoop;
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

    GameInput.onButton((_, pressed) => {
      if (pressed && !this.isPause && !this.isWait) {
        this.socketClient.sendBinary(FrameInput.encode(this.frameNo, GameInput));
      }
    });
    this.initSocket();
  }

  fixedUpdate(delta: number) {
    this.serverUpdateTimer += delta;
    if (this.serverUpdateTimer >= this.msPerServerUpdate) {
      this.serverUpdateTimer -= this.msPerServerUpdate;

      if (this.serverUpdateQueue.length == 0) {
        this.isWait = true;
      }
    }

    if (this.serverUpdateQueue.length) {
      const serverUpdate = this.serverUpdateQueue.shift();
      this.frameNo = serverUpdate.frameNo;
      // 要消耗完，再覆盖服务器更新
      serverUpdate.playerFrameInputQueue.forEach((inputQueue, playerId) => {
        const player = this.playerTable.get(playerId);
        player.frameInputQueue = inputQueue;
      });
      
      this.consumeAllInputUpdate(delta);

      this.isWait = false;
    }
    
    if (this.isWait) {
      console.log('wait', this.frameNo);
      return;
    }

    // 暂停只是停止输入，让当前帧所有输入执行完成
    if (!this.isPause &&
        // 如果有按钮按下状态总是发送
        // 或者有变化，例如最后一次松开（但之后依然是松开状态即没有变化）也发送
        (GameInput.hasAnyButtonPressed() || GameInput.hasChanged())) {
      // 每帧都发送输入状态
      // 这种方式比监听事件更及时（第二次keydown触发存在延迟），这里延迟最大是帧间隔
      this.socketClient.sendBinary(FrameInput.encode(this.frameNo, GameInput));
    }
  }

  private inputUpdate(delta: number) {
    this.players.forEach((player) => {    
      const frameInput = player.frameInputQueue.shift();
      const buttonStates = frameInput
        ? frameInput.buttonStates
        : ButtonStates.EMPTY as ButtonStates<GameButton>;
      player.lastButtonStates = buttonStates;
      player.paddle.fixedUpdate(delta, buttonStates);
      this.ball.fixedUpdate(delta);
      this.sceneManager.current.update(delta);
    });
  }

  private consumeAllInputUpdate(delta: number) {
    let inputQueueEmptyCnt = 0;
    while (inputQueueEmptyCnt < this.players.length) {
      this.inputUpdate(delta);
      this.players.forEach((player) => {    
        if (player.frameInputQueue.length == 0) {
          inputQueueEmptyCnt++;
        }
      });
    }
  }

  draw() {
    this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.players.forEach((player) => {
      player.paddle.draw();
    });
    this.ball.draw();
    this.drawDebugInfo();
  }

  start(players: Player[]) {
    if (this.isStarted) {
      return;
    }
    initRandomSeed(10);

    const colors = [
      '#9470db', '#3cb371', '#0011ff', '#ff1100',
      '#00ff11', '#ffff11', '#11ffff', '#ff11ff'
    ];
    this.players = players;
    players.forEach((player, i) => {
      const isLocal = this.apiAccess.localUser.id == player.id;
      if (isLocal) {
        this.localPlayer = player;
      }

      // 创建Paddle
      const paddle = new Paddle(player.id, colors[i] ?? '#fff', isLocal, this);
      if (i % 2 == 0) {
        paddle.position.set((this.viewport.width - paddle.width) / 2, 0);
      } else {
        paddle.position.set(
          (this.viewport.width - paddle.width) / 2,
          this.viewport.height - paddle.height);
      }
      paddle.context2d = this.context2d;

      player.paddle = paddle;
      this.playerTable.set(player.id, player);
    });

    // 初始化Ball
    this.ball = new Ball(this);
    this.ball.position.set(this.viewport.width / 2, this.viewport.height / 2);
    this.ball.context2d = this.context2d;

    this.sceneManager.enter('serve', players[0]);

    this.socketClient.send({ type: 'ready-recv-frame' });

    this.isStarted = true;
    this.isPause = false;
    
    this.gameLoop.add(this);
  }

  pause() {
    this.isPause = true;
  }
  
  resume() {
    this.isPause = false;
  }

  private initSocket() {
    this.socketClient.onMessage((msg) => {
      if (msg instanceof Blob) {
        ServerUpdateFrame.decode(msg, this.players, (update) => {
          this.serverUpdateQueue.push(update);
        });
      }
    });
  }

  private drawDebugInfo() {
    this.context2d.font = '14px monospace';
    this.context2d.fillStyle = '#00ff00';
    this.context2d.fillText('Local FrameNo: ' + this.frameNo, 16, 20);
    this.context2d.fillText('Ball Position: '
      + this.ball.position.toString(), 16, 40);
    this.players.forEach((player, i ) => {
      this.context2d.fillText('Paddle#' + (i + 1) + ' Position: '
        + player.paddle.position.toString(), 16, 60 + i * 20);
    });
  }
}
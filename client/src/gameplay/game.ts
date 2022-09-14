import ServerUpdateFrame from './serverUpdateFrame';
import SocketClient from '../ws';
import APIAccess from '../api/api';
import GameInput from './gameInput';
import PlayerInput from '../shared/game/input/playerInput';
import GameButton from '../shared/game/input/gameButton';
import GameLoop from '../gameLoop';
import GameStateSystem from '../shared/game/gameStateSystem';
import Ball from './ball';
import Paddle from './paddle';
import Player from './player';
import Scoreboard from './scoreboard';
import { createCanvas } from '../canvas';
import { SceneManager } from './scenes/scene';
import { ServeScene } from './scenes/serveScene';
import { PlayScene } from './scenes/playScene';
import { drawDebugInfo } from './debugLayer';
import { sounds } from '../sound';

export default class Game {
  apiAccess: APIAccess;
  socketClient: SocketClient;
  
  players: Player[] = [];
  playerTable = new Map<number, Player>();
  localPlayer: Player;

  ball: Ball;

  scoreboard = new Scoreboard();

  gameStateSystem = new GameStateSystem(false);
  
  pendingInputs: PlayerInput[] = [];
  // 逻辑更新帧率
  updateFPS = 0;

  serverUpdateFrameNo = 0;
  lastRecvServerUpdateTime = 0;
  serverUpdateDelay = 0;

  // 最后输入序列号
  lastSn = 0;

  isStarted = false;
  isPause = true;

  gameLoop: GameLoop;
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
    
    this.gameStateSystem.onPaddleHit = () => {
      sounds['paddle_hit'].play();
    };
    this.gameStateSystem.onWallHit = () => {
      sounds['wall_hit'].play();
    };
    this.gameStateSystem.onScore = () => {
      sounds['score'].play();
    };

    const canvas = createCanvas({
      id: 'canvas1',
      width: this.gameStateSystem.viewport.width,
      height: this.gameStateSystem.viewport.height,
      scalePixel: true,
    });
    this.canvas = canvas;
    this.context2d = canvas.getContext('2d');
    this.context2d.font = '14px pixel';
    this.context2d.fillStyle = '#fafafa';
    document.body.appendChild(canvas);

    //this.socketClient.enableThrottling = true;
    this.socketClient.onMessage((msg) => {
      if (msg instanceof Blob) {
        ServerUpdateFrame.decode(msg, this.players, (update) => {
          //console.log(update.frameNo, update.lastSn, update.inputs.length);
          this.onServerUpdate(update);
        });
      }
    });
  }

  draw(delta: number) {
    const { states, gameState } = this.gameStateSystem;

    this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.scoreboard.gameStates = states;
    this.scoreboard.draw();

    this.players.forEach((player, i) => {
      player.paddle.updateState(states.paddleStates[i]);
      player.paddle.draw();
    });
    this.ball.updateState(states.ballState);
    this.ball.draw();

    if (gameState != 'play') {
      this.context2d.font = `${26}px pixel`;
      this.context2d.textAlign = 'center';
      const baseX = this.gameStateSystem.viewport.width / 2;
      const baseY = this.gameStateSystem.viewport.height / 2 - 80;
      if (gameState == 'serve') {
        this.context2d.fillText(
          `Player ${this.gameStateSystem.servingPlayerNo} 's serve`, baseX, baseY);
        // todo: 本地玩家不提示
        this.context2d.fillText('Press Space to serve!', baseX, baseY + 40);
      } else if (gameState == 'pause') {
        this.context2d.fillText(`Paused`, baseX, baseY);
        this.context2d.fillText('Press Space to resume!', baseX, baseY + 40);
      } else if (gameState == 'start') {
        this.context2d.fillText('Welcome to Pong!', baseX, baseY)
        this.context2d.fillText('Press Space to begin!', baseX, baseY + 40);
      }
    }
    
    drawDebugInfo(this);
  }

  fixedUpdate(delta: number) {
    if (this.isPause) return;

    // 如果有按钮按下状态总是发送
    // 或者有变化，例如最后一次松开（但之后依然是松开状态即没有变化）也发送
    if (GameInput.hasAnyButtonPressed() || GameInput.hasChanged()) {
      this.sendPlayerInput(delta);
    }
  }

  private sendPlayerInput(delta: number) {
    const input = new PlayerInput(this.localPlayer.id, ++this.lastSn);
    input.buttonStates = GameInput.clone();
    if (GameInput.isPressed(GameButton.Ok)) {
      // 一般功能键只上传服务端但本地不预执行
      GameInput.reset();
    } else {
      // 预执行控制玩家的输入
      this.pendingInputs.push(input);
      this.gameStateSystem.applyInput(input);
    }
    this.socketClient.sendBinary(input.encode());
    //console.log('send', JSON.stringify(input));
  }

  private onServerUpdate(update: ServerUpdateFrame) {
    this.serverUpdateFrameNo = update.frameNo;
    const nowTime = Date.now();
    // 距离上次更新过去多久
    const elapsed = this.lastRecvServerUpdateTime
      ? nowTime - this.lastRecvServerUpdateTime
      : 1000 / this.updateFPS;
    this.lastRecvServerUpdateTime = nowTime;
    this.serverUpdateDelay = Math.max(0, elapsed - 1000 / this.updateFPS);

    // 恢复到上次保存的权威状态
    this.gameStateSystem.restore();
    // 开始权威输入
    this.gameStateSystem.applyInputs(update.inputs);
    this.gameStateSystem.update(1 / this.updateFPS);
    // 结束权威输入
    // 保存当前权威状态
    this.gameStateSystem.save();
    let removeLen = 0;
    while (removeLen < this.pendingInputs.length &&
      this.pendingInputs[removeLen].sn <= update.lastSn) {
      removeLen++;
    }
    this.pendingInputs.splice(0, removeLen);
    this.gameStateSystem.applyInputs(this.pendingInputs);

    if (this.gameStateSystem.gameState == 'serve') {
      this.ball.setState(this.gameStateSystem.states.ballState);
    }
  }

  start(players: Player[]) {
    if (this.isStarted) {
      return;
    }

    this.gameStateSystem.initPlayers(players.map((p) => p.id));

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
      const paddle = new Paddle(this, player.id, colors[i] ?? '#fff', isLocal);
      paddle.setState(this.gameStateSystem.states.paddleStates[i]);
      paddle.context2d = this.context2d;
      player.paddle = paddle;
      this.playerTable.set(player.id, player);
    });

    // 初始化Ball
    this.ball = new Ball(this);
    this.ball.setState(this.gameStateSystem.states.ballState);
    this.ball.context2d = this.context2d;

    this.scoreboard.viewport = this.gameStateSystem.viewport;
    this.scoreboard.context2d = this.context2d;

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
}

import Player from "./player";
import Game from "./game";
import MainLoop, { FixedUpdatable } from "./main-loop";
import GameStateSystem from "../shared/game/gameStateSystem";
import PlayerInput from "../shared/game/input/playerInput";
import { GameStateSystemInput, GameStateSystemInputTypeFlag } from "../shared/game/input";

export default class GameLoop implements FixedUpdatable {
  mainLoop: MainLoop
  fps = 30;
  frameNo = 0;
  sPerFrame = 1 / this.fps;
  players: Player[] = [];
  gameStateSystem!: GameStateSystem;
  inputBuffer: GameStateSystemInput[] = [];
  isPause = true;

  constructor(game: Game, mainLoop: MainLoop) {
    this.mainLoop = mainLoop;
    if (game) {
      this.players = game.room.players;

      this.gameStateSystem = new GameStateSystem(true);
      this.gameStateSystem.initPlayers(this.players.map((p) => p.id));
    }
  }

  fixedUpdate(delta: number): void {
    if (this.isPause) {
      return;
    }
    const { inputBuffer: inputs } = this;
    this.inputBuffer = [];

    this.gameStateSystem.applyInputs(inputs, delta);
    this.gameStateSystem.update(delta);

    this.sync(inputs);

    this.frameNo++;
  }

  sync(inputs: GameStateSystemInput[]) {
    // 更新帧的字节布局：
    // <更新帧号(3B)><玩家最后输入序列号(4B)><n个输入数据组>
    // <输入数据> = <输入类型(1B)><输入内容>
    let totalInputBytes = 0;
    inputs.forEach((input) => {
      totalInputBytes++; // 加上类型1B
      if (input instanceof PlayerInput) {
        totalInputBytes += 2;
      }
    });
    const updateFrame = new ArrayBuffer(7 + totalInputBytes);
    const dv = new DataView(updateFrame);
    dv.setUint32(0, this.frameNo, true);
    let offset = 7;
    inputs.forEach((input) => {
      if (input instanceof PlayerInput) {
        dv.setUint8(offset++, GameStateSystemInputTypeFlag.PlayerInput);
        dv.setUint8(offset++,
          this.players.findIndex((p) => p.id == input.playerId));
        dv.setUint8(offset++, input.encodeButtonStates());
      }
    });

    // 遍历房间内所有玩家
    this.players.forEach((player) => {
      // 写玩家的最后序列号
      dv.setUint32(3, player.lastSn, true);
      player.send(Buffer.from(updateFrame));
    });
  }

  handlePlayerInput(data: Buffer, player: Player) {
    for (let b = 0, cnt = data.byteLength; b < cnt; b += 4) {
      const val = data.readUint32LE(b);
      const input = PlayerInput.decode(player.id, val);
      player.lastSn = input.sn;
      this.inputBuffer.push(input);
    }
  }
}
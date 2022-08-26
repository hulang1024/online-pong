import { InputFrame, ServerUpdateFrame } from './frame.js';
import Input, { InputKeys } from './input.js';
import Player from './player.js';
import { parseSearchParams } from './utils.js';
import SocketClient from './ws.js';

window.addEventListener('load', () => {
  const loadingEl = document.getElementById('loading');
  loadingEl.style.display = 'none';

  Input.addKeyListener(onKeyPressed, onKeyReleased);

  let lastTime = 0;
  let deltaTime;
  function animate(nowTime) {
    deltaTime = (nowTime - lastTime) * 0.001;
    lastTime = nowTime;
    update(0.0166);

    requestAnimationFrame(animate); 
  }

  requestAnimationFrame((nowTime) => {
    lastTime = nowTime;
    requestAnimationFrame(animate);
  });

  const viewport = {
    width: 500,
    height: 500
  };

  const canvas = document.getElementById('canvas1');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const context2d = canvas.getContext('2d');
  context2d.font = '14px sans-serif';

  const uid = parseSearchParams().uid;

  const localPlayer = new Player(viewport, true);
  localPlayer.id = uid;
  const players = [localPlayer];
  const otherUids = uid == 1 ? [2] : [1];
  for (let i = 0; i < 1; i++) {
    const player = new Player(viewport);
    player.id = otherUids[i];
    players.push(player);
  }

  players.sort((a, b) => a.id - b.id);

    // 每个玩家的InputFrame的缓冲区
  let playerToInputFrameBuffer = {};

  players.forEach((player) => {
    playerToInputFrameBuffer[player.id] = [];
    player.context2d = context2d;
  });

  let frameNo = 0;
  let keyFrameNo = 0;
  let isStarted = false;
  let isPause = true;
  let isWait = true;
  // 记录本地上一个关键帧到一个关键帧之间的帧输入，发送完后可以清空
  let localInputFrameBuffer = [];
  // 记录服务端发送的更新消息
  let lastServerUpdate = null;
  const EMPTY_INPUTS = [];

  function update(delta) {
    if (isPause) {
      return;
    } else if (isWait) {
      console.log('wait', frameNo);
      return;
    }

    // console.log('frame', frameNo);

    // 已到关键帧
    if (frameNo == keyFrameNo) {
      //console.log(frameNo, keyFrameNo, lastServerUpdate.frameNo);
      // 关键帧时是否已经有更新数据？
      if (lastServerUpdate.frameNo >= frameNo) {
        // 更新下个关键帧号
        keyFrameNo = lastServerUpdate.nextKeyFrameNo;
        //console.log('next key frame', keyFrameNo);
        // 更新输入
        for (const playerId in lastServerUpdate.playerInputFrames) {
          playerToInputFrameBuffer[playerId] = lastServerUpdate.playerInputFrames[playerId];
        }
        // 排除了起始帧时，以及特殊情况可能为空（存疑）
        if (localInputFrameBuffer.length) {
          uploadBufferToServer();
          localInputFrameBuffer.length = 0;
        }
      } else {
        // 等待更新
        isWait = true;
        return;
      }
    }

    context2d.clearRect(0, 0, canvas.width, canvas.height);
    context2d.fillText('frame=' + frameNo, viewport.width - 140, 60);

    // 统一处理players
    players.forEach((player, i) => {
      player.draw();
      context2d.fillText(player.position.toString(), viewport.width - 140, 20 + 20 * i);
      // 每帧消费一个输入帧
      const buffer = playerToInputFrameBuffer[player.id];
      player.update(delta, buffer.length ? buffer.shift().inputs : EMPTY_INPUTS);
    });

    // 记录本地当前帧输入
    const inputFrame = new InputFrame();
    inputFrame.frameNo = frameNo;
    inputFrame.inputs[0] = Input.isPressed(InputKeys.Up);
    inputFrame.inputs[1] = Input.isPressed(InputKeys.Right);
    inputFrame.inputs[2] = Input.isPressed(InputKeys.Down);
    inputFrame.inputs[3] = Input.isPressed(InputKeys.Left);
    localInputFrameBuffer.push(inputFrame);
    playerToInputFrameBuffer[localPlayer.id].push(inputFrame);

    // 帧号递增
    frameNo++;
  }

  const socketClient = new SocketClient(uid);
  socketClient.onMessage((data) => {
    if (data instanceof Blob) {
      ServerUpdateFrame.decode(data, players, (frame) => {
        lastServerUpdate = frame;
        //console.log('lastServerUpdate.frameNo', lastServerUpdate.frameNo);
        //console.log('receive', JSON.stringify(frame));
        // 置为不等待
        isWait = false;
      });
    } else if (typeof data == 'string') {
      const msg = JSON.parse(data);
      if (msg.type == 'start') {
        isPause = false;
      }
    }
  });

  
  function uploadBufferToServer() {
    socketClient.sendBinary(InputFrame.encodeBatch(localInputFrameBuffer));
    //console.log('send', JSON.stringify(localInputFrameBuffer));
    //console.log('send InputFrame count', localInputFrameBuffer.length);
  }

  function onKeyPressed(key) {
    if (key == InputKeys.Enter) {
      isPause = !isPause;
      if (!isStarted) {
        isStarted = true;
        socketClient.send({ type: 'start' });
      }
    }
  }

  function onKeyReleased() {

  }
});
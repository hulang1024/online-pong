export class ServerUpdateFrame {
  constructor(players) {
    this.frameNo = 0;
    this.nextKeyFrameNo = 0;
    this.playerInputFrames = {};
  }
}

const reader = new FileReader();
ServerUpdateFrame.decode = function(data, players, complete) {
  reader.onload = (ev) => {
    if (ev.target.readyState != FileReader.DONE) {
      return;
    }

    const playerCount = players.length;
    const serverUpdateFrame = new ServerUpdateFrame();
    const dv = new DataView(ev.target.result);
    // 更新帧的字节布局：
    // <当前帧号(3B)><下个关键帧号(3B)>
    // <玩家1输入帧数量><玩家2输入帧数量>...<玩家n输入帧数量(1B)>
    // <玩家1输入帧对象组><玩家2输入对象帧组>...<玩家n输入对象帧组(输入帧数量 * 4B)>
    // 注：输入帧对象：<输入帧帧号(3B)><输入信息(1B)>
    // 玩家数据已按某规则排序存放，客户端应与服务端一致，玩家在客户端的索引应该与服务端的索引相同

    // 读更新帧的当前帧号和下个关键帧号（6字节）
    serverUpdateFrame.frameNo = dv.getUint32(0, true) & 0xFFFFFF;
    serverUpdateFrame.nextKeyFrameNo = dv.getUint32(3, true) & 0xFFFFFF;
    // 对所有玩家
    let c = 0;
    for (let p = 0; p < playerCount; p++) {
      if (!players[p].isLocalPlayer) {
        // 读输入帧的数量（本地玩家的未传输，跳过）
        const frameCount =  dv.getUint8(6 + c++);
        const inputFrames = [];
        for (let f = 0; f < frameCount; f++) {
          // 读输入帧
          const val = dv.getUint32((6 + playerCount - 1) + f * 4, true);
          const frame = new InputFrame();
          // 读帧号（低位3字节）
          frame.frameNo = val & 0xFFFFFF;
          // 读输入（高位1字节）
          for (let b = 0; b < 4; b++) {
            frame.inputs.push(val & (1 << (b + 24)));
          }
          inputFrames.push(frame);
        }
        serverUpdateFrame.playerInputFrames[players[p].id] = inputFrames;
      }
    }
    complete(serverUpdateFrame);
  };
  reader.readAsArrayBuffer(data);
};

export class InputFrame {
  constructor() {
    this.frameNo = 0;
    this.inputs = [];
  }
}

InputFrame.encodeBatch = (frames) => {
  const ret = new Uint32Array(frames.length);
  let frame, v;
  for (let fi = 0; fi < frames.length; fi++) {
    frame = frames[fi];
    v = frame.frameNo;
    for (let i = 0; i < frame.inputs.length; i++) {
      if (frame.inputs[i]) {
        v |= 1 << (i + 24);
      }
    }
    ret[fi] = v;
  }
  return ret;
};

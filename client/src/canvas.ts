interface CanvasCreateOptions {
  width: number;
  height: number;
  id: number | string;
  scalePixel?: boolean;
}

export function createCanvas(options: CanvasCreateOptions): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  if (options.id) {
    canvas.id = options.id + '';
  }
  const ctx = canvas.getContext('2d') as any;
  const pixelRatio = (options.scalePixel ?? true) ? (() => {
    const backingStore = ctx.backingStorePixelRatio ||
    ctx.webkitBackingStorePixelRatio ||
    ctx.mozBackingStorePixelRatio ||
    ctx.msBackingStorePixelRatio ||
    ctx.oBackingStorePixelRatio ||
    ctx.backingStorePixelRatio || 1;
    return (window.devicePixelRatio || 1) / backingStore;
  })() : 1;
  canvas.style.width = options.width + 'px';
  canvas.style.height = options.height + 'px';
  canvas.width = options.width * pixelRatio;
  canvas.height = options.height * pixelRatio;
  if (pixelRatio != 1) {
    ctx.scale(pixelRatio, pixelRatio);
  }
  return canvas;
}
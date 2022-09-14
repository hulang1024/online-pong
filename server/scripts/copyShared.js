const fs = require('fs');
const dst = '../client/src/shared';
fs.cp('src/shared', dst, { recursive: true }, (err) => {
  if (err) {
    console.error(err);
  }
  fs.chmodSync(dst, 0444);
});
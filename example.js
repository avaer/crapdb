const crapdb = require('.');

const buffer = new ArrayBuffer(10 * 1024 * 1024);
let fileSize = 0;
let file = new Uint8Array(buffer, 0, fileSize);

let c = crapdb();
c.set('lol', Uint8Array.from([1, 2, 3]));
c.set('zol', Uint8Array.from([4, 5]));
console.log('get 1', Array.from(c.get('lol')));
console.log('get 2', Array.from(c.get('zol')));

c.save((byteOffset, data) => {
  const file2 = new Uint8Array(buffer, byteOffset, data.length);
  file2.set(data);
  fileSize = Math.max(fileSize, byteOffset + data.byteLength);
});
file = new Uint8Array(buffer, 0, fileSize);
console.log('got new file size', fileSize);

c = crapdb();
c.load(file);
console.log('get 3', Array.from(c.get('lol')));
console.log('get 4', Array.from(c.get('zol')));

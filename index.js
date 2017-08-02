const murmur = require('murmurhash');

const CHUNK_SIZE = 4 * 1024;
const CHUNK_HEADERS_SLOTS = 2;
const CHUNK_HEADER_SIZE = CHUNK_HEADERS_SLOTS * 4;

class Crapdb {
  constructor() {
    this.map = {};
  }

  get(k) {
    return this.map[murmur(k)];
  }

  set(k, v) {
    if (v instanceof Uint8Array && v.length < (CHUNK_SIZE - CHUNK_HEADER_SIZE)) {
      this.map[murmur(k)] = v;
      return true;
    } else {
      return false;
    }
  }

  load(buffer) {
    const map = {};
    for (let byteOffset = 0; byteOffset < buffer.length;) {
      const headerBuffer = new Uint32Array(buffer, byteOffset, CHUNK_HEADERS_SLOTS);
      const n = headerBuffer[0];
      const size = headerBuffer[1];
      byteOffset += CHUNK_HEADER_SIZE;

      const v = new Uint8Array(buffer, byteOffset, size);
      byteOffset += CHUNK_SIZE - CHUNK_HEADER_SIZE;

      map[n] = v;
    }
    this.map = map;
  }

  save(fn) {
    let byteOffset = 0;

    for (const n in this.map) {
      const v = this.map[n];
      const headerBuffer = Uint32Array.from([n, v.length]);
      fn(new Uint8Array(headerBuffer.buffer, headerBuffer.byteOffset, headerBuffer.byteLength));
      byteOffset += headerBuffer.byteLength;

      fn(v);
      byteOffset += (CHUNK_SIZE - headerBuffer.byteLength);
    }
  }
}

const crapdb = () => new Crapdb();
module.exports = crapdb;

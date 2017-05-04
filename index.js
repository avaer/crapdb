const path = require('path');
const fs = require('fs');

const mkdirp = require('mkdirp');

class Crapdb {
  constructor({path = 'data.json'} = {}) {
    this.path = path;

    this._data = undefined;

    this.set = _debounce(this.set.bind(this));
  }

  get() {
    return this._data;
  }

  set(data) {
    this._data = data;
  }

  load(cb) {
    fs.readFile(this.path, 'utf8', (err, s) => {
      if (!err) {
        const data = _jsonParse(s);

        if (data !== undefined) {
          this._data = data;

          cb();
        } else {
          const err = new Error('failed to parse existing database json');

          cb(err);
        }
      } else if (err.code === 'ENOENT') {
        cb();
      } else {
        cb(err);
      }
    });
  }

  save(next) {
    mkdirp(path.basename(this.path), err => {
      if (!err) {
        fs.writeFile(this.path, JSON.stringify(this._data, null, 2), err => {
          if (err) {
            console.warn(err);
          }

          next();
        });
      } else {
        console.warn(err);

        next();
      }
    });
  }
}

const _jsonParse = s => {
  let error = null;
  let result;
  try {
    result = JSON.parse(s);
  } catch (err) {
    error = err;
  }
  if (!error) {
    return result;
  } else {
    return undefined;
  }
};
const _debounce = fn => {
  let running = false;
  let queued = false;

  const _go = () => {
    if (!running) {
      running = true;

      fn(() => {
        running = false;

        if (queued) {
          queued = false;

          _go();
        }
      });
    } else {
      queued = true;
    }
  };
  return _go;
};

module.exports = Crapdb;

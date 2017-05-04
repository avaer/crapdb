const path = require('path');
const fs = require('fs');

const mkdirp = require('mkdirp');

class Crapdb {
  constructor({path = 'data.json'} = {}) {
    this.path = path;

    this._data = {};

    this.set = _debounce(this.set.bind(this));
  }

  get() {
    return this._data;
  }

  set(data) {
    this._data = data;
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

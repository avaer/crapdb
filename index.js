const path = require('path');
const fs = require('fs');

const mkdirp = require('mkdirp');

class Crapdb {
  constructor({path = 'data.json'} = {}) {
    this.path = path;

    this._data = undefined;

    this.save = _debounce(this.save.bind(this));
  }

  get() {
    return this._data;
  }

  set(data) {
    this._data = data;
  }

  load(cb) {
    const {path: p} = this;

    fs.readFile(p, 'utf8', (err, s) => {
      if (!err) {
        const data = _jsonParse(s);

        if (data !== undefined) {
          this._data = data;

          cb();
        } else {
          const err = new Error('failed to parse existing database json: ' + JSON.stringify(p));

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
    const {path: p, _data: data} = this;

    mkdirp(path.dirname(p), err => {
      if (!err) {
        if (data !== undefined) {
          fs.writeFile(p, JSON.stringify(data, null, 2), err => {
            if (err) {
              console.warn(err);
            }

            next();
          });
        } else {
          fs.unlink(p, err => {
            if (err) {
              console.warn(err);
            }

            next();
          });
        }
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

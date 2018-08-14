const fs = window.require("fs");

function asPromise(func) {
  return function asPromised(...args) {
    return new Promise((resolve, reject) => {
      try {
        func(...args, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  };
}

export const readdir = asPromise(fs.readdir);
export const readFile = asPromise(fs.readFile);
export const writeFile = asPromise(fs.writeFile);
export const unlink = asPromise(fs.unlink);
export const rename = asPromise(fs.rename);
export const access = asPromise(fs.access);

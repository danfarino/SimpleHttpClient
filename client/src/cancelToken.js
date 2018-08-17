export default function createCancelToken() {
  let isCancelled = false;
  let subscribers = [];

  return {
    subscribe(callback) {
      if (isCancelled) {
        callback();
      } else {
        subscribers.push(callback);
      }
    },

    cancel() {
      if (!isCancelled) {
        isCancelled = true;
        for (const callback of subscribers) {
          callback();
        }
        subscribers = null;
      }
    }
  };
}

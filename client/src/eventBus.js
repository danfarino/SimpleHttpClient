import EventBus from "eventbusjs";

export function subscribe(type, callback) {
  EventBus.addEventListener(type, callback);
}

export function unsubscribe(type, callback) {
  EventBus.removeEventListener(type, callback);
}

export function dispatch(type, ...args) {
  EventBus.dispatch(type, null, ...args);
}

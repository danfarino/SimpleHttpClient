import { createStore, applyMiddleware } from "redux";
import produce from "immer";
import { composeWithDevTools } from "redux-devtools-extension";

const initialState = {
  currentRequest: null,
  currentResponse: null,
  inProgress: false,
  prettyPrintJsonBody: true,
  savedRequests: []
};

const immerMiddleware = store => next => action => {
  if (typeof action === "function") {
    const callback = action;
    action = {
      type: "SET_STATE",
      updater: function(state) {
        return produce(state, callback);
      }
    };
  }

  return next(action);
};

function reducer(state, action) {
  if (!state) {
    return initialState;
  }

  if (action.type === "SET_STATE") {
    return action.updater(state);
  } else {
    throw Error(`Invalid action ${action.type}`);
  }
}

export default createStore(reducer, composeWithDevTools(applyMiddleware(immerMiddleware)));

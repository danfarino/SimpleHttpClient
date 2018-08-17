import store from "./store";
import nodeHttp from "./nodeHttp";
import createCancelToken from "./cancelToken";

let currentRequestInfo = null;

export function cancelRequest() {
  if (currentRequestInfo) {
    clearInterval(currentRequestInfo.interval);
    currentRequestInfo.cancelToken.cancel();
    currentRequestInfo = null;
    store.dispatch(draft => {
      draft.inProgress = false;
    });
  }
}

export async function executeRequest() {
  cancelRequest();

  let thisRequestInfo = {
    cancelToken: createCancelToken()
  };

  currentRequestInfo = thisRequestInfo;

  store.dispatch(draft => {
    draft.inProgress = 0;
    draft.error = null;
    draft.currentResponse = null;
  });

  thisRequestInfo.interval = setInterval(
    () =>
      store.dispatch(draft => {
        draft.inProgress += 0.1;
      }),
    100
  );

  const request = {
    ...store.getState().currentRequest
  };

  if (request.method !== "PUT" && request.method !== "POST") {
    delete request.body;
  }

  let error = null;
  let response = null;

  try {
    response = await nodeHttp(request, currentRequestInfo.cancelToken);
  } catch (e) {
    error = String(e.message || e);
  }

  if (thisRequestInfo !== currentRequestInfo) {
    return;
  }

  cancelRequest();

  if (response) {
    store.dispatch(draft => {
      draft.currentResponse = response;
      draft.inProgress = false;
    });
  } else {
    store.dispatch(draft => {
      draft.error = error;
      draft.inProgress = false;
    });
  }
}

import store from "./store";
import nodeHttp from "./nodeHttp";

let currentRequestInfo = null;

export function cancelRequest() {
  if (currentRequestInfo) {
    console.log(`clearInterval ${currentRequestInfo.interval}`);
    clearInterval(currentRequestInfo.interval);
    currentRequestInfo = null;
  }
}

export async function executeRequest() {
  cancelRequest();

  let thisRequestInfo = {};

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
    response = await nodeHttp(request);
  } catch (e) {
    error = e;
  }

  if (thisRequestInfo !== currentRequestInfo) {
    return;
  }

  cancelRequest();

  if (response && response.success) {
    store.dispatch(draft => {
      draft.currentResponse = response.data;
      draft.inProgress = false;
    });
  } else {
    store.dispatch(draft => {
      draft.error = error ? String(error) : response.data;
      draft.inProgress = false;
    });
  }
}

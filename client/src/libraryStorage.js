import store from "./store";
import { readdir, readFile, writeFile, unlink, rename, access } from "./native";
import path from "path";

export function setDirectory(directory) {
  window.localStorage.directory = directory;
  store.dispatch(draft => {
    draft.directory = directory;
  });
  loadSavedRequestsIntoStore();
}

function pathnameForRequest(requestName) {
  return path.join(store.getState().directory, encodeURIComponent(requestName)) + ".req.json";
}

function requestNameFromFilename(filename) {
  return decodeURIComponent(filename.replace(/\.req\.json$/, ""));
}

export async function loadSavedRequestsIntoStore() {
  let savedRequests = [];
  try {
    const directory = store.getState().directory;

    const filenames = await readdir(directory);
    savedRequests = await Promise.all(
      filenames.filter(filename => /\.req\.json$/.test(filename)).map(async filename => {
        const pathname = path.join(directory, filename);
        console.log("readFile", pathname);
        const contents = await readFile(pathname);
        const request = JSON.parse(contents);
        request.name = requestNameFromFilename(filename);
        return request;
      })
    );
  } catch (e) {
    console.error("error loading requests", e);
  }

  console.log("savedRequests", savedRequests);

  store.dispatch(draft => {
    draft.savedRequests = savedRequests;
  });
}

export async function doesNameExist(name) {
  try {
    const path = pathnameForRequest(name);
    console.log("doesNameExist", path);
    await access(path);
    return true;
  } catch (e) {
    return false;
  }
}

export async function save(request) {
  if (!request.name) {
    throw Error("cannot save a request without a name");
  }

  const objectToSave = { ...request };
  delete objectToSave.name;

  await writeFile(pathnameForRequest(request.name), JSON.stringify(objectToSave, null, 3));

  // update Redux store
  store.dispatch(draft => {
    const index = draft.savedRequests.findIndex(o => o.name === request.name);
    if (index >= 0) {
      draft.savedRequests[index] = request;
    } else {
      draft.savedRequests.push(request);
    }
  });
}

export async function deleteRequest(name) {
  await unlink(pathnameForRequest(name));

  // update Redux store
  store.dispatch(draft => {
    const index = draft.savedRequests.findIndex(o => o.name === name);
    draft.savedRequests.splice(index, 1);
  });
}

export async function renameRequest(request, newName) {
  if (await doesNameExist(newName)) {
    throw Error("cannot rename. already exixts.");
  }

  const oldPathname = pathnameForRequest(request.name);
  const newPathname = pathnameForRequest(newName);
  await rename(oldPathname, newPathname);

  // update Redux store
  store.dispatch(draft => {
    const existingRequest = draft.savedRequests.find(o => o.name === request.name);
    existingRequest.name = newName;
  });
}

// Set directory on startup:
setDirectory(window.localStorage.directory || "c:\\");

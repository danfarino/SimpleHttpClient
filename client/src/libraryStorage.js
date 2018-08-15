import store from "./store";
import { readdir, readFile, writeFile, unlink, rename, access } from "./native";
import path from "path";
import * as eventBus from "./eventBus";

export function setDirectory(directory) {
  if (directory !== null) {
    window.localStorage.directory = directory;
  }

  store.dispatch(draft => {
    draft.directory = directory;
  });
}

function pathnameForRequest(requestName) {
  return path.join(store.getState().directory, encodeURIComponent(requestName)) + ".req.json";
}

function requestNameFromFilename(filename) {
  return decodeURIComponent(filename.replace(/\.req\.json$/, ""));
}

export async function loadRequest(name) {
  const pathname = pathnameForRequest(name);
  const contents = await readFile(pathname);
  const request = JSON.parse(contents);
  request.name = name;
  return request;
}

export async function getRequestsInDirectory() {
  const directory = store.getState().directory;

  const filenames = await readdir(directory);
  return filenames.filter(filename => /\.req\.json$/.test(filename)).map(requestNameFromFilename);
}

export async function doesNameExist(name) {
  try {
    const path = pathnameForRequest(name);
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

  eventBus.dispatch("RELOAD_DIRECTORY");
}

export async function deleteRequest(name) {
  await unlink(pathnameForRequest(name));

  eventBus.dispatch("RELOAD_DIRECTORY");
}

export async function renameRequest(name, newName) {
  if (await doesNameExist(newName)) {
    throw Error("Cannot rename. A file with that name already exixts.");
  }

  const oldPathname = pathnameForRequest(name);
  const newPathname = pathnameForRequest(newName);
  await rename(oldPathname, newPathname);

  eventBus.dispatch("RELOAD_DIRECTORY");
}

// Set directory on startup:
setDirectory(window.localStorage.directory || null);

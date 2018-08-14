import smalltalk from "smalltalk";

function wrap(func) {
  return async function smalltalkWrapped(...args) {
    try {
      return await func(...args);
    } catch (e) {
      return null;
    }
  };
}

export const prompt = wrap(smalltalk.prompt);
export const alert = wrap(smalltalk.alert);

export async function confirm(...args) {
  try {
    await smalltalk.confirm(...args);
    return true;
  } catch (e) {
    return false;
  }
}

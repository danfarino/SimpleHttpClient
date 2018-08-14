export default function getInitialRequest() {
  const saved = sessionStorage.request;
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }

  return {
    url: "",
    method: "GET",
    headers: [], // { name: '', value: '' }
    body: ""
  };
}

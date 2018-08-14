import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Provider } from "react-redux";
import { ThemeProvider } from "react-jss";
import store from "./store";
import getInitialRequest from "./initialRequest";
import theme from "./theme";

store.dispatch(draft => {
  draft.currentRequest = getInitialRequest();
});

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <Provider store={store}>
      <App />
    </Provider>
  </ThemeProvider>,
  document.getElementById("root")
);

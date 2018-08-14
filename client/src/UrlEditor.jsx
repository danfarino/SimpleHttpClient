import React from "react";
import injectStyles from "react-jss";
import { connect } from "react-redux";
import produce from "immer";
import { executeRequest } from "./executeRequest";

const styles = theme => ({
  root: {
    display: "flex",
    "& input": {
      flex: 1,
      marginLeft: "-1px"
    },
    "& button": {
      marginRight: "0.3em",
      marginBottom: "1px"
    },
    padding: theme.cardSpacing,
    paddingBottom: 0,
    "& input, & select": {
      font: theme.inputFont,
      border: "1px solid " + theme.inputBorderColor,
      padding: "0.3em",
      "&:focus": {
        position: "relative",
        zIndex: 1000
      }
    }
  }
});

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"];

class UrlEditor extends React.Component {
  modifyRequest(immerCallback) {
    const currentRequest = produce(this.props.currentRequest, immerCallback);
    sessionStorage.request = JSON.stringify(currentRequest);
    this.props.dispatch(draft => {
      draft.currentRequest = currentRequest;
    });
  }

  setMethod = e => {
    this.modifyRequest(draft => {
      draft.method = e.target.value;
    });
  };

  setUrl = e => {
    this.modifyRequest(draft => {
      draft.url = e.target.value;
    });
  };

  render() {
    const { classes, currentRequest } = this.props;
    const { method, url } = currentRequest;

    return (
      <div className={classes.root}>
        <button onClick={executeRequest}>Execute</button>
        <select value={method} onChange={this.setMethod}>
          {HTTP_METHODS.map(method => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
        <input
          className={classes.url}
          type="text"
          spellCheck={false}
          placeholder="URL"
          value={url}
          onChange={this.setUrl}
          onKeyPress={e => e.which === 13 && executeRequest()}
          autoFocus
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    currentRequest: state.currentRequest
  };
}

export default injectStyles(styles)(connect(mapStateToProps)(UrlEditor));

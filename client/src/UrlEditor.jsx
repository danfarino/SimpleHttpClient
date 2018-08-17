import React from "react";
import injectStyles from "react-jss";
import { connect } from "react-redux";
import produce from "immer";
import { executeRequest, cancelRequest } from "./executeRequest";

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
  },
  executeCancelButton: {
    width: "6em"
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
    const { classes, currentRequest, inProgress } = this.props;
    const { method, url } = currentRequest;

    const disableAllControls = inProgress !== false;
    const disableExecute = disableAllControls || !/^https?:\/\/.+/.test(url);

    return (
      <div className={classes.root}>
        {disableAllControls ? (
          <button className={classes.executeCancelButton} onClick={cancelRequest}>
            Cancel
          </button>
        ) : (
          <button
            className={classes.executeCancelButton}
            disabled={disableExecute}
            onClick={executeRequest}
          >
            Execute
          </button>
        )}
        <select value={method} disabled={disableAllControls} onChange={this.setMethod}>
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
          disabled={disableAllControls}
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
    currentRequest: state.currentRequest,
    inProgress: state.inProgress
  };
}

export default injectStyles(styles)(connect(mapStateToProps)(UrlEditor));

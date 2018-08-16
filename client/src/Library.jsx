import React from "react";
import injectStyles from "react-jss";
import { connect } from "react-redux";
import {
  deleteRequest,
  renameRequest,
  setDirectory,
  loadRequest,
  getRequestsInDirectory
} from "./libraryStorage";
import { executeRequest } from "./executeRequest";
import { prompt, confirm, alert } from "./prompts";
import * as eventBus from "./eventBus";

const { dialog, getCurrentWindow } = window.require("electron").remote;

const styles = theme => ({
  root: {
    overflow: "auto",
    marginBottom: "0px !important",
    marginTop: "0px !important",
    "& > header": {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    },
    "& > main": {
      overflow: "initial !important",
      paddingTop: "0.2em !important"
    }
  },
  request: {
    fontSize: "0.9em",
    padding: "0.2em",
    borderBottom: "1px solid " + theme.libraryDividerColor,
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "center",
    cursor: "pointer",
    "&:last-child": {
      borderBottom: "0px"
    }
  },
  buttons: {
    "& button": {
      marginLeft: "0.2em"
    }
  },
  currentlyLoaded: {
    backgroundColor: theme.currentlyLoadedBackgroundColor
  },
  directory: {
    display: "flex",
    padding: "0.6em",
    "& > input": {
      fontSize: "0.7em",
      flex: 1,
      border: "1px solid #ccc",
      padding: "0.3em",
      marginLeft: "0.2em",
      color: "#999",

      "&:focus": {
        outline: 0
      }
    }
  }
});

class Library extends React.Component {
  state = {
    requestNames: []
  };

  componentDidMount() {
    eventBus.subscribe("RELOAD_DIRECTORY", this.refreshDirectory);

    this.refreshDirectory();
  }

  componentWillUnmount() {
    eventBus.unsubscribe("RELOAD_DIRECTORY", this.refreshDirectory);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.directory !== this.props.directory) {
      this.refreshDirectory();
    }
  }

  refreshDirectory = async () => {
    const { directory } = this.props;
    if (directory) {
      const requestNames = await getRequestsInDirectory();
      this.setState({ requestNames });
    } else {
      this.setState({ requestNames: [] });
    }
  };

  loadRequest = async name => {
    const request = await loadRequest(name);
    sessionStorage.request = JSON.stringify(request);
    this.props.dispatch(draft => {
      draft.currentRequest = request;
      draft.currentResponse = null;
    });
  };

  loadAndExecuteRequest = async name => {
    await this.loadRequest(name);
    executeRequest();
  };

  deleteRequest = async name => {
    if (await confirm("Permanently delete this saved request?", name)) {
      await deleteRequest(name);
    }
  };

  renameRequest = async name => {
    const newName = await prompt("Rename saved request", "", name);
    if (newName === null || newName === name) {
      return;
    }

    if (!newName) {
      await alert("ERROR", "You must enter a name!");
    }

    try {
      await renameRequest(name, newName);
    } catch (e) {
      await alert("ERROR", String(e.message || e));
    }
  };

  chooseDirectory = () => {
    const options = {
      title: "Choose the directory for saved requests",
      properties: ["openDirectory"]
    };
    const dirs = dialog.showOpenDialog(getCurrentWindow(), options);
    if (dirs) {
      setDirectory(dirs[0]);
    }
  };

  render() {
    const { classes, currentRequest, directory } = this.props;
    const { requestNames } = this.state;
    const loadedRequestName = currentRequest ? currentRequest.name : null;

    return (
      <div className={`card ${classes.root}`}>
        <header>
          <div>Saved requests</div>
        </header>
        <div className={classes.directory}>
          <button onClick={this.chooseDirectory}>Choose</button>
          <input type="text" readOnly={true} value={directory || "no directory selected"} />
          <button onClick={this.refreshDirectory}>↻</button>
        </div>
        <main>
          {requestNames.map(requestName => (
            <div
              className={
                classes.request +
                (requestName === loadedRequestName ? " " + classes.currentlyLoaded : "")
              }
              key={requestName}
              onClick={() => this.loadRequest(requestName)}
            >
              <div>{requestName}</div>
              <div className={classes.buttons}>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    this.loadAndExecuteRequest(requestName);
                  }}
                >
                  Execute
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    this.deleteRequest(requestName);
                  }}
                >
                  Delete
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    this.renameRequest(requestName);
                  }}
                >
                  Rename
                </button>
              </div>
            </div>
          ))}
        </main>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    currentRequest: state.currentRequest,
    directory: state.directory
  };
}

export default connect(mapStateToProps)(injectStyles(styles)(Library));

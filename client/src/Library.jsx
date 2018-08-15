import React from "react";
import injectStyles from "react-jss";
import { connect } from "react-redux";
import { deleteRequest, renameRequest, setDirectory } from "./libraryStorage";
import { executeRequest } from "./executeRequest";
import { prompt, confirm } from "./prompts";

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
  setCurrentRequest = currentRequest => {
    sessionStorage.request = JSON.stringify(currentRequest);
    this.props.dispatch(draft => {
      draft.currentRequest = currentRequest;
      draft.currentResponse = null;
    });
  };

  executeRequest = request => {
    this.setCurrentRequest(request);
    executeRequest();
  };

  deleteRequest = async name => {
    if (await confirm("Permanently delete this saved request?", name)) {
      console.log("deleting", name);
      await deleteRequest(name);
    }
  };

  renameRequest = async request => {
    const newName = await prompt("Rename saved request", "", request.name);
    if (newName === null || newName === request.name) {
      return;
    }

    if (!newName) {
      await alert("ERROR", "You must enter a name!");
    }

    try {
      await renameRequest(request, newName);
    } catch (e) {
      await alert("ERROR, cannot rename", String(e));
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
    const { classes, savedRequests, currentRequest, directory } = this.props;
    const loadedRequestName = currentRequest ? currentRequest.name : null;

    return (
      <div className={`card ${classes.root}`}>
        <header>
          <div>Saved requests</div>
        </header>
        <div className={classes.directory}>
          <button onClick={this.chooseDirectory}>Choose</button>
          <input type="text" readOnly={true} value={directory || "no directory selected"} />
        </div>
        <main>
          {savedRequests.map(request => (
            <div
              className={
                classes.request +
                (request.name === loadedRequestName ? " " + classes.currentlyLoaded : "")
              }
              key={request.name}
              onClick={() => this.setCurrentRequest(request)}
            >
              <div>{request.name}</div>
              <div className={classes.buttons}>
                <button onClick={() => this.executeRequest(request)}>Execute</button>
                <button onClick={() => this.deleteRequest(request.name)}>Delete</button>
                <button onClick={() => this.renameRequest(request)}>Rename</button>
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
    savedRequests: state.savedRequests,
    currentRequest: state.currentRequest,
    directory: state.directory
  };
}

export default connect(mapStateToProps)(injectStyles(styles)(Library));

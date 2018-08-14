import React from "react";
import injectStyles from "react-jss";
import { connect } from "react-redux";
import { deleteRequest, renameRequest, setDirectory } from "./libraryStorage";
import { executeRequest } from "./executeRequest";
import { prompt, confirm } from "./prompts";

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
      overflow: "initial !important"
    }
  },
  directoryChooser: {
    cursor: "pointer",
    font: theme.inputFont,
    outline: "1px solid #ccc",
    outlineOffset: "0.2em",
    "& input": {
      display: "none"
    },
    "&:hover": {
      color: "#007acc",
      textDecoration: "underline"
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
    "&:first-child": {
      borderTop: "1px solid " + theme.libraryDividerColor
    }
  },
  buttons: {
    "& button": {
      marginLeft: "0.2em"
    }
  },
  currentlyLoaded: {
    backgroundColor: theme.currentlyLoadedBackgroundColor
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
    if (await confirm("Are you sure you want to delete this saved request?", name)) {
      console.log("deleting", name);
      await deleteRequest(name);
    }
  };

  renameRequest = async request => {
    const newName = await prompt("Rename request", request.name, request.name);
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

  render() {
    const { classes, savedRequests, currentRequest, directory } = this.props;
    const loadedRequestName = currentRequest ? currentRequest.name : null;

    return (
      <div className={`card ${classes.root}`}>
        <header>
          <div>Saved requests</div>
          <label className={classes.directoryChooser}>
            {directory}
            <input
              type="file"
              webkitdirectory=""
              pathname={directory}
              onChange={e => setDirectory(e.target.files[0].path)}
            />
          </label>
        </header>
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

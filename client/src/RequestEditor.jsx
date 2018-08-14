import React from "react";
import injectStyles from "react-jss";
import produce from "immer";
import { save, doesNameExist } from "./libraryStorage";
import { connect } from "react-redux";
import { prompt } from "./prompts";

const styles = theme => ({
  root: {
    marginTop: "0px !important",
    overflow: "auto",
    "& > main": {
      overflow: "initial !important"
    },
    "& input, & select, & textarea": {
      font: theme.inputFont
    },
    "& input, & select": {
      border: "1px solid " + theme.inputBorderColor,
      padding: "0.3em",
      "&:focus": {
        position: "relative",
        zIndex: 1000
      }
    }
  },
  requestLine: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.6em",
    "& > div": {
      display: "flex",
      flexWrap: "wrap"
    },
    "& button": {
      marginRight: "0.2em"
    }
  },
  url: {
    marginTop: "0.4em",
    width: "100%",
    boxSizing: "border-box",
    display: "block"
  },
  headers: {
    marginTop: "0.3em",
    marginBottom: "0px !important",
    display: "grid",
    gridTemplateColumns: "4fr 13fr auto",
    alignItems: "end",
    "& input": {
      minWidth: 0,
      margin: {
        bottom: "-1px",
        right: "-1px"
      }
    },
    "& button": {
      marginLeft: "0.3em",
      padding: "0.4em 0.6em"
    }
  },
  body: {
    "& div": {
      margin: "0.7em 0em 0.4em 0.1em"
    },
    "& textarea": {
      margin: "-2px",
      padding: "2px",
      display: "block",
      height: "10em",
      width: "100%",
      boxSizing: "border-box",
      borderColor: "transparent"
    }
  }
});

class RequestEditor extends React.Component {
  save = async () => {
    const request = this.props.currentRequest;

    const defaultName = request.name || `${request.method} ${request.url}`;
    const name = await prompt("Enter a name for this request:", "", defaultName);
    if (name === null) {
      return;
    }

    if (!name) {
      window.alert("ERROR: cannot save. You must specify a name!");
      return;
    }

    if (await doesNameExist(name)) {
      if (!window.confirm("Already exists! Do you want to overwrite the existing:\n" + name)) {
        return;
      }
    }

    await save({
      ...request,
      name
    });

    this.modifyRequest(draft => {
      draft.name = name;
    });
  };

  clearResponse = () => {
    this.props.dispatch(draft => {
      draft.currentResponse = null;
    });
  };

  modifyRequest(immerCallback) {
    const currentRequest = produce(this.props.currentRequest, immerCallback);
    sessionStorage.request = JSON.stringify(currentRequest);
    this.props.dispatch(draft => {
      draft.currentRequest = currentRequest;
    });
  }

  setHeaderName = (index, name) => {
    this.modifyRequest(draft => {
      draft.headers[index].name = name;
    });
  };

  setHeaderValue = (index, value) => {
    this.modifyRequest(draft => {
      draft.headers[index].value = value;
    });
  };

  addHeader = () => {
    this.modifyRequest(draft => {
      draft.headers.push({ name: "", value: "" });
    });
  };

  removeHeader = index => {
    this.modifyRequest(draft => {
      draft.headers.splice(index, 1);
    });
  };

  setBody = e => {
    this.modifyRequest(draft => {
      draft.body = e.target.value;
    });
  };

  render() {
    const { classes, currentRequest } = this.props;
    const { method, headers, body } = currentRequest;

    const hasRequestBody = method === "POST" || method === "PUT";

    return (
      <section className={`card ${classes.root}`}>
        <header>Request editor</header>
        <main>
          <section>
            <div className={classes.requestLine}>
              <div>
                <button onClick={this.addHeader}>Add Header</button>
                <button onClick={this.clearResponse}>Clear Response</button>
                <button onClick={this.save}>Save</button>
              </div>
            </div>
          </section>
          <section className={classes.headers}>
            {headers.map((header, i) => (
              <React.Fragment key={i}>
                <input
                  type="text"
                  spellCheck={false}
                  value={header.name}
                  onChange={e => this.setHeaderName(i, e.target.value)}
                />
                <input
                  type="text"
                  spellCheck={false}
                  value={header.value}
                  onChange={e => this.setHeaderValue(i, e.target.value)}
                />
                <button onClick={() => this.removeHeader(i)}>Remove</button>
              </React.Fragment>
            ))}
          </section>
          {hasRequestBody && (
            <section className={classes.body}>
              <label>
                <div>Body:</div>
                <textarea spellCheck={false} value={body} onChange={this.setBody} />
              </label>
            </section>
          )}
        </main>
      </section>
    );
  }
}

function mapStateToProps(state) {
  return {
    currentRequest: state.currentRequest
  };
}

export default connect(mapStateToProps)(injectStyles(styles)(RequestEditor));

import React from "react";
import injectStyles from "react-jss";
import { connect } from "react-redux";

const styles = theme => ({
  root: {},
  arrow: {
    display: "flex",
    justifyContent: "space-around",
    color: theme.arrowColor,
    marginTop: `calc(${theme.cardSpacing} / 2)`,
    marginBottom: `calc(${theme.cardSpacing} / 2)`,
    fontSize: "1.1em"
  },
  fixed: {
    whiteSpace: "pre",
    fontFamily: theme.monospaceFontFamily
  },
  controls: {
    paddingTop: "0.3em",
    paddingBottom: "0.5em"
  },
  socket: {
    marginTop: "0px !important",
    "& main": {
      extend: "fixed"
    }
  },
  rawRequest: {
    "& > main": {
      extend: "fixed",
      whiteSpace: "pre"
    }
  },
  response: {
    "& > header": {
      display: "flex",
      justifyContent: "space-between"
    },
    "& > main": {
      extend: "fixed"
    }
  },
  parseError: {
    color: "red",
    marginTop: "0.8em",
    marginBottom: "1.1em",
    paddingLeft: "0.4em"
  },
  prettyJsonLabel: {
    fontSize: "0.8em",
    display: "flex",
    alignItems: "center"
  }
});

function generatePrettyJson(json) {
  try {
    let pretty = JSON.stringify(JSON.parse(json), null, 3);
    pretty = pretty.replace(/(\\r)?\\n/g, "\n");
    return pretty;
  } catch (e) {
    return json;
  }
}

function isJsonResponse(response) {
  const contentTypeHeader = response.headers.find(
    header => header.name.toLowerCase() === "content-type"
  );

  return contentTypeHeader && /^application\/json(;|$)/.test(contentTypeHeader.value);
}

class Response extends React.Component {
  setPrettyPrintJsonBody = prettyPrintJsonBody => {
    this.props.dispatch(draft => {
      draft.prettyPrintJsonBody = prettyPrintJsonBody;
    });
  };

  render() {
    const { classes, currentResponse, prettyPrintJsonBody } = this.props;

    if (!currentResponse) {
      return null;
    }

    const {
      httpVersion,
      statusCode,
      statusMessage,
      headers,
      body,
      socket,
      rawRequest,
      parseErrorAfterBytes
    } = currentResponse;

    const arrow = <div className={classes.arrow}>🠣</div>;

    let responseLines = [`HTTP/${httpVersion} ${statusCode} ${statusMessage}`];
    if (headers) {
      for (const { name, value } of headers) {
        responseLines.push(`${name}: ${value}`);
      }
    }
    if (typeof body === "string") {
      responseLines.push("\n" + (prettyPrintJsonBody ? generatePrettyJson(body) : body));
    }
    const responseText = responseLines.join("\n");

    return (
      <div className={classes.root}>
        <section className={`card ${classes.socket}`}>
          <header>
            TCP socket connection (local
            {"  "}
            &rarr;
            {"  "}
            remote)
          </header>
          <main>
            {socket.localAddress}:{socket.localPort} &rarr; {socket.remoteAddress}:
            {socket.remotePort}
          </main>
        </section>

        {arrow}

        <section className={`card ${classes.rawRequest}`}>
          <header>HTTP request sent to server</header>
          <main>{rawRequest}</main>
        </section>

        {arrow}

        {parseErrorAfterBytes && (
          <div className={classes.parseError}>
            ERROR: invalid HTTP response received from server after reading {parseErrorAfterBytes}{" "}
            bytes.
            <br />
            Ensure the body length matches the Content-Type response header.
          </div>
        )}

        <section className={`card ${classes.response}`}>
          <header>
            <div>HTTP response from server</div>
            {body &&
              isJsonResponse(currentResponse) && (
                <label className={classes.prettyJsonLabel}>
                  <input
                    type="checkbox"
                    checked={prettyPrintJsonBody}
                    onChange={e => this.setPrettyPrintJsonBody(e.target.checked)}
                  />
                  <span>Pretty-print JSON response body</span>
                </label>
              )}
          </header>
          <main>{responseText}</main>
        </section>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    currentResponse: state.currentResponse,
    prettyPrintJsonBody: state.prettyPrintJsonBody
  };
}

export default connect(mapStateToProps)(injectStyles(styles)(Response));

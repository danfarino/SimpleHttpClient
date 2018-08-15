import React from "react";
import injectStyles from "react-jss";
import RequestEditor from "./RequestEditor";
import Response from "./Response";
import Library from "./Library";
import InProgressIndicator from "./InProgressIndicator";
import ErrorMessage from "./ErrorMessage";
import UrlEditor from "./UrlEditor";

const styles = theme => ({
  "@global": {
    body: {
      font: theme.bodyFont
    },
    "::placeholder": {
      color: theme.placeholderColor
    },
    ":focus": {
      outline: "#007acc auto 5px"
    },
    ".smalltalk > .page": {
      minWidth: "30em"
    },
    "input, select": {
      fontSize: "inherit"
    },
    button: {
      padding: "0.2em 0.6em"
    },
    ".card": {
      boxShadow: "0 1px 4px rgba(0,0,0,.15)",
      backgroundColor: theme.cardBackgroundColor
    },
    ".card > header": {
      color: theme.cardHeaderColor,
      backgroundColor: theme.cardHeaderBackgroundColor,
      borderTop: "4px solid " + theme.cardHeaderAccentColor,
      padding: "0.5em 0.7em 0.4em 0.7em",
      borderRadius: "0.1em"
    },
    ".card > main": {
      overflow: "auto",
      padding: "0.9em 1em 1em 1em"
    }
  },
  root: {
    backgroundColor: theme.appBackgroundColor,
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    boxSizing: "border-box",

    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gridTemplateRows: "auto 1fr",
    gridGap: theme.cardSpacing,
    "& > *": {
      minWidth: 0,
      minHeight: 0
    }
  },
  // "@media (min-width: 2000px)": {
  //   root: {
  //     gridTemplateColumns: "700px 1fr"
  //   }
  // },
  urlEditor: {
    gridColumn: "1 / -1"
  },
  leftPane: {
    padding: theme.cardSpacing,
    paddingTop: 0,
    paddingRight: 0,
    display: "grid",
    gridTemplateRows: "10fr 7fr",
    gridGap: theme.cardSpacing
  },
  rightPane: {
    padding: theme.cardSpacing,
    paddingTop: 0,
    paddingLeft: 0,
    overflowY: "scroll"
  }
});

class App extends React.Component {
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <div className={classes.urlEditor}>
          <UrlEditor />
        </div>
        <div className={classes.leftPane}>
          <RequestEditor />
          <Library />
        </div>
        <div className={classes.rightPane}>
          <InProgressIndicator />
          <ErrorMessage />
          <Response />
        </div>
      </div>
    );
  }
}
export default injectStyles(styles)(App);

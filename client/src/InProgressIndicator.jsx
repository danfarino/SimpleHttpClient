import React from "react";
import injectStyles from "react-jss";
import { connect } from "react-redux";

const styles = theme => ({
  root: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5em",
    color: theme.inProgressIndicatorColor,
    fontFamily: theme.monospaceFontFamily
  }
});

class InProgressIndicator extends React.Component {
  render() {
    const { classes, inProgress } = this.props;

    return inProgress !== false ? (
      <div className={classes.root}>
        Loading ({inProgress.toFixed(1)}
        ms)...
      </div>
    ) : null;
  }
}

function mapStateToProps(state) {
  return {
    inProgress: state.inProgress
  };
}

export default injectStyles(styles)(connect(mapStateToProps)(InProgressIndicator));

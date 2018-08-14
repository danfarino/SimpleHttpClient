import React from "react";
import { connect } from "react-redux";
import injectStyles from "react-jss";

const styles = theme => ({
  root: {
    color: theme.errorMessageColor
  }
});

class ErrorMessage extends React.Component {
  render() {
    const { error, classes } = this.props;
    if (error) {
      return <div className={classes.root}>{error}</div>;
    } else {
      return null;
    }
  }
}

function mapStateToProps(state) {
  return {
    error: state.error
  };
}

export default connect(mapStateToProps)(injectStyles(styles)(ErrorMessage));

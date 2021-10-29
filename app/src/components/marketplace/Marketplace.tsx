import { CardMedia, makeStyles } from "@material-ui/core";
import { observer } from "mobx-react-lite";

function Marketplace() {
  const classes = useStyles();

  return <div className={classes.frame}>Marketplace / Auction house </div>;
}

export default observer(Marketplace);

const useStyles = makeStyles(() => ({
  frame: {
    minHeight: "90vh"
  }
}));

import { CardMedia, makeStyles } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { openSeaCollectionUrl } from "../../lib/constants";

function Marketplace() {
  const classes = useStyles();

  return (
    <CardMedia
      component="iframe"
      src={`${openSeaCollectionUrl}`}
      title={"CLIP Marketplace"}
      className={classes.frame}
    />
  );
}

export default observer(Marketplace);

const useStyles = makeStyles(() => ({
  frame: {
    minHeight: "90vh"
  }
}));

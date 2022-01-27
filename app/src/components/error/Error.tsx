import { Box, Typography, Link, makeStyles } from "@material-ui/core";
import CenteredContainer from "../container/CenteredContainer";

interface Props {
  text?: string;
  withRetry?: boolean;
}

function PleaseTryAgain() {
  const classes = useStyles();

  return (
    <Box>
      <Typography variant="body1" className={classes.bodyP}>
        Please{" "}
        <Link
          component="button"
          variant="body1"
          className={classes.linkBtn}
          onClick={() => window.location.reload()}
          underline="always"
        >
          try again
        </Link>{" "}
        or {/* TODO implement 'contact us' form */}
        <Link href="#" underline="always">
          contact us
        </Link>
        .
      </Typography>
    </Box>
  );
}

function ErrorWithRetry({ text, withRetry }: Props) {
  const classes = useStyles();

  if (!text) {
    text = "Something went wrong.";
    withRetry = true;
  }

  return (
    <CenteredContainer className={classes.container}>
      <Typography variant="h5">{text}</Typography>
      {withRetry ? <PleaseTryAgain /> : <></>}
    </CenteredContainer>
  );
}

export default ErrorWithRetry;

const useStyles = makeStyles(() => ({
  container: {
    flexDirection: "column",
    margin: "0 10rem",
    textAlign: "center",
  },
  bodyP: {
    margin: "1rem 0",
  },
  linkBtn: {
    verticalAlign: "baseline",
  },
}));

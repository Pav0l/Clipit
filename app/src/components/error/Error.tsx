import { Box, Typography, Link, makeStyles } from "@material-ui/core";

interface Props {
  text: string;
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

  return (
    <Box
      display="flex"
      alignItems="center"
      width="100%"
      justifyContent="center"
      flexDirection="column"
    >
      <Typography variant="h5" className={classes.title}>
        {text}
      </Typography>
      {withRetry ? <PleaseTryAgain /> : null}
    </Box>
  );
}

export default ErrorWithRetry;

const useStyles = makeStyles(() => ({
  title: {
    marginTop: "15rem"
  },
  bodyP: {
    margin: "1rem 0"
  },
  linkBtn: {
    verticalAlign: "baseline"
  }
}));

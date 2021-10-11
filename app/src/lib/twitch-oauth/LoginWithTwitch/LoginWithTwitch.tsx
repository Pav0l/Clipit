import { Button, makeStyles } from "@material-ui/core";

function LoginWithTwitch({ redirect }: { redirect: () => string }) {
  const classes = useStyles();
  return (
    <Button
      className={classes.button}
      onClick={() => (location.href = redirect())}
    >
      Login with Twitch
    </Button>
  );
}

export default LoginWithTwitch;

const useStyles = makeStyles(() => ({
  button: {
    backgroundColor: "#9147ff",
    borderRadius: "4px",
    color: "#fff",
    border: "none",
    textTransform: "none",
    padding: "6px 18px",
    marginRight: "0.5rem",
    fontWeight: 600,
    "&:hover": {
      backgroundColor: "#772ce8",
      color: "#fff"
    }
  }
}));

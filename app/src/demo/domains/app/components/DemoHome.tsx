import { Typography, Box, Button, TextField, Link } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import SplitContainer from "../../../../components/container/SplitContainer";
import { makeAppStyles } from "../../../../domains/theme/theme.constants";
import { TelemetryService } from "../../telemetry/telemetry.service";
import { SnackbarController } from "../../../../domains/snackbar/snackbar.controller";
import { useInputData } from "../../../../lib/hooks/useInputData";
import { isValidEmail } from "../../../../lib/strings/email";
import { UserModel } from "../../../../domains/twitch-user/user.model";
import Logo from "../../../../assets/logo.svg";

interface Props {
  clipId: string;
  model: {
    user: UserModel;
  };
  operations: {
    telemetry: TelemetryService;
    snackbar: SnackbarController;
  };
}

export const DemoHome = observer(function DemoHome({ model, operations, clipId }: Props) {
  const classes = useStyles();
  const [inputValue, setInputValue, clearInput] = useInputData(model.user.email);

  const handleClick = () => {
    if (!isValidEmail(inputValue)) {
      clearInput();
      return;
    }

    model.user.setUser({ email: inputValue });
    operations.telemetry.waitlist(clipId);
    operations.snackbar.sendInfo("Thank you for joining! We'll get in touch...", 15_000);
    clearInput();
  };

  const handleInputChange = (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!ev.target.value) {
      setInputValue("");
    }

    setInputValue(ev.target.value);
  };

  return (
    <Box className={classes.homeWrapper}>
      <SplitContainer dataTestId="home-v2">
        <Box className={`${classes.leftContainerChild} ${classes.centeredFlex}`}>
          <Logo />
        </Box>
        <Box className={`${classes.rightContainerChild} ${classes.centeredFlex}`}>
          <Box className={`${classes.main}`}>
            <Typography variant="h3" className={`${classes.mainTitleValue} ${classes.openSansFamily}`}>
              Reward your supporters
            </Typography>
            <Typography variant="h3" className={`${classes.mainTitleValue} ${classes.openSansFamily}`}>
              with unique digital collectibles
            </Typography>

            <Typography variant="h4" className={`${classes.description}`}>
              Join the waitlist to find out more.
            </Typography>
            <Box className={`${classes.inputWrapper}`}>
              <TextField
                label="Enter your email"
                id="email"
                value={inputValue}
                size="medium"
                onChange={handleInputChange}
                variant="outlined"
                className={classes.input}
              />
              <Button className={`${classes.button}`} onClick={handleClick}>
                Join waitlist
              </Button>
            </Box>

            <Typography variant="h4" className={`${classes.description}`}>
              Contact us at{" "}
              <Link
                className={classes.blackColor}
                component="a"
                href="mailto:hello@clipit.fyi?subject=Hey%20there"
                target="_top"
                rel="noopener noreferrer"
              >
                hello@clipit.fyi
              </Link>{" "}
              or via{" "}
              <Link
                className={classes.blackColor}
                component="a"
                href="https://twitter.com/ClipItCollect"
                target="_top"
                rel="noopener noreferrer"
              >
                Twitter
              </Link>
              .
            </Typography>
          </Box>
        </Box>
      </SplitContainer>
    </Box>
  );
});

const useStyles = makeAppStyles((theme) => ({
  homeWrapper: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  main: {
    width: "100%",
    margin: "0 6rem",
    [theme.breakpoints.down("xs")]: {
      margin: "0 2rem",
    },
  },
  description: {
    color: theme.colors.text_secondary,
    fontWeight: 500,
    fontSize: "clamp(16px, 1.6vw, 2.5rem)",
    margin: "3rem 0",
    [theme.breakpoints.down("xs")]: {
      margin: "2rem 0",
    },
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
      marginTop: "0",
      marginBottom: "1rem",
    },
  },
  button: {
    backgroundColor: theme.colors.twitch_bg_primary,
    color: theme.colors.text_primary,
    minWidth: "180px",
    borderRadius: "4px",
    border: "none",
    fontVariant: "small-caps",
    padding: "1rem",
    fontWeight: 900,
    boxShadow: "0px 16px 48px #C3C8C9",
    "&:hover": {
      backgroundColor: theme.colors.twitch_bg_secondary,
      color: theme.colors.twitch_text_secondary,
    },
  },
  input: {
    width: "70%",
    maxWidth: "500px",
    marginRight: "3rem",
    backgroundColor: theme.colors.background_ternary,
    [theme.breakpoints.down("xs")]: {
      width: "100%",
      margin: "1rem 1rem 2rem",
    },
  },
  leftContainerChild: {
    color: "white",
    width: "30%",
    height: "100vh",
    [theme.breakpoints.down("xs")]: {
      width: "100%",
    },
    backgroundColor: theme.colors.twitch_bg_secondary,
  },
  rightContainerChild: {
    width: "70%",
    margin: "0 2rem",
    height: "100vh",

    [theme.breakpoints.down("xs")]: {
      width: "100%",
      margin: "0",
      textAlign: "center",
    },
  },
  centeredFlex: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  mainTitleValue: {
    color: theme.colors.text_primary,
    fontWeight: 700,
    fontSize: "clamp(1rem, 2.6vw, 3rem)",
    letterSpacing: "0",
    lineHeight: "2.5rem",
    [theme.breakpoints.down("xs")]: {
      fontSize: "1.8rem",
    },
    [theme.breakpoints.down("lg")]: {
      lineHeight: "normal",
    },
  },
  openSansFamily: {
    fontFamily: "Open Sans",
  },
  blackColor: {
    color: theme.colors.text_primary,
  },
}));

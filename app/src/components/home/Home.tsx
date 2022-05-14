import { Typography, Box, Button, TextField } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import SplitContainer from "../container/SplitContainer";
import { makeAppStyles } from "../../domains/theme/theme.constants";
import { NavigatorController } from "../../domains/navigation/navigation.controller";
import Footer from "../footer/Footer";
import { Logo } from "../logo/Logo";
import { ClipModel } from "../../domains/twitch-clips/clip.model";
import { demoClip } from "../../lib/constants";
import { TelemetryService } from "../../demo/domains/telemetry/telemetry.service";
import { SnackbarController } from "../../domains/snackbar/snackbar.controller";
import { TwitchEmbed } from "../media/TwitchEmbed";
import { useInputData } from "../../lib/hooks/useInputData";
import { isValidEmail } from "../../lib/strings/email";
import { UserModel } from "../../domains/twitch-user/user.model";

interface Props {
  clipId: string;
  model: {
    clip: ClipModel;
    user: UserModel;
  };
  operations: {
    navigator: NavigatorController;
    telemetry: TelemetryService;
    snackbar: SnackbarController;
  };
}

function Home({ model, operations, clipId }: Props) {
  const classes = useStyles();
  const [inputValue, setInputValue, clearInput] = useInputData(model.user.email);
  const data = model.clip.getClip(clipId) ?? demoClip;

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
      <nav>
        <Logo onClick={operations.navigator.goToRoute} />
      </nav>
      <div className={classes.main}>
        <SplitContainer dataTestId="home">
          <section className={`${classes.splitContainerChild}`}>
            <div className={classes.titleGroup}>
              <div className={classes.titleItem}>
                <Typography variant="body2" className={classes.numbers}>
                  01
                </Typography>
                <Typography variant="h2" className={classes.title}>
                  MINT
                </Typography>
              </div>
              <div className={classes.titleItem}>
                <Typography variant="body2" className={classes.numbers}>
                  02
                </Typography>
                <Typography variant="h2" className={classes.title}>
                  TRADE
                </Typography>
              </div>
              <div className={classes.titleItem}>
                <Typography variant="body2" className={classes.numbers}>
                  03
                </Typography>
                <Typography variant="h2" className={classes.title}>
                  COLLECT
                </Typography>
              </div>
            </div>
            <Typography variant="h4" className={`${classes.withLeftMargin} ${classes.description}`}>
              Your Greatest Streaming Moments
            </Typography>
          </section>
          <Box className={`${classes.splitContainerChild} ${classes.videoWrapper}`}>
            <TwitchEmbed
              src={data.embedUrl}
              title={`${data.broadcasterName}: ${data.title}`}
              className={classes.video}
            />
          </Box>
        </SplitContainer>
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
      </div>

      <Footer operations={{ navigator: operations.navigator }} />
    </Box>
  );
}

export default observer(Home);

const useStyles = makeAppStyles((theme) => ({
  homeWrapper: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    margin: "0 4rem",
    [theme.breakpoints.down("xs")]: {
      margin: "0 2rem",
    },
  },
  main: {
    [theme.breakpoints.down("xs")]: {
      marginTop: "1rem",
    },
  },
  numbers: {
    color: theme.colors.text_secondary,
    fontStyle: "italic",
    fontWeight: 500,
    fontSize: "clamp(1rem, 1.5vw, 2rem)",
    marginRight: "1.5rem",
  },
  title: {
    color: theme.colors.text_primary,
    textAlign: "center",
    fontStyle: "normal",
    fontWeight: 900,
    fontSize: "clamp(3rem, 7vw, 8rem)",
    lineHeight: "0.86",
  },
  description: {
    color: theme.colors.text_secondary,
    fontStyle: "italic",
    fontWeight: 500,
    fontSize: "clamp(1rem, 2.6vw, 3rem)",
    margin: "1rem 0",
    [theme.breakpoints.down("xs")]: {
      margin: "2rem 0",
      padding: "0",
    },
  },
  titleGroup: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "start",
    alignItems: "flex-start",
  },
  titleItem: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "start",
    alignItems: "baseline",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "5rem",
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
      marginTop: "0",
    },
  },
  button: {
    backgroundColor: theme.colors.twitch_bg_primary,
    color: theme.colors.text_primary,
    borderRadius: "16px",
    border: "none",
    fontVariant: "small-caps",
    padding: "1rem 2rem",
    fontWeight: 900,
    fontSize: "clamp(1rem, 1.3vw, 3rem)",
    boxShadow: "0px 16px 48px #C3C8C9",
    "&:hover": {
      backgroundColor: theme.colors.twitch_bg_secondary,
      color: theme.colors.twitch_text_secondary,
    },
  },
  input: {
    width: "40%",
    maxWidth: "500px",
    marginRight: "3rem",
    backgroundColor: theme.colors.background_ternary,
    [theme.breakpoints.down("xs")]: {
      width: "100%",
      margin: "2rem",
    },
  },
  videoWrapper: {
    position: "relative",
    [theme.breakpoints.down("xs")]: {
      paddingBottom: "calc(100% * 0.5625)", // 16:9 aspect ratio
    },
  },
  video: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  withLeftMargin: {
    marginLeft: "3.5rem",
    [theme.breakpoints.down("xs")]: {
      marginLeft: "0",
    },
  },
  splitContainerChild: {
    width: "50%",
    [theme.breakpoints.down("xs")]: {
      width: "100%",
    },
  },
}));

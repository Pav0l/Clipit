import { Typography, Box } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import SplitContainer from "../container/SplitContainer";
import LoginWithTwitch from "../../domains/twitch-oauth/LoginWithTwitch/LoginWithTwitch";
import { OAuthModel } from "../../domains/twitch-oauth/oauth.model";
import { OAuthController } from "../../domains/twitch-oauth/oauth.controller";
import { makeAppStyles } from "../../domains/theme/theme.constants";
import { NavigatorController } from "../../domains/navigation/navigation.controller";
import Footer from "../footer/Footer";
import { Logo } from "../logo/Logo";
import { Thumbnail } from "../media/Thumbnail";
import { RouteLink } from "../../domains/navigation/components/RouteLink";
import { ClipModel } from "../../domains/twitch-clips/clip.model";
import { AppRoute, demoClip } from "../../lib/constants";

interface Props {
  model: {
    auth: OAuthModel;
    clip: ClipModel;
  };
  operations: {
    auth: OAuthController;
    navigator: NavigatorController;
  };
}

export const AppHome = observer(function AppHome({ model, operations }: Props) {
  const classes = useStyles();
  // TODO replace demoClip with some proper data (used to have the random/featured clip here)
  const data = demoClip;

  return (
    <Box className={classes.homeWrapper}>
      <nav>
        <Logo onClick={operations.navigator.goToRoute} />
      </nav>
      <div className={classes.main}>
        <SplitContainer dataTestId="home">
          <section className={classes.splitContainerChild}>
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
              The Greatest Streaming Moments
            </Typography>
          </section>
          <div className={classes.splitContainerChild}>
            <RouteLink
              setActive={operations.navigator.goToRoute}
              to={`${AppRoute.CLIPS}/${data.id}`}
              underline="none"
              child={<Thumbnail src={data.thumbnailUrl} title={data.title} className={classes.video} />}
            />
          </div>
        </SplitContainer>
        <div className={`${classes.withLeftMargin} ${classes.buttonWrapper}`}>
          <LoginWithTwitch
            model={{ auth: model.auth }}
            loggedInClick={() => operations.navigator.goToClip(data.id)}
            loggedOutClick={operations.auth.initOauthFlowIfNotAuthorized}
            loggedOutText="Login with Twitch"
            // TODO text
            loggedInText="Show Clip"
          />
        </div>
      </div>
      <Footer operations={{ navigator: operations.navigator }} />
    </Box>
  );
});

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
    paddingRight: "5rem",
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
  buttonWrapper: {
    marginTop: "4rem",
    [theme.breakpoints.down("lg")]: {
      marginTop: "3rem",
    },
    [theme.breakpoints.down("xs")]: {
      display: "flex",
      justifyContent: "center",
    },
  },
  video: {
    maxHeight: "70vh",
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

import { Typography, CardMedia, Box } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import SplitContainer from "../container/SplitContainer";
import LoginWithTwitch from "../../domains/twitch-oauth/LoginWithTwitch/LoginWithTwitch";
import { OAuthModel } from "../../domains/twitch-oauth/oauth.model";
import { OAuthController } from "../../domains/twitch-oauth/oauth.controller";
import { makeAppStyles } from "../../domains/theme/theme.constants";
import { NavigatorController } from "../../domains/navigation/navigation.controller";
import Footer from "../footer/Footer";
import { DemoModel } from "../../domains/app/demo.model";

interface Props {
  model: {
    auth: OAuthModel;
    demo: DemoModel;
  };
  operations: {
    auth: OAuthController;
    navigator: NavigatorController;
  };
}

function Home({ model, operations }: Props) {
  const classes = useStyles();
  const clipCid = model.demo.cid;

  return (
    <Box className={classes.homeWrapper}>
      <nav>
        <Typography variant="h5" className={classes.navLogo}>
          Clipit
        </Typography>
      </nav>
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
          <div className={classes.descriptionWithBtn}>
            <Typography variant="h4" className={classes.description}>
              Your Greatest Streaming Moments
            </Typography>
            <div className={classes.buttonWrapper}>
              <LoginWithTwitch
                model={{ auth: model.auth }}
                loggedInClick={() => operations.navigator.goToDemoClip(clipCid)}
                loggedOutClick={() => operations.auth.initOauthFlowIfNotAuthorized(`/demo/${clipCid}`)}
                loggedOutText="Login with Twitch"
                loggedInText="Show NFT Demo"
              />
            </div>
          </div>
        </section>
        <div className={classes.splitContainerChild}>
          <CardMedia
            component="video"
            src={model.demo.ipfsUri}
            title="demo clip"
            className={classes.video}
            controls
            controlsList="nodownload"
          />
        </div>
      </SplitContainer>
      <Footer operations={{ navigator: operations.navigator }} />
    </Box>
  );
}

export default observer(Home);

const useStyles = makeAppStyles((theme) => ({
  homeWrapper: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    margin: "0 4rem",
  },
  numbers: {
    color: theme.colors.text_secondary,
    fontStyle: "italic",
    fontWeight: 500,
    fontSize: "1.5vw",
    marginRight: "1.5rem",
  },
  title: {
    color: theme.colors.text_primary,
    textAlign: "center",
    fontStyle: "normal",
    fontWeight: 900,
    fontSize: "7vw",
    lineHeight: "0.86",
  },
  description: {
    color: theme.colors.text_secondary,
    fontStyle: "italic",
    fontWeight: 500,
    fontSize: "2.6vw",
    margin: "1rem 0",
    paddingRight: "5rem",
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
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    width: "inherit",
    marginTop: "4rem",
  },
  video: {
    maxHeight: "70vh",
  },
  navLogo: {
    backgroundColor: theme.colors.background_secondary,
    color: theme.colors.text_ternary,
    fontStyle: "italic",
    fontWeight: 900,
    padding: "2rem 3rem",
    display: "inline-block",
    textAlign: "center",
    clipPath: "polygon(0% 0%,100% 0%,100% 70%,80% 100%,0% 100%)",
  },
  descriptionWithBtn: {
    marginLeft: "3.5rem",
  },
  splitContainerChild: {
    width: "50%",
  },
}));

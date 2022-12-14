import { Box, Tooltip, Typography } from "@material-ui/core";
import { observer } from "mobx-react-lite";

import ExternalLinkIcon from "../../../../assets/external-link.svg";
import { makeAppStyles } from "../../../../domains/theme/theme.constants";
import { RouteLink } from "../../../../domains/navigation/components/RouteLink";
import { demoClip } from "../../../../lib/constants";
import { Logo } from "../../../../components/logo/Logo";
import { OAuthModel } from "../../../../domains/twitch-oauth/oauth.model";
import { OAuthController } from "../../../../domains/twitch-oauth/oauth.controller";
import { NavigatorController } from "../../../../domains/navigation/navigation.controller";
import { TwitchEmbed } from "../../../../components/media/TwitchEmbed";
import { ClipModel } from "../../../../domains/twitch-clips/clip.model";
import { Thumbnail } from "../../../../components/media/Thumbnail";
import { SnackbarController } from "../../../../domains/snackbar/snackbar.controller";

interface Props {
  clipId: string;
  withThumbnail: boolean;
  model: {
    auth: OAuthModel;
    clip: ClipModel;
  };
  operations: {
    auth: OAuthController;
    navigator: NavigatorController;
    snackbar: SnackbarController;
  };
}

function openRinkebyEtherscan() {
  window.open("https://rinkeby.etherscan.io/", "_blank", "noreferrer");
}

function transformDate(date?: string): string {
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
  if (!date) {
    // add 30 days
    return new Date(Date.now() + 2592000000).toLocaleDateString("en-US", options);
  }

  return new Date(date).toLocaleDateString("en-US", options);
}

export const DemoPage = observer(function Demo(props: Props) {
  const classes = useStyles();
  const clipId = props.clipId;
  const data = props.model.clip.getClip(clipId) ?? demoClip;

  const handleLogoClick = (to: string) => {
    props.operations.navigator.goToRoute(to);
    props.operations.snackbar.handleSnackClose();
  };

  return (
    <Box className={classes.homeWrapper}>
      <Box className={classes.centeredContainer}>
        {props.withThumbnail ? (
          <Thumbnail
            src={data.thumbnailUrl}
            title={`${data.broadcasterName}: ${data.title}`}
            className={classes.video}
          />
        ) : (
          <Box className={classes.videoWrapper}>
            <TwitchEmbed
              src={data.embedUrl}
              title={`${data.broadcasterName}: ${data.title}`}
              className={classes.video}
            />
          </Box>
        )}

        <Box className={classes.rightPanel}>
          <Box>
            <Box className={`${classes.boxMargin} ${classes.collectorBox}`}>
              <Tooltip title="Ethereum address of the viewer who bought the Clip" placement="bottom">
                <Box>
                  <Typography variant="h6" className={`${classes.collectorTitle} ${classes.sourceCodeProFamily}`}>
                    COLLECTOR
                  </Typography>
                  <RouteLink
                    child={
                      <>
                        <Typography className={`${classes.collectorAddress} ${classes.openSansFamily}`}>
                          {data.broadcasterName ? `${data.broadcasterName.toLowerCase()}fan.eth` : "collector.eth"}
                        </Typography>
                        <ExternalLinkIcon />
                      </>
                    }
                    setActive={openRinkebyEtherscan}
                    underline="none"
                    to=""
                    className={classes.centerPrimaryFlexRow}
                  />
                </Box>
              </Tooltip>
            </Box>
            <Box className={`${classes.withGradient} ${classes.dividerBox}`}></Box>
          </Box>

          <Box className={`${classes.boxMargin} ${classes.mainBox}`}>
            <Box className={classes.withMargin}>
              <MainBoxTitle title="TITLE" />
              <Tooltip title={data.title}>
                <Typography variant="h3" className={`${classes.mainTitleValue} ${classes.openSansFamily}`}>
                  {data.title}
                </Typography>
              </Tooltip>
            </Box>

            <Box className={classes.withMargin}>
              <MainBoxTitle title="AUTHOR" />
              <RouteLink
                child={
                  <>
                    <Typography variant="h4" className={`${classes.mainAuthor} ${classes.openSansFamily}`}>
                      {data.broadcasterName}
                    </Typography>
                    <ExternalLinkIcon />
                  </>
                }
                setActive={() => window.open(`https://www.twitch.tv/${data.broadcasterName}`, "_blank", "noreferrer")}
                underline="none"
                to=""
                className={classes.centerPrimaryFlexRow}
              />
            </Box>

            <Box className={classes.withMargin}>
              <MainBoxTitle title="STREAMED" />
              <MainBoxText text={transformDate(data.createdAt)} />
            </Box>
            <Box className={classes.withMargin}>
              <MainBoxTitle title="MINTED" />
              <Box className={classes.centerPrimaryFlexRow}>
                <MainBoxText text={transformDate()} />
                <RouteLink child={<ExternalLinkIcon />} setActive={openRinkebyEtherscan} underline="none" to="" />
              </Box>
            </Box>
          </Box>
          <Box className={`${classes.withGradient} ${classes.bottomBox}`}>
            <Logo
              textClass={`${classes.boxMargin} ${classes.navLogo}`}
              linkClass={classes.centerPrimaryFlexRow}
              onClick={handleLogoClick}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

const MainBoxTitle = (props: { title: string }) => {
  const classes = useStyles();
  return <Typography className={`${classes.mainTitle} ${classes.sourceCodeProFamily}`}>{props.title}</Typography>;
};

const MainBoxText = (props: { text: string }) => {
  const classes = useStyles();
  return <Typography className={`${classes.mainText} ${classes.openSansFamily}`}>{props.text}</Typography>;
};

const bottomHeight = "6vh";
const useStyles = makeAppStyles((theme) => ({
  homeWrapper: {
    minHeight: "100vh",
    display: "flex",
    margin: "0 4rem",
    flexDirection: "column",
    justifyContent: "center",
    [theme.breakpoints.down("xs")]: {
      margin: "0 2rem",
      padding: "2rem 0",
    },
  },
  centeredContainer: {
    display: "flex",
    backgroundColor: theme.colors.background_ternary,
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
    },
  },
  videoWrapper: {
    width: "75%",
    paddingBottom: "calc(75% * 0.5625)", // 16:9 aspect ratio
    position: "relative",
    [theme.breakpoints.down("xs")]: {
      width: "100%",
      paddingBottom: "calc(100% * 0.5625)",
    },
  },
  video: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  rightPanel: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    justifyContent: "space-between",
    maxWidth: "25%",
    [theme.breakpoints.down("xs")]: {
      maxWidth: "100%",
    },
  },
  withGradient: {
    background: "linear-gradient(97.18deg, #E6C7C0, #BCC7E1, #BAE4CF, #EBEBB4, #E8C2C5, #C1BFE8, #BFE3C3), #C4C4C4",
  },
  dividerBox: {
    height: "6px",
  },
  collectorBox: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "1.5rem 0",
    [theme.breakpoints.down("lg")]: {
      padding: "0.5rem 0",
    },
  },
  collectorTitle: {
    color: theme.colors.text_quaternary,
    fontSize: "clamp(10px, 1vw, 1rem)",
    fontWeight: 700,
    lineHeight: "1rem",
    letterSpacing: "0.1rem",
    [theme.breakpoints.down("lg")]: {
      lineHeight: "normal",
    },
  },
  collectorAddress: {
    fontSize: "clamp(12px, 1.2vw, 1.5rem)",
    fontWeight: 400,
    lineHeight: "2rem",
    letterSpacing: 0,
    marginRight: "0.5rem",
    [theme.breakpoints.down("lg")]: {
      lineHeight: "normal",
    },
  },
  mainBox: {
    margin: "auto 0",
  },
  withMargin: {
    margin: "2rem 0",
  },
  mainTitleValue: {
    color: theme.colors.text_primary,
    fontWeight: 700,
    fontSize: "clamp(16px, 1.6vw, 2.5rem)",
    letterSpacing: "0",
    lineHeight: "2.5rem",
    marginRight: "3rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    [theme.breakpoints.down("lg")]: {
      lineHeight: "normal",
    },
  },
  mainAuthor: {
    color: theme.colors.text_primary,
    fontWeight: 700,
    fontSize: "clamp(14px, 1.4vw, 1.7rem)",
    letterSpacing: "0",
    lineHeight: "2rem",
    marginRight: "0.5rem",
  },
  mainTitle: {
    color: theme.colors.text_fifth,
    fontWeight: 700,
    fontSize: "clamp(10px, 1vw, 1rem)",
    letterSpacing: "0.1em",
    lineHeight: "2rem",
    [theme.breakpoints.down("lg")]: {
      lineHeight: "normal",
    },
  },
  mainText: {
    color: theme.colors.text_primary,
    fontWeight: 400,
    fontSize: "clamp(11px, 1.1vw, 1.2rem)",
    letterSpacing: "0",
    lineHeight: "1rem",
    marginRight: "0.5rem",
  },
  bottomBox: {
    height: bottomHeight,
  },
  boxMargin: {
    marginLeft: "3rem",
  },
  centerPrimaryFlexRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    color: theme.colors.text_primary,
  },
  navLogo: {
    /**
     * Dynamically calculate the padding (which makes the height) of the component:
     * height = fontSize + 2 * padding // border and margin are 0
     * height = 1.2 * bottomHeight // navLogo to be 20% bigger than bottom bar
     * ==================================
     * padding = ((1.2 * bottomHeight) - fontSize) / 2
     */
    padding: `calc(((1.2 * ${bottomHeight}) - 1.2rem) / 2) 1.5vw`,
    fontSize: "1.2rem",
    marginTop: "-6px",
  },
  sourceCodeProFamily: {
    fontFamily: "Source Code Pro",
  },
  openSansFamily: {
    fontFamily: "Open Sans",
  },
}));

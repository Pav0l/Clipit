import { Box, Tooltip, Typography } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import ExternalLinkIcon from "../../assets/external-link.svg";
import { makeAppStyles } from "../../domains/theme/theme.constants";
import { RouteLink } from "../../domains/navigation/components/RouteLink";
import { DemoModel, demoStore } from "../../domains/app/demo.model";
import { Logo } from "../logo/Logo";
import { Video } from "./Video";
import { OAuthModel } from "../../domains/twitch-oauth/oauth.model";
import { OAuthController } from "../../domains/twitch-oauth/oauth.controller";
import { NavigatorController } from "../../domains/navigation/navigation.controller";

interface Props {
  clipCid: string;
  model: {
    auth: OAuthModel;
    demo: DemoModel;
  };
  operations: {
    auth: OAuthController;
    navigator: NavigatorController;
  };
}

function openRinkebyEtherscan() {
  window.open("https://rinkeby.etherscan.io/", "_blank", "noreferrer");
}

export const Demo = observer(function Demo(props: Props) {
  const classes = useStyles();
  const clipCid = props.clipCid;
  const data = demoStore[clipCid];

  return (
    <Box className={classes.homeWrapper}>
      <Box className={classes.centeredContainer}>
        <Video
          src={props.model.demo.ipfsUri}
          title={`${data.clipAuthor}: ${data.clipTitle}`}
          className={classes.video}
        />
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
                          {data.collector}
                        </Typography>
                        <ExternalLinkIcon />
                      </>
                    }
                    setActive={openRinkebyEtherscan}
                    underline="none"
                    to=""
                    className={classes.baselinePrimaryFlexRow}
                  />
                </Box>
              </Tooltip>
            </Box>
            <Box className={`${classes.withGradient} ${classes.dividerBox}`}></Box>
          </Box>

          <Box className={`${classes.boxMargin} ${classes.mainBox}`}>
            <Box className={classes.withMargin}>
              <MainBoxTitle title="TITLE" />
              <Typography variant="h3" className={`${classes.mainTitleValue} ${classes.openSansFamily}`}>
                {data.clipTitle}
              </Typography>
            </Box>

            <Box className={classes.withMargin}>
              <MainBoxTitle title="AUTHOR" />
              <RouteLink
                child={
                  <>
                    <Typography variant="h4" className={`${classes.mainAuthor} ${classes.openSansFamily}`}>
                      {data.clipAuthor}
                    </Typography>
                    <ExternalLinkIcon />
                  </>
                }
                setActive={() => window.open(data.authorLink, "_blank", "noreferrer")}
                underline="none"
                to=""
                className={classes.baselinePrimaryFlexRow}
              />
            </Box>

            <Box className={classes.withMargin}>
              <MainBoxTitle title="STREAMED" />
              <MainBoxText text={data.streamedDate} />
            </Box>
            <Box className={classes.withMargin}>
              <MainBoxTitle title="MINTED" />
              <Box className={classes.baselinePrimaryFlexRow}>
                <MainBoxText text={data.mintedDate} />
                <RouteLink child={<ExternalLinkIcon />} setActive={openRinkebyEtherscan} underline="none" to="" />
              </Box>
            </Box>
          </Box>
          <Box className={`${classes.withGradient} ${classes.bottomBox}`}>
            <Logo
              textClass={`${classes.boxMargin} ${classes.navLogo}`}
              linkClass={classes.baselinePrimaryFlexRow}
              onClick={props.operations.navigator.goToRoute}
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
    height: "100vh",
    display: "flex",
    margin: "0 4rem",
    flexDirection: "column",
    justifyContent: "center",
  },
  centeredContainer: {
    display: "flex",
    backgroundColor: theme.colors.background_ternary,
  },
  video: {
    width: "80%",
    alignSelf: "center",
  },
  rightPanel: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    justifyContent: "space-between",
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
    [theme.breakpoints.down("md")]: {
      padding: "0.5rem 0",
    },
  },
  collectorTitle: {
    color: theme.colors.text_quaternary,
    fontSize: "clamp(10px, 1vw, 1rem)",
    fontWeight: 700,
    lineHeight: "1rem",
    letterSpacing: "0.1rem",
    [theme.breakpoints.down("md")]: {
      lineHeight: "normal",
    },
  },
  collectorAddress: {
    fontSize: "clamp(12px, 1.2vw, 1.5rem)",
    fontWeight: 400,
    lineHeight: "2rem",
    letterSpacing: 0,
    marginRight: "0.5rem",
    [theme.breakpoints.down("md")]: {
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
    [theme.breakpoints.down("md")]: {
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
    [theme.breakpoints.down("md")]: {
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
  baselinePrimaryFlexRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "baseline",
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

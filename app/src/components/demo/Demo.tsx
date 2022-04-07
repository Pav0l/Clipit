import { Box, CardMedia, Typography } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import ExternalLinkIcon from "../../assets/external-link.svg";
import { demoStore } from "../../domains/app/demo.model";
import { RouteLink } from "../../domains/navigation/components/RouteLink";
import { makeAppStyles } from "../../domains/theme/theme.constants";

interface Props {
  clipCid: string;

  videoUri: string;
}

export const Demo = observer(function Demo(props: Props) {
  const classes = useStyles();
  const data = demoStore[props.clipCid];

  return (
    <Box className={classes.homeWrapper}>
      <Box className={classes.centeredContainer}>
        <CardMedia
          component="video"
          src={props.videoUri}
          title="demo clip"
          className={classes.video}
          controls
          controlsList="nodownload"
        />
        {/* TODO add tooltips */}
        <Box className={classes.rightPanel}>
          <Box className={classes.topBox}>
            <Box className={`${classes.boxMargin} ${classes.collectorBox}`}>
              <Typography variant="h6" className={classes.collectorTitle}>
                COLLECTOR
              </Typography>
              <RouteLink
                child={
                  <>
                    <Typography className={classes.collectorAddress}>{data.collector}</Typography>
                    <ExternalLinkIcon />
                  </>
                }
                setActive={() => window.open("https://rinkeby.etherscan.io/", "_blank", "noreferrer")}
                underline="none"
                to=""
                className={classes.baselinePrimaryFlexRow}
              />
            </Box>
            <Box className={`${classes.withGradient} ${classes.dividerBox}`}></Box>
          </Box>

          <Box className={`${classes.boxMargin} ${classes.mainBox}`}>
            <Box className={classes.withMargin}>
              <MainBoxTitle title="TITLE" />
              <Typography variant="h3" className={classes.mainTitleValue}>
                {data.clipTitle}
              </Typography>
            </Box>

            <Box className={classes.withMargin}>
              <MainBoxTitle title="AUTHOR" />
              <RouteLink
                child={
                  <>
                    <Typography variant="h4" className={classes.mainAuthor}>
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
                <RouteLink
                  child={<ExternalLinkIcon />}
                  setActive={() => window.open("https://rinkeby.etherscan.io/", "_blank", "noreferrer")}
                  underline="none"
                  to=""
                />
              </Box>
            </Box>
          </Box>
          <Box className={`${classes.withGradient} ${classes.bottomBox}`}>
            <Typography variant="h5" className={`${classes.boxMargin} ${classes.navLogo}`}>
              Clipit
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

const MainBoxTitle = (props: { title: string }) => {
  const classes = useStyles();
  return <Typography className={classes.mainTitle}>{props.title}</Typography>;
};

const MainBoxText = (props: { text: string }) => {
  const classes = useStyles();
  return <Typography className={classes.mainText}>{props.text}</Typography>;
};

const bottomHeight = "6vh";
// TODO add media queries
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
  topBox: {},
  collectorBox: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "1.5rem 0",
  },
  collectorTitle: {
    color: theme.colors.text_quaternary,
    fontSize: "clamp(10px, 1vw, 1rem)",
    fontWeight: 700,
    lineHeight: "1rem",
    letterSpacing: "0.1rem",
  },
  collectorAddress: {
    fontSize: "clamp(12px, 1.2vw, 1.5rem)",
    fontWeight: 400,
    lineHeight: "2rem",
    letterSpacing: 0,
    marginRight: "0.5rem",
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
  // TODO reuse
  navLogo: {
    backgroundColor: theme.colors.background_secondary,
    color: theme.colors.text_ternary,
    fontStyle: "italic",
    fontWeight: 900,
    display: "inline-block",
    textAlign: "center",
    clipPath: "polygon(0% 0%,100% 0%,100% 82%,82% 100%,0% 100%)",
    // changed
    /**
     * Dynamically calculate the padding (which makes the height) of the component:
     * height = fontSize + 2 * padding
     * height = 1.2 * bottomHeight
     * ==================================
     * padding = ((1.2 * bottomHeight) - fontSize) / 2
     */
    padding: `calc(((1.2 * ${bottomHeight}) - 1.2rem) / 2) 1.5vw`,
    fontSize: "1.2rem",
    marginTop: "-6px",
  },
}));

import React, { useMemo } from "react";
import { Button, TextField, Typography } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { useInputData } from "../../lib/hooks/useInputData";
import { useHistory } from "react-router-dom";
import { ClipModel } from "../../domains/twitch-clips/clip.model";
import { ClipController } from "../../domains/twitch-clips/clip.controller";
import FullPageLoader from "../loader/FullPageLoader";
import { NftCard } from "../nfts/NftCard";
import { NftModel } from "../../domains/nfts/nft.model";
import SplitContainer from "../container/SplitContainer";
import LoginWithTwitch from "../../domains/twitch-oauth/LoginWithTwitch/LoginWithTwitch";
import { OAuthModel } from "../../domains/twitch-oauth/oauth.model";
import { OAuthController } from "../../domains/twitch-oauth/oauth.controller";
import { makeAppStyles } from "../../domains/theme/theme.constants";
import { NavigatorController } from "../../domains/navigation/navigation.controller";
import { RouteLink } from "../../domains/navigation/components/RouteLink";

interface Props {
  model: {
    clip: ClipModel;
    nft: NftModel;
    auth: OAuthModel;
  };
  operations: {
    clip: ClipController;
    auth: OAuthController;
    navigator: NavigatorController;
  };
}

function Home({ model, operations }: Props) {
  const [inputData, inputHandler, clearInput] = useInputData();

  const history = useHistory();
  const classes = useStyles();

  const randomClip = useMemo(() => model.nft.getRandomMetadata(), [model.nft.metadata]);

  const buttonHandler = (event: React.MouseEvent) => {
    event.preventDefault();

    model.clip.meta.setLoading(true);
    const clipId = operations.clip.validateClipUrl(inputData.trim());

    if (clipId) {
      history.push(`/clips/${clipId}`);
    }
    clearInput();
    model.clip.meta.setLoading(false);
  };

  if (model.clip.meta.isLoading) {
    return <FullPageLoader />;
  }

  return (
    <SplitContainer className={classes.main} dataTestId="home">
      <section className={classes.section}>
        <div className={classes.div}>
          <Typography variant="h2" className={classes.title}>
            clip it
          </Typography>
          <Typography variant="h4" className={classes.description}>
            {/* Show off your great moments by generating immutable NFTs stored on distributed file system */}
            {/* Convert your greatest moments to unique digital collectibles for your fans to collect */}
            Convert your greatest moments to unique digital collectibles for your fans
          </Typography>
          <TextField
            id="clip_url_input"
            label="Login with Twitch or enter your Twitch clip URL:"
            className={classes.input}
            value={inputData}
            onChange={(ev) => inputHandler(ev)}
          ></TextField>
          <div className={classes.buttonWrapper}>
            {model.auth.isLoggedIn ? null : (
              <LoginWithTwitch model={{ auth: model.auth }} operations={operations.auth} />
            )}
            <Button variant="contained" color="primary" className={classes.button} onClick={(ev) => buttonHandler(ev)}>
              Prepare NFT
            </Button>
          </div>
        </div>
      </section>
      {randomClip ? (
        <RouteLink
          to={`/nfts/${randomClip.tokenId}`}
          className={classes.link}
          setActive={operations.navigator.goToRoute}
          child={<NftCard metadata={randomClip} />}
          underline="none"
        />
      ) : (
        <></>
      )}
    </SplitContainer>
  );
}

export default observer(Home);

const useStyles = makeAppStyles((theme) => ({
  title: {
    textAlign: "center",
    cursor: "default",
    color: theme.colors.text_primary,
    textDecoration: "none",
    margin: "1rem 0",
    fontWeight: "bolder",
  },
  input: {
    width: "inherit",
    margin: "1.8rem 0",
    color: theme.colors.text_hint,
  },
  description: {
    maxWidth: "38vw",
    fontWeight: 600,
    color: theme.colors.text_secondary,
  },
  button: {
    alignSelf: "flex-end",
  },
  main: {
    margin: "auto 2rem",
  },
  section: {
    padding: "5rem 0",
    width: "50vw",
  },
  div: {
    width: "35vw",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: "4rem",
  },
  link: {
    textDecoration: "none",
  },
  buttonWrapper: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "inherit",
  },
}));

import "./Clips.css";
import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Box, Typography } from "@material-ui/core";

import ErrorWithRetry from "../../modules/error/Error";
import FullPageLoader from "../../components/loader/FullPageLoader";
import ClipList from "./ClipList";
import { UserStore } from "../../store/user.store";
import { GameModel } from "../twitch-games/game.model";
import { ClipsStore } from "./clips.store";
import { ClipController } from "./clip.controller";
import { GameController } from "../twitch-games/game.controller";
import { UserController } from "../twitch-user/user.controller";

interface Props {
  model: {
    clip: ClipsStore;
    user: UserStore;
    game: GameModel;
  };
  operations: {
    clip: ClipController;
    game: GameController;
    user: UserController;
  };
}

function ClipsContainer({ model, operations }: Props) {
  useEffect(() => {
    if (!model.user.id) {
      operations.user.getUser();
    }
  }, []);

  useEffect(() => {
    if (model.user.id) {
      operations.clip.getClips(model.user.id);
    }
  }, [model.user.id]);

  useEffect(() => {
    if (model.clip.clips.length > 0) {
      operations.game.getGamesForClips(model.clip.gameIds);
    }
  }, [model.clip.clips.length]);

  if (model.user.meta.hasError) {
    return <ErrorWithRetry text={model.user.meta.error}></ErrorWithRetry>;
  }

  if (model.clip.meta.hasError) {
    return <ErrorWithRetry text={model.clip.meta.error}></ErrorWithRetry>;
  }

  // TODO this should not live in a component LOL
  const clipList = model.clip.getUsersClips(model.user.id).map((clip) => {
    return {
      id: clip.id,
      broadcasterName: clip.broadcasterName,
      // TODO this should be in the game.controller with the default value
      game: model.game.getGame(clip.gameId) ?? "game",
      title: clip.title,
      thumbnailUrl: clip.thumbnailUrl,
      viewCount: clip.viewCount
    };
  });

  return (
    <Box>
      <Typography variant="h5" component="h5">
        Your Twitch clips
      </Typography>

      {model.user.meta.isLoading || model.clip.meta.isLoading ? (
        <FullPageLoader />
      ) : (
        <ClipList clipList={clipList} />
      )}
    </Box>
  );
}

export default observer(ClipsContainer);

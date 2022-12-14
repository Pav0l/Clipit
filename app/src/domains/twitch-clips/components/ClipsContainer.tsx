import { useEffect } from "react";
import { observer } from "mobx-react-lite";

import ErrorWithRetry from "../../../components/error/Error";
import FullPageLoader from "../../../components/loader/FullPageLoader";
import { UserModel } from "../../twitch-user/user.model";
import { ClipModel } from "../clip.model";
import { ClipController } from "../clip.controller";
import { GameController } from "../../twitch-games/game.controller";
import { UserController } from "../../twitch-user/user.controller";
import ClipList from "./ClipList";
import { NavigatorController } from "../../navigation/navigation.controller";

interface Props {
  model: {
    clip: ClipModel;
    user: UserModel;
  };
  operations: {
    clip: ClipController;
    game: GameController;
    user: UserController;
    navigator: NavigatorController;
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
      operations.clip.getBroadcasterClips(model.user.id);
    }
  }, [model.user.id]);

  useEffect(() => {
    if (model.clip.clips.length > 0) {
      operations.game.getGamesForClips(model.clip.gameIds);
    }
  }, [model.clip.clips.length]);

  if (model.user.meta.error) {
    return <ErrorWithRetry text={model.user.meta.error.message}></ErrorWithRetry>;
  }

  if (model.clip.meta.error) {
    return <ErrorWithRetry text={model.clip.meta.error.message}></ErrorWithRetry>;
  }

  return (
    <>
      {model.user.meta.isLoading || model.clip.meta.isLoading ? (
        <FullPageLoader />
      ) : (
        <ClipList
          clipList={model.clip.getUsersClips(model.user.id)}
          handleRouteChange={operations.navigator.goToRoute}
        />
      )}
    </>
  );
}

export default observer(ClipsContainer);

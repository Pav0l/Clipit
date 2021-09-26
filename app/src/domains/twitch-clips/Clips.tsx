import "./Clips.css";
import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Box, Typography } from "@material-ui/core";

import { useStore } from "../../store/StoreProvider";
import { TwitchUserService } from "../../domains/twitch-user/twitch-user.service";
import { TwitchClipsService } from "../../domains/twitch-clips/twitch-clips.service";
import { TwitchGameService } from "../../domains/twitch-games/twitch-games.service";
import ErrorWithRetry from "../../modules/error/Error";
import FullPageLoader from "../../components/loader/FullPageLoader";
import ClipList from "./ClipList";

function Clips() {
  const { clipsStore, userStore, gameStore } = useStore();
  const userService = new TwitchUserService(userStore);
  const clipsService = new TwitchClipsService(clipsStore);
  const gamesService = new TwitchGameService(gameStore);

  useEffect(() => {
    if (!userStore.id) {
      userService.getUser();
    }
  }, []);

  useEffect(() => {
    if (userStore.id) {
      clipsService.getClips(userStore.id);
    }
  }, [userStore.id]);

  useEffect(() => {
    if (clipsStore.clips.length > 0) {
      gamesService.getGamesForClips(clipsStore.gameIds);
    }
  }, [clipsStore.clips.length]);

  if (userStore.meta.hasError) {
    return <ErrorWithRetry text={userStore.meta.error}></ErrorWithRetry>;
  }

  if (clipsStore.meta.hasError) {
    return <ErrorWithRetry text={clipsStore.meta.error}></ErrorWithRetry>;
  }

  const clipList = clipsStore.getUsersClips(userStore.id).map((clip) => {
    return {
      id: clip.id,
      broadcasterName: clip.broadcasterName,
      game: gameStore.getGame(clip.gameId) ?? "game",
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

      {userStore.meta.isLoading || clipsStore.meta.isLoading ? (
        <FullPageLoader />
      ) : (
        <ClipList clipList={clipList} />
      )}
    </Box>
  );
}

export default observer(Clips);

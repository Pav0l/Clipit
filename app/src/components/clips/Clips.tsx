import "./Clips.css";
import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import { Box, CircularProgress, Button, Typography } from "@material-ui/core";

import { useStore } from "../../store/StoreProvider";
import { TwitchUserService } from "../../domains/twitch-user/twitch-user.service";
import { TwitchClipsService } from "../../domains/twitch-clips/twitch-clips.service";
import { TwitchGameService } from "../../domains/twitch-games/twitch-games.service";
import { ClipCard } from "../clipCard/ClipCard";

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

  if (userStore.meta.isLoading || clipsStore.meta.isLoading) {
    return (
      <Box className="clips-container with-center-content">
        <CircularProgress />
      </Box>
    );
  }

  if (clipsStore.getUsersClips(userStore.id).length === 0) {
    return (
      <Box className="clips-container with-center-content">
        <Typography variant="h6" component="h6">
          Looks like you don't have any Twitch clips yet...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" component="h5">
        Your Twitch clips
      </Typography>

      <Box className="clips-container">
        {clipsStore.getUsersClips(userStore.id).map((clip, idx) => {
          const { title, gameId, broadcasterName, thumbnailUrl, viewCount } =
            clip;
          return (
            <Link to={`/clips/${clip.id}`} key={idx}>
              <ClipCard
                title={title}
                gameId={gameStore.getGame(gameId) ?? "game"}
                broadcasterName={broadcasterName}
                thumbnailUrl={thumbnailUrl}
                viewCount={viewCount}
                key={idx}
              />
            </Link>
          );
        })}
      </Box>

      <Button
        color="primary"
        // TODO add pagination to request
        onClick={() => clipsService.getClips(userStore.id)}
      >
        Load more...
      </Button>
    </Box>
  );
}

export default observer(Clips);

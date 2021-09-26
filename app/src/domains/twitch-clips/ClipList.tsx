import "./Clips.css";

import { Link } from "react-router-dom";
import { Box, Typography } from "@material-ui/core";

import { ClipCard } from "./ClipCard";

interface Props {
  clipList: Clip[];
  handpePagination?: () => void;
}

interface Clip {
  id: string;
  broadcasterName: string;
  game: string;
  title: string;
  thumbnailUrl: string;
  viewCount: number;
}

function EmptyList() {
  return (
    <Box className="clips-container with-center-content">
      <Typography variant="h6" component="h6">
        Looks like you don't have any Twitch clips yet...
      </Typography>
    </Box>
  );
}

export default function ClipList({ clipList }: Props) {
  return (
    <>
      {clipList.length === 0 ? (
        <EmptyList />
      ) : (
        <Box className="clips-container">
          {clipList.map((clip, idx) => {
            return (
              <Link to={`/clips/${clip.id}`} key={idx}>
                <ClipCard
                  title={clip.title}
                  gameId={clip.game}
                  broadcasterName={clip.broadcasterName}
                  thumbnailUrl={clip.thumbnailUrl}
                  viewCount={clip.viewCount}
                  key={idx}
                />
              </Link>
            );
          })}
        </Box>
      )}

      {/* <Button
      // TODO add pagination to request
        color="primary"
        onClick={() => clipsService.getClips(userStore.id)}
      >
        Load more...
      </Button> */}
    </>
  );
}

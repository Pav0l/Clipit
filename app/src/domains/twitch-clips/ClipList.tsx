import { Link } from "react-router-dom";
import { Box, makeStyles, Typography } from "@material-ui/core";

import { ClipCard } from "./ClipCard";
import VideoList from "../../components/videoList/VideoList";

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
  const classes = useStyles();

  return (
    <Box className={classes.noClipsContainer}>
      <Typography variant="h6" component="h6">
        Looks like you don't have any Twitch Clips yet...
      </Typography>
      {/* TODO - add "create clip" button here that creates clip via twitch API? 
            - or redirects to broadcasters vids or wherever streamers make clips
       */}
    </Box>
  );
}

export default function ClipList({ clipList }: Props) {
  const classes = useStyles();

  return (
    <>
      {clipList.length === 0 ? (
        <EmptyList />
      ) : (
        <VideoList>
          {clipList.map((clip, idx) => {
            return (
              <Link to={`/clips/${clip.id}`} key={idx} className={classes.link}>
                <ClipCard
                  title={clip.title}
                  thumbnailUrl={clip.thumbnailUrl}
                  key={idx}
                />
              </Link>
            );
          })}
        </VideoList>
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

const useStyles = makeStyles(() => ({
  link: {
    textDecoration: "none",
    margin: "1rem"
  },
  noClipsContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: "2rem"
  }
}));

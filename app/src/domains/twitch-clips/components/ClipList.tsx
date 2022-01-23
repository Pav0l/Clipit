import { Link } from "react-router-dom";
import { makeStyles, Typography } from "@material-ui/core";

import { ClipCard } from "./ClipCard";
import VideoList from "../../../components/videoList/VideoList";
import CenteredContainer from "../../../components/container/CenteredContainer";

interface Props {
  clipList: Clip[];
  handpePagination?: () => void;
}

interface Clip {
  id: string;
  title: string;
  thumbnailUrl: string;
}

function EmptyList() {
  return (
    <CenteredContainer>
      <Typography variant="h6" component="h6">
        Looks like you don't have any Twitch Clips yet...
      </Typography>
    </CenteredContainer>
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
  }
}));

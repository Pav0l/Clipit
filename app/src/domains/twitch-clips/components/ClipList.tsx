import { Typography } from "@material-ui/core";

import { ClipCard } from "./ClipCard";
import VideoList from "../../../components/videoList/VideoList";
import CenteredContainer from "../../../components/container/CenteredContainer";
import { makeAppStyles } from "../../theme/theme.constants";
import { RouteLink } from "../../navigation/components/RouteLink";

interface Props {
  clipList: Clip[];
  handleRouteChange: (path: string) => void;
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
        {"Looks like you don't have any Twitch Clips yet..."}
      </Typography>
    </CenteredContainer>
  );
}

export default function ClipList({ clipList, handleRouteChange }: Props) {
  const classes = useStyles();

  return (
    <>
      {clipList.length === 0 ? (
        <EmptyList />
      ) : (
        <VideoList>
          {clipList.map((clip, idx) => {
            return (
              <RouteLink
                to={`/clips/${clip.id}`}
                setActive={handleRouteChange}
                key={idx}
                className={classes.link}
                child={<ClipCard title={clip.title} thumbnailUrl={clip.thumbnailUrl} key={idx} />}
                underline="none"
              />
            );
          })}
        </VideoList>
      )}
    </>
  );
}

const useStyles = makeAppStyles(() => ({
  link: {
    textDecoration: "none",
    margin: "1rem",
  },
}));

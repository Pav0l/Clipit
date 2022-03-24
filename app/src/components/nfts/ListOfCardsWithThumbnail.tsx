import { RouteLink } from "../../domains/navigation/components/RouteLink";
import { Metadata } from "../../domains/nfts/nft.model";
import { makeAppStyles } from "../../domains/theme/theme.constants";
import VideoList from "../videoList/VideoList";
import { CardWithThumbnail } from "./CardWithThumbnail";

interface Props {
  metadata: Metadata[];
  handleRouteChange: (path: string) => void;
}

export default function ListOfCardsWithThumbnail({ metadata, handleRouteChange }: Props) {
  const classes = useStyles();

  return (
    <VideoList>
      {metadata.map((metadata, idx) => (
        <RouteLink
          key={idx}
          to={`/nfts/${metadata.tokenId}`}
          className={classes.link}
          setActive={handleRouteChange}
          child={<CardWithThumbnail key={idx} metadata={metadata} />}
          underline="none"
        />
      ))}
    </VideoList>
  );
}

const useStyles = makeAppStyles(() => ({
  link: {
    textDecoration: "none",
    margin: "1rem",
  },
}));

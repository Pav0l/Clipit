import { makeStyles } from "@material-ui/core";
import { Link } from "react-router-dom";
import { Metadata } from "../../domains/nfts/nft.model";
import VideoList from "../videoList/VideoList";
import { CardWithThumbnail } from "./CardWithThumbnail";

interface Props {
  metadata: Metadata[];
}

export default function ListOfCardsWithThumbnail({ metadata }: Props) {
  const classes = useStyles();

  return (
    <VideoList>
      {metadata.map((metadata, idx) => (
        <Link
          to={`/nfts/${metadata.tokenId}`}
          key={idx}
          className={classes.link}
        >
          <CardWithThumbnail
            key={idx}
            title={metadata.clipTitle}
            // TODO - add Game & Streamer name? (are they not on the clip itself?
            thumbnailUrl={metadata.thumbnailUri}
            description={metadata.description}
            bid={
              metadata.currentBids && metadata.currentBids.length > 0
                ? metadata.currentBids[0]
                : undefined
            }
          />
        </Link>
      ))}
    </VideoList>
  );
}

const useStyles = makeStyles(() => ({
  link: {
    textDecoration: "none",
    margin: "1rem"
  }
}));

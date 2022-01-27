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
        <Link to={`/nfts/${metadata.tokenId}`} key={idx} className={classes.link}>
          <CardWithThumbnail key={idx} metadata={metadata} />
        </Link>
      ))}
    </VideoList>
  );
}

const useStyles = makeStyles(() => ({
  link: {
    textDecoration: "none",
    margin: "1rem",
  },
}));

import { Link, Typography } from "@material-ui/core";
import FileCopyIcon from "@material-ui/icons/FileCopyOutlined";

import { SnackbarController } from "../../domains/snackbar/snackbar.controller";
import { makeAppStyles } from "../../domains/theme/theme.constants";

interface Props {
  tokenId: string;
  operations: {
    snackbar: SnackbarController;
  };
}

export const ExtensionAuctionCreated = ({ tokenId, operations }: Props) => {
  const classes = useStyles();

  const tokenUrl = `${CONFIG.clipItClientUrl}/nfts/${tokenId}`;

  return (
    <div className={classes.container}>
      <Typography component="h5" variant="h5" className={classes.header}>
        Auction is now LIVE! 🎉
      </Typography>

      <Typography>
        You can view Auction details{" "}
        <Link href={tokenUrl} underline="none" target="_blank" rel="noreferrer">
          here
        </Link>{" "}
        or copy the link below for your Twitch Chat.
      </Typography>
      <Typography
        className={classes.url}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(tokenUrl);
            operations.snackbar.sendInfo("Link copied to your clipboard");
          } catch (error) {
            console.log("navigation.clipboard error:", error);
          }
        }}
      >
        {tokenUrl}
        <FileCopyIcon className={classes.icon} />
      </Typography>
    </div>
  );
};

const useStyles = makeAppStyles(() => ({
  container: {
    textAlign: "center",
  },
  header: {
    margin: "1rem 0",
  },
  url: {
    margin: "1rem 0",
    fontSize: "1.2rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  },
  icon: {
    marginLeft: "0.5rem",
    fontSize: "1.2rem",
  },
}));

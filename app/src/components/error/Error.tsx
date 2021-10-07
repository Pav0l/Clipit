import { Box, Typography, Link } from "@material-ui/core";

interface Props {
  text: string;
  withRetry?: boolean;
}

function PleaseTryAgain() {
  return (
    <Box>
      Please{" "}
      <Link href={window.location.href} underline="always">
        try again
      </Link>{" "}
      or {/* TODO implement 'contact us' form */}
      <Link href="#" underline="always">
        contact us
      </Link>
      .
    </Box>
  );
}

function ErrorWithRetry({ text, withRetry }: Props) {
  return (
    <Box
      display="flex"
      alignItems="center"
      width="100%"
      justifyContent="center"
      flexDirection="column"
    >
      <Typography variant="h6">{text}</Typography>
      {withRetry ? <PleaseTryAgain /> : null}
    </Box>
  );
}

export default ErrorWithRetry;

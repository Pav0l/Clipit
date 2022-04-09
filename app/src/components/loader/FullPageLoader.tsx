import { Box, CircularProgress } from "@material-ui/core";

export default function FullPageLoader() {
  return (
    <Box
      display="flex"
      alignItems="center"
      width="100vw"
      height="100vh"
      justifyContent="center"
      flexDirection="column"
      data-testid="full-page-loader"
    >
      <CircularProgress />
    </Box>
  );
}

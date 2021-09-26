import { Box, CircularProgress } from "@material-ui/core";

export default function FullPageLoader() {
  return (
    <Box
      display="flex"
      alignItems="center"
      width="100%"
      justifyContent="center"
      flexDirection="column"
      // TODO fix height
      minHeight="100vh"
    >
      <CircularProgress />
    </Box>
  );
}

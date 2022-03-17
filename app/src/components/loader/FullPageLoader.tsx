import { Box, CircularProgress } from "@material-ui/core";

export default function FullPageLoader() {
  return (
    <Box display="flex" alignItems="center" width="100vw" justifyContent="center" flexDirection="column">
      <CircularProgress />
    </Box>
  );
}

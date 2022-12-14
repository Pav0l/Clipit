import { Box, LinearProgress, Typography } from "@material-ui/core";
import { useEffect, useState } from "react";
import { makeAppStyles } from "../../domains/theme/theme.constants";

interface Props {
  text: string;
  classNames?: string;
}

export default function LinearLoader({ text, classNames }: Props) {
  const classes = useStyles();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        const diff = Math.random() * 2.222222;
        return Math.min(oldProgress + diff, 100);
      });
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <Box className={`${classes.container} ${classNames ? classNames : ""}`}>
      <Typography variant="h6">{text}</Typography>
      <LinearProgress variant="determinate" value={progress} />
    </Box>
  );
}

const useStyles = makeAppStyles(() => ({
  container: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    textAlign: "center",
    margin: "0 1rem",
    width: "48vw",
  },
}));

import { makeStyles, Typography } from "@material-ui/core";

interface Props {
  text: string | JSX.Element;
}

export function Section({ children }: { children: JSX.Element | JSX.Element[] }) {
  const classes = useStyles();

  return <section className={classes.section}>{children}</section>;
}

export function SectionHeader({ text }: Props) {
  return <Typography variant="h6">{text}</Typography>;
}

export function SectionParagraph({ text }: Props) {
  return (
    <Typography variant="body2" component="p">
      {text}
    </Typography>
  );
}

const useStyles = makeStyles(() => ({
  section: {
    margin: "1rem 0",
  },
}));

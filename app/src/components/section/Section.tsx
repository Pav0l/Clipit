import { Typography } from "@material-ui/core";
import { makeAppStyles } from "../../domains/theme/theme.constants";

interface Props {
  text: string | JSX.Element;
  marginTop?: boolean;
}

export function Section({ children }: { children: JSX.Element | JSX.Element[] }) {
  const classes = useStyles();

  return <section className={classes.section}>{children}</section>;
}

export function SectionHeader({ text }: Props) {
  return <Typography variant="h6">{text}</Typography>;
}

export function SectionParagraph({ text, marginTop }: Props) {
  const classes = useStyles();

  return (
    <Typography variant="body2" component="p" className={marginTop ? classes.marginTop : ""}>
      {text}
    </Typography>
  );
}

const useStyles = makeAppStyles(() => ({
  section: {
    margin: "1rem 0",
  },
  marginTop: {
    marginTop: "1rem",
  },
}));

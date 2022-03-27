import { Link as MuiLink } from "@material-ui/core";
import { makeAppStyles } from "../../theme/theme.constants";

interface Props {
  to: string;
  child: string | JSX.Element;
  className: string;
  setActive: (to: string) => void;
  setHovered?: (to?: string) => void;
  underline?: "none" | "hover" | "always";
  dataTestId?: string;
}

export function RouteLink(props: Props) {
  const classes = useStyles();
  return (
    <MuiLink
      underline={props.underline}
      className={`${classes.link} ${props.className}`}
      onClick={() => props.setActive(props.to)}
      onMouseEnter={() => (props.setHovered ? props.setHovered(props.to) : null)}
      onMouseLeave={() => (props.setHovered ? props.setHovered(undefined) : null)}
      data-testid={props.dataTestId ?? ""}
    >
      {props.child}
    </MuiLink>
  );
}

const useStyles = makeAppStyles(() => ({
  link: {
    cursor: "pointer",
  },
}));

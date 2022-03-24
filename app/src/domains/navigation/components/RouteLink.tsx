import { Link as MuiLink } from "@material-ui/core";

interface Props {
  to: string;
  child: string | JSX.Element;
  className: string;
  setActive: (to: string) => void;
  setHovered?: (to?: string) => void;
  underline?: "none" | "hover" | "always";
}

export function RouteLink(props: Props) {
  return (
    <MuiLink
      underline={props.underline}
      className={props.className}
      onClick={() => props.setActive(props.to)}
      onMouseEnter={() => (props.setHovered ? props.setHovered(props.to) : null)}
      onMouseLeave={() => (props.setHovered ? props.setHovered(undefined) : null)}
    >
      {props.child}
    </MuiLink>
  );
}

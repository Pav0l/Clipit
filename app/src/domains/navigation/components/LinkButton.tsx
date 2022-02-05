import { Link } from "react-router-dom";
import { Link as MuiLink } from "@material-ui/core";

import { AppRoute } from "../../../lib/constants";

interface Props {
  to: AppRoute;
  text: string | JSX.Element;
  className: string;
  setActive: (to: AppRoute) => void;
  underline?: "none" | "hover" | "always";
}

export function LinkButton(props: Props) {
  return (
    <MuiLink
      component={Link}
      to={props.to}
      underline={props.underline}
      className={props.className}
      onClick={() => props.setActive(props.to)}
    >
      {props.text}
    </MuiLink>
  );
}

import { Typography } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { AppRoute } from "../../../lib/constants";
import { NavigationModel } from "../navigation.model";
import { makeAppStyles } from "../../theme/theme.constants";
import { NavigatorController } from "../navigation.controller";
import { RouteLink } from "./RouteLink";

interface Props {
  operations: {
    navigator: NavigatorController;
  };
  model: {
    navigation: NavigationModel;
  };
  to: AppRoute;
  text: string;
  dataTestId?: string;
}

export default observer(function NavLink({ to, text, model, operations, dataTestId }: Props) {
  const classes = useStyles();
  const buildClassName = (to: AppRoute) => {
    const baseClass = classes.li;
    // NOTE: click events also trigger "mouse enter/leave" events
    if (model.navigation.hoveredRoute) {
      return `${baseClass} ${model.navigation.hoveredRoute === to ? classes.active : ""}`;
    }

    return `${baseClass} ${model.navigation.activeRoute === to ? classes.active : ""}`;
  };

  return (
    <RouteLink
      to={to}
      child={<Typography>{text}</Typography>}
      setActive={operations.navigator.goToRoute}
      setHovered={model.navigation.setHoveredRoute}
      className={buildClassName(to)}
      underline="none"
      dataTestId={dataTestId}
    />
  );
});

const useStyles = makeAppStyles((theme) => ({
  li: {
    display: "block",
    padding: "0.5rem 1rem",
    color: theme.colors.text_secondary,
    borderBottom: `1px solid ${theme.colors.border_secondary}`,
    "&:hover": {
      borderBottom: `1px solid ${theme.colors.border_primary}`,
    },
  },
  active: {
    borderBottom: `1px solid ${theme.colors.border_primary}`,
  },
}));

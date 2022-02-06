import { makeStyles, Typography } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { AppRoute } from "../../../lib/constants";
import { NavigationModel } from "../navigation.model";
import { LinkButton } from "../../../components/linkButton/LinkButton";

interface Props {
  model: {
    navigation: NavigationModel;
  };
  to: AppRoute;
  text: string;
}

export default observer(function NavLink({ to, text, model }: Props) {
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
    <LinkButton
      to={to}
      text={<Typography>{text}</Typography>}
      setActive={model.navigation.setActiveRoute}
      setHovered={model.navigation.setHoveredRoute}
      className={buildClassName(to)}
      underline="none"
    />
  );
});

const useStyles = makeStyles((theme) => ({
  li: {
    display: "block",
    padding: "0.5rem 1rem",
    color: theme.palette.text.primary,
    borderBottom: "1px solid white",
    "&:hover": {
      borderBottom: `1px solid black`,
    },
  },
  active: {
    borderBottom: "1px solid black",
  },
}));

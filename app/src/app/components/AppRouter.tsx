import { observer } from "mobx-react-lite";
import Route from "route-parser";

import { AppRoute } from "../../lib/constants";
import Terms from "../../components/terms/Terms";
import { AppModel } from "../app.model";
import { AppOperations } from "../../init";
import { makeAppStyles } from "../../domains/theme/theme.constants";
import { Box } from "@material-ui/core";
import Navbar from "../../domains/navigation/components/Navbar";
import { AppHome } from "../../components/home/AppHome";
import { ClipContainer } from "../../domains/twitch-clips/components/ClipDetailContainer";
import ClipsContainer from "../../domains/twitch-clips/components/ClipsContainer";

interface Props {
  model: AppModel;
  operations: AppOperations;
}

export const AppRouter = observer(function RouterX({ model, operations }: Props) {
  const classes = useStyles();
  let withNavbar = true;

  let content: JSX.Element | null = null;

  switch (model.navigation.activeRoute) {
    case AppRoute.TERMS:
      withNavbar = false;
      content = <Terms logoOnClick={operations.navigator.goToRoute} />;
      break;

    case AppRoute.HOME:
      content = (
        <AppHome
          model={{ auth: model.auth, clip: model.clip }}
          operations={{
            auth: operations.auth,
            navigator: operations.navigator,
          }}
        />
      );
      break;

    case AppRoute.CLIPS:
      content = (
        <ClipsContainer
          model={{
            clip: model.clip,
            user: model.user,
          }}
          operations={{
            clip: operations.clip,
            user: operations.user,

            game: operations.game,
            navigator: operations.navigator,
          }}
        />
      );
  }

  if (content === null) {
    // TODO refactor activeRoute to appRoute (but have to figure out how to replace model.goToRoute() )
    if (model.navigation.activeRoute?.startsWith(AppRoute.CLIPS)) {
      const route = new Route<{ clipId: string }>(AppRoute.CLIP);
      const matched = route.match(model.navigation.activeRoute);

      if (matched !== false) {
        content = (
          <ClipContainer
            clipId={matched.clipId}
            model={{
              clip: model.clip,
              user: model.user,
              game: model.game,
              web3: model.web3,
              nft: model.nft,
              mint: model.mint,
            }}
            operations={{
              ui: operations.ui,
              clip: operations.clip,
              user: operations.user,
              game: operations.game,
            }}
          />
        );
      }
    }
  }

  // app is still null -> must be some unknown route, just go home
  if (content === null) {
    content = (
      <AppHome
        model={{ auth: model.auth, clip: model.clip }}
        operations={{
          auth: operations.auth,
          navigator: operations.navigator,
        }}
      />
    );
  }

  return (
    <Box className={classes.wrapper}>
      {withNavbar && (
        <Navbar
          model={{
            auth: model.auth,
            navigation: model.navigation,
            web3: model.web3,
          }}
          operations={{
            auth: operations.auth,
            navigator: operations.navigator,
            web3: operations.web3,
            snackbar: operations.snackbar,
          }}
          isDevelopment={false}
        />
      )}
      {content}
    </Box>
  );
});

const useStyles = makeAppStyles(() => ({
  wrapper: {
    minHeight: "100vh",
  },
}));

import { Button } from "@material-ui/core";
import "./LoginWithTwitch.css";

function LoginWithTwitch({ redirect }: { redirect: () => string }) {
  return (
    <Button onClick={() => (location.href = redirect())}>
      Login with Twitch
    </Button>
  );
}

export default LoginWithTwitch;

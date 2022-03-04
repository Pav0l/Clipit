import { AppError } from "../../../lib/errors/errors";
import { parseJwt } from "../../../lib/jwt/jwt";
import { TwitchJWT } from "../../../lib/twitch-extension/interfaces";

export class BroadcasterAuthService {
  verifyBroadcaster(token: string): { userId: string } {
    const payload = parseJwt<TwitchJWT>(token);

    if (!payload) {
      throw new AppError({ msg: "Invalid token", type: "twitch-ext-auth", isDevOnly: true });
    }

    // only broadcaster can use this mode
    if (payload.role !== "broadcaster") {
      throw new AppError({ msg: "Only broadcaster can use this part of the Extension", type: "twitch-ext-auth" });
    }

    if (!payload.user_id) {
      throw new AppError({
        msg: "You need to allow the Extension to link your identity, so that we can verify your identity and ownership of Clips before minting them",
        type: "twitch-ext-auth",
      });
    }

    return { userId: payload.user_id };
  }
}

export interface ColorTokens {
  // Twitch color tokens
  twitch_bg_primary: string;
  twitch_bg_hover: string;
  twitch_bg_secondary: string;
  twitch_bg_secondary_hover: string;
  twitch_text_primary: string;
  twitch_text_secondary: string;

  text_primary: string;
  text_secondary: string;
  text_ternary: string;
  text_hint: string;
  background_primary: string;
  background_secondary: string;
  border_primary: string;
  border_secondary: string;
}

const twitch_purple = "#9147ff";
const twitch_purple_hover = "#772ce8";

const blue_primary = "#2176FF";
const gray_dark = "#31393C";

const white = "#fff";
const white_15 = "rgba(255, 255, 255, 0.15)";
const white_20 = "rgba(255, 255, 255, 0.2)";

const black = "#000";
const black_05 = "rgba(0, 0, 0, 0.05)";
const black_10 = "rgba(0, 0, 0, 0.1)";
const black_38 = "rgba(0, 0, 0, 0.38)";
const black_54 = "rgba(0, 0, 0, 0.54)";

export const lightColors: ColorTokens = {
  twitch_bg_primary: twitch_purple,
  twitch_bg_hover: twitch_purple_hover,
  twitch_bg_secondary: black_05,
  twitch_bg_secondary_hover: black_10,
  twitch_text_primary: white,
  twitch_text_secondary: black,

  text_primary: blue_primary,
  text_secondary: gray_dark,
  text_ternary: black_54,
  text_hint: black_38,

  background_primary: white,
  background_secondary: white,

  border_primary: black,
  border_secondary: white,
};

// TODO setup colors for dark theme
export const darkColors: ColorTokens = {
  twitch_bg_primary: twitch_purple,
  twitch_bg_hover: twitch_purple_hover,
  twitch_bg_secondary: white_15,
  twitch_bg_secondary_hover: white_20,
  twitch_text_primary: white,
  twitch_text_secondary: white,

  text_primary: blue_primary,
  text_secondary: white,
  text_ternary: white,
  text_hint: white,

  // TODO tmp "dark mode" background color
  background_primary: "rgb(24, 24, 27)",
  background_secondary: black_54,

  border_primary: white,
  border_secondary: "rgb(24, 24, 27)",
};

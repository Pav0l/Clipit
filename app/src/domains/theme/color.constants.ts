export interface ColorTokens {
  // Twitch color tokens
  twitch_bg_primary: string;
  twitch_bg_hover: string;
  twitch_bg_secondary: string;
  twitch_bg_secondary_hover: string;
  twitch_bg_ternary: string;
  twitch_bg_ternary_hover: string;
  twitch_text_primary: string;
  twitch_text_secondary: string;

  text_primary: string;
  text_secondary: string;
  text_ternary: string;
  text_quaternary: string;
  text_fifth: string;
  text_hint: string;
  background_primary: string;
  background_secondary: string;
  background_ternary: string;
  border_primary: string;
  border_secondary: string;
}

const twitch_purple = "#9147ff";
const twitch_purple_hover = "#772ce8";

const blue_primary = "#2176FF";
const gray_90 = "#E5E5E5";

const white = "#fff";
const white_15 = "rgba(255, 255, 255, 0.15)";
const white_20 = "rgba(255, 255, 255, 0.2)";

const black = "#000";
const black_05 = "rgba(0, 0, 0, 0.05)";
const black_10 = "rgba(0, 0, 0, 0.1)";
const black_38 = "rgba(0, 0, 0, 0.38)";
const black_40 = "rgba(0, 0, 0, 0.4)";
const black_54 = "rgba(0, 0, 0, 0.54)";
const black_111111 = "#111111";

const clipit_green = "#C4E6CA";
const clipit_gray = "#C4D0D2";

export const lightColors: ColorTokens = {
  twitch_bg_primary: white,
  twitch_bg_hover: twitch_purple_hover,
  twitch_bg_secondary: black_111111,
  twitch_bg_secondary_hover: black_10,
  twitch_bg_ternary: black_05,
  twitch_bg_ternary_hover: black_10,
  twitch_text_primary: twitch_purple,
  twitch_text_secondary: white,

  text_primary: black_111111,
  text_secondary: black_40,
  text_ternary: white,
  text_quaternary: clipit_green,
  text_fifth: clipit_gray,
  text_hint: black_38,

  background_primary: gray_90,
  background_secondary: black,
  background_ternary: white,

  border_primary: black,
  border_secondary: white,
};

// TODO setup colors for dark theme
export const darkColors: ColorTokens = {
  twitch_bg_primary: twitch_purple,
  twitch_bg_hover: twitch_purple_hover,
  twitch_bg_secondary: white_15,
  twitch_bg_secondary_hover: white_20,
  twitch_bg_ternary: black_111111, // TODO
  twitch_bg_ternary_hover: black_10, // TODO
  twitch_text_primary: white,
  twitch_text_secondary: white,

  text_primary: blue_primary,
  text_secondary: white,
  text_ternary: white,
  text_quaternary: white,
  text_fifth: white,
  text_hint: white,

  // TODO tmp "dark mode" background color
  background_primary: "rgb(24, 24, 27)",
  background_secondary: black_54,
  background_ternary: black_54,

  border_primary: white,
  border_secondary: "rgb(24, 24, 27)",
};

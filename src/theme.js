import { extendTheme } from "@chakra-ui/react";
import { createBreakpoints } from "@chakra-ui/theme-tools";

const fonts = { mono: `'Menlo', monospace` };

const breakpoints = createBreakpoints({
  sm: "40em",
  md: "52em",
  lg: "64em",
  xl: "80em",
});

const theme = extendTheme({
  semanticTokens: {
    colors: {
      text: {
        default: "#ade3b8",
      },
      heroGradientStart: {
        default: "#7928CA",
      },
      heroGradientEnd: {
        default: "#FF0080",
      },
    },
    radii: {
      button: "12px",
    },
  },
  colors: {
    black: "#000000",
  },
  fonts,
  breakpoints,
});

export default theme;

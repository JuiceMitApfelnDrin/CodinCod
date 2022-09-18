import { extendTheme } from "@chakra-ui/react";

const fonts = { mono: `'Menlo', monospace` };

const theme = extendTheme({
  breakpoints: {
    sm: "40em",
    md: "52em",
    lg: "64em",
    xl: "80em",
  },
  config: { useSystemColorMode: false },
  semanticTokens: {
    colors: {
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
  fonts,
});

export default theme;

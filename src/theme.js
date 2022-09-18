import { extendTheme } from "@chakra-ui/react";

const fonts = { mono: `'Menlo', monospace` };

const theme = extendTheme({
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

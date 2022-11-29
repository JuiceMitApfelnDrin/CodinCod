import { ChakraProvider } from "@chakra-ui/react";
import EditorProvider from "providers/EditorProvider";
import UserProvider from "providers/UserProvider";
import theme from "../theme";

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <UserProvider>
        <EditorProvider>
          <Component {...pageProps} />
        </EditorProvider>
      </UserProvider>
    </ChakraProvider>
  );
}

export default MyApp;

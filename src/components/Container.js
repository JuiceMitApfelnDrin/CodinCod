import { Flex } from "@chakra-ui/react";

export const Container = (props) => (
  <Flex
    direction="column"
    alignItems="center"
    justifyContent="flex-start"
    minHeight="100vh"
    color="white"
    transition="all 0.15s ease-out"
    {...props}
  />
);

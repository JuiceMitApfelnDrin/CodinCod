import { Flex, FlexProps } from "@chakra-ui/react";

export const Header = (props) => (
  <Flex
    width="full"
    justify="space-between"
    direction="row"
    as="header"
    px="1rem"
    py="1rem"
    {...props}
  />
);

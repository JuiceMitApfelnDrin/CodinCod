import { Flex, FlexProps } from "@chakra-ui/react";

export const Header = (props: FlexProps) => (
  <Flex justify="space-between" direction="row" as="header" px="1rem" py="1rem" {...props} />
);

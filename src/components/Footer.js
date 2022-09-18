import { Button, Flex, HStack } from "@chakra-ui/react";

import Link from "next/link";
import externalUrls from "utils/constants/externalUrls";

export const Footer = () => (
  <HStack
    as="footer"
    width="full"
    align="center"
    direction="row"
    px="1rem"
    py="1rem"
    bg="black"
    spacing="1rem"
  >
    <Link
      as="a"
      href={externalUrls.GITHUB}
      target="_blank"
      rel="noreferrer noopener"
    >
      <Button
        size="sm"
        leftIcon=""
        bg="gray.700"
        _hover={{
          bg: "purple.800",
        }}
        variant="solid"
      >
        Github
      </Button>
    </Link>
    <Link
      as="a"
      href={externalUrls.DISCORD}
      target="_blank"
      rel="noreferrer noopener"
    >
      <Button
        size="sm"
        leftIcon=""
        bg="gray.700"
        _hover={{
          bg: "purple.800",
        }}
        variant="solid"
      >
        Discord
      </Button>
    </Link>
  </HStack>
);

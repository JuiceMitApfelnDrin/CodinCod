import { Button, HStack } from "@chakra-ui/react";

import EXTERNAL_URLS from "utils/constants/externalUrls";
import Link from "next/link";

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
    height="7vh"
  >
    <Link
      as="a"
      href={EXTERNAL_URLS.GITHUB}
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
      href={EXTERNAL_URLS.DISCORD}
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

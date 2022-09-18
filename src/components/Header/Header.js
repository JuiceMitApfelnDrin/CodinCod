import { Flex, HStack } from "@chakra-ui/react";

import HeaderItem from "./partials/HeaderItem";
import Link from "next/link";
import { ProfileMenu } from "./partials/ProfileMenu";
import { SearchInput } from "components/Input/SearchInput";
import urls from "utils/constants/urls";

export const Header = () => (
  <Flex
    width="full"
    justify="space-between"
    align="center"
    direction="row"
    as="header"
    px="1rem"
    py="1rem"
    bg="black"
    height="7vh"
  >
    <HStack>
      <Link href={urls.HOME}>GameCodin</Link>
      <HeaderItem
        label="Play"
        options={[
          { href: "/newGame", label: "Host a game" },
          { href: "/clash", label: "Code clash" },
        ]}
      />
      <HeaderItem
        label="Community"
        options={[
          { href: "/leaderboard", label: "Leaderboard" },
          { href: "/forum", label: "Forum" },
          { href: urls.BLOG, label: "Blog" },
        ]}
      />
    </HStack>
    <div>
      <SearchInput onChange={(e) => console.log(e.target.value)} />
    </div>
    <ProfileMenu name="Dan Abrahmov" src="https://bit.ly/dan-abramov" />
  </Flex>
);

import { Flex, HStack } from "@chakra-ui/react";

import { BellIcon } from "@chakra-ui/icons";
import HeaderItem from "./partials/HeaderItem";
import Link from "next/link";
import { NotificationMenu } from "./partials/NotificationMenu";
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
    <HStack spacing="1rem">
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
          { href: urls.LEADERBOARD, label: "Leaderboard" },
          { href: urls.FORUM, label: "Forum" },
          { href: urls.BLOG, label: "Blog" },
        ]}
      />
    </HStack>
    <div>
      <SearchInput onChange={(e) => console.log(e.target.value)} />
    </div>
    <HStack spacing="2rem">
      <NotificationMenu />
      <ProfileMenu name="Dan Abrahmov" src="https://bit.ly/dan-abramov" />
    </HStack>
  </Flex>
);

import { Flex, HStack } from "@chakra-ui/react";

import HeaderItem from "./partials/HeaderItem";
import Link from "next/link";
import { NotificationMenu } from "./partials/NotificationMenu";
import { ProfileMenu } from "./partials/ProfileMenu";
import { SearchInput } from "components/Input/SearchInput";
import debounce from "lodash.debounce";
import urls from "constants/urls";
import { useState } from "react";

export const Header = () => {
  const [username, setUsername] = useState("");

  /* FIXME:
  - fetch users by username and display them 
  - then make them clickable and navigatable
  */
  const fetchUsersWithUsername = debounce(async (value) => {
    let response = null;
    if (value)
      response = await fetch("http://localhost:8080/users?username=" + value);
  }, 500);

  return (
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
          options={[{ href: "/newGame", label: "Host a game" }]}
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
        <SearchInput
          value={username}
          onChange={(e) => {
            fetchUsersWithUsername(e.target.value);
            setUsername(e.target.value);
          }}
        />
      </div>
      <HStack spacing="2rem">
        <NotificationMenu />
        <ProfileMenu name="Dan Abrahmov" src="https://bit.ly/dan-abramov" />
      </HStack>
    </Flex>
  );
};

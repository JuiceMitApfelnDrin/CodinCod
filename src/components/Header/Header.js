import { BACKEND_URLS, URLS } from "constants/urls";
import { Flex, HStack } from "@chakra-ui/react";
import { useCallback, useContext, useState } from "react";

import HeaderItem from "./partials/HeaderItem";
import Link from "next/link";
import { NotificationMenu } from "./partials/NotificationMenu";
import { ProfileMenu } from "./partials/ProfileMenu";
import { SearchInput } from "components/Header/partials/SearchInput";
import { UserContext } from "providers/UserProvider";
import axios from "axios";
import debounce from "lodash.debounce";

export const Header = () => {
  const [searchedUsername, setSearchedUsername] = useState("");
  const [searchedUsers, setSearchedUsers] = useState([]);
  const { id: loggedInUserId, username, avatar } = useContext(UserContext);

  const fetchUsersWithUsername = useCallback(
    debounce((value) => {
      if (value) {
        axios
          .get(BACKEND_URLS.USERS_BY_NICKNAME + value)
          .then(({ data: USERS_BY_SUBSTRING_IN_NICKNAME }) =>
            setSearchedUsers(USERS_BY_SUBSTRING_IN_NICKNAME)
          );
      }
    }, 750),
    []
  );

  const profileMenuOptions = [
    { icon: "", label: "Profile", href: URLS.PROFILE + loggedInUserId },
    { icon: "", label: "Inbox", href: URLS.INBOX },
    { icon: "", label: "Preferences", href: URLS.PREFERENCES },
    { icon: "", label: "Sign out", href: URLS.SIGN_OUT },
  ];

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
        <Link href={URLS.HOME}>GameCodin</Link>
        <HeaderItem
          label="Play"
          options={[{ href: "/newGame", label: "Host a game" }]}
        />
        <HeaderItem
          label="Community"
          options={[
            { href: URLS.LEADERBOARD, label: "Leaderboard" },
            { href: URLS.FORUM, label: "Forum" },
            { href: URLS.BLOG, label: "Blog" },
          ]}
        />
      </HStack>
      <div>
        <SearchInput
          value={searchedUsername}
          onChange={(e) => {
            fetchUsersWithUsername(e.target.value);
            setSearchedUsername(e.target.value);
          }}
          list={searchedUsers}
        />
      </div>
      <HStack spacing="2rem">
        <NotificationMenu />
        <ProfileMenu
          name={username}
          src={avatar}
          menuOptions={profileMenuOptions}
        />
      </HStack>
    </Flex>
  );
};

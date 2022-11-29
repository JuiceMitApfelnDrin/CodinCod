import { createContext, useMemo } from "react";

import EXTERNAL_URLS from "utils/constants/externalUrls";

export const UserContext = createContext({});

const UserProvider = ({ children }) => {
  /* will eventually become a userProvider :) */
  // a user provider holds the user object/information
  // any userInformation will be retrieved from this component
  // e.g.: id, name, profilePicture, ...

  const following = [];

  const isFollowing = (id) => {
    return following.includes(id);
  };

  const context = useMemo(() => {
    return {
      id: "6349bf55d0e1e15a1c20c832",
      username: "Dan Abrahmov",
      location: "Thailand",
      avatar: "https://bit.ly/dan-abramov",
      notifications: [
        { text: "Gorn invited you to a game", type: "gameinvite" },
        { text: "Gorn invited you to a game", type: "gameinvite" },
        { text: "Gorn invited you to a game", type: "gameinvite" },
        { text: "Gorn invited you to a game", type: "gameinvite" },
        { text: "Gorn invited you to a game", type: "gameinvite" },
        { text: "Gorn invited you to a game", type: "gameinvite" },
      ],
      isFollowing,
      socials: [
        { text: "Discord", url: EXTERNAL_URLS.DISCORD },
        { text: "Github", url: EXTERNAL_URLS.GITHUB },
      ],
    };
  }, []);

  return (
    <UserContext.Provider value={context}>{children}</UserContext.Provider>
  );
};

export default UserProvider;

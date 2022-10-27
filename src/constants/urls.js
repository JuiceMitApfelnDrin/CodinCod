/*
 ----------------------------------
 Frontend urls
 ----------------------------------
*/
export const URLS = {
  // header URLS
  HOME: "/",
  PROFILE: "/profile/",
  INBOX: "/inbox/",
  SIGNOUT: "/signout/",

  // community URLS
  BLOG: "/community/blog/",
  FORUM: "/community/forum/",
  LEADERBOARD: "/community/leaderboard/",

  // account URLS
  PREFERENCES: "/account/preferences/",
};

/*
 ----------------------------------
 Backend urls
 ----------------------------------
*/
const BASE_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
export const BACKEND_URLS = {
  users: BASE_BACKEND_URL + "users",
  usersByUsername: BASE_BACKEND_URL + "users?username=",
  register: BASE_BACKEND_URL + "register",
};

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
  LOGIN: "/login/",
  REGISTER: "/register/",

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
  USERS: BASE_BACKEND_URL + "users",
  USERS_BY_NICKNAME: BASE_BACKEND_URL + "users?search_by_nickname=",
  USER_BY_NICKNAME: BASE_BACKEND_URL + "users?nickname=",
  REGISTER: BASE_BACKEND_URL + "register",
  LOGIN: BASE_BACKEND_URL + "login",
};

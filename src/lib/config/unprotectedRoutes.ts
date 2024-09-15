import { frontendUrls, type FrontendUrl } from "types";

export const unProtectedRoutes: FrontendUrl[] = [
	frontendUrls.ROOT,
	frontendUrls.REGISTER,
	frontendUrls.LOGIN,
	frontendUrls.LEARN,
	frontendUrls.PUZZLES
] as const;

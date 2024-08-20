import { LoginResponse } from "types";

export function isAuthenticated(user: any): user is LoginResponse {
	return user && typeof user.userId === "string";
}

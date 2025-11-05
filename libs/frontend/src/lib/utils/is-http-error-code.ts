import { httpResponseCodes } from "$lib/types";

export function isHttpErrorCode(status: number) {
	return status >= httpResponseCodes.CLIENT_ERROR.BAD_REQUEST;
}

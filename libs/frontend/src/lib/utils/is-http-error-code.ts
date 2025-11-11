import { httpResponseCodes } from "$lib/types/core/common/enum/http-response-codes.js";

export function isHttpErrorCode(status: number) {
	return status >= httpResponseCodes.CLIENT_ERROR.BAD_REQUEST;
}

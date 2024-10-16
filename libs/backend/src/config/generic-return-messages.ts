import { httpResponseCodes } from "types";

export const genericReturnMessages = {
	[httpResponseCodes.CLIENT_ERROR.BAD_REQUEST]: {
		IS_INVALID: "is invalid",
		CONTAINS_INVALID_DATA: "contains invalid data"
	},
	[httpResponseCodes.SUCCESSFUL.OK]: {
		WAS_FOUND: "was found"
	},
	[httpResponseCodes.CLIENT_ERROR.NOT_FOUND]: {
		COULD_NOT_BE_FOUND: "couldn't be found"
	},
	[httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR]: {
		WENT_WRONG: "went wrong"
	}
} as const;

export const userProperties = {
	USERNAME: "username"
};

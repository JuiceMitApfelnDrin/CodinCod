import { FastifyReply } from "fastify";
import { isUsername } from "types";
import User from "@/models/user/user.js";
import type { Document } from "mongoose";
import type { UserEntity } from "types";
import {
	sendValidationError,
	sendNotFoundError,
	handleAndSendError
} from "./error.helpers.js";

type UserDocument = Document & UserEntity;

export function validateUsername(
	username: string,
	reply: FastifyReply,
	path?: string
): boolean {
	if (!isUsername(username)) {
		sendValidationError(
			reply,
			"Invalid username format",
			{ username: "Username format is invalid" },
			path
		);

		return false;
	}

	return true;
}

export async function findUserByUsername(
	username: string,
	reply: FastifyReply,
	path?: string
): Promise<UserDocument | null> {
	try {
		const user = await User.findOne({ username });

		if (!user) {
			sendNotFoundError(
				reply,
				`User with username "${username}" not found`,
				"user",
				path
			);
			return null;
		}

		return user;
	} catch (error) {
		handleAndSendError(reply, error, path);
		return null;
	}
}

export async function findUserById(
	userId: string,
	reply: FastifyReply,
	path?: string
): Promise<UserDocument | null> {
	try {
		const user = await User.findById(userId);

		if (!user) {
			sendNotFoundError(
				reply,
				`User with id "${userId}" not found`,
				"user",
				path
			);
			return null;
		}

		return user;
	} catch (error) {
		handleAndSendError(reply, error, path);
		return null;
	}
}

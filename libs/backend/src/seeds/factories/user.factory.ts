import { faker } from "@faker-js/faker";
import User, { UserDocument } from "../../models/user/user.js";
import { userRole, UserRole } from "types";
import { Types } from "mongoose";

export interface UserFactoryOptions {
	role?: UserRole;
	username?: string;
	email?: string;
	reportCount?: number;
	banCount?: number;
}

/**
 * Create a single user with realistic data
 */
export async function createUser(
	options: UserFactoryOptions = {}
): Promise<Types.ObjectId> {
	const username = options.username || faker.internet.username().toLowerCase();
	const email =
		options.email ||
		faker.internet.email({ firstName: username }).toLowerCase();

	const userData: Partial<UserDocument> = {
		username,
		email,
		password: "TestPassword123!", // Will be hashed by pre-save hook
		role: options.role || userRole.USER,
		reportCount: options.reportCount ?? faker.number.int({ min: 0, max: 5 }),
		banCount: options.banCount ?? faker.number.int({ min: 0, max: 2 }),
		profile: {
			bio: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.6 }),
			picture: faker.helpers.maybe(() => faker.image.avatar(), { probability: 0.4 }),
			location: faker.helpers.maybe(() => faker.location.city(), {
				probability: 0.5
			}),
			socials: faker.helpers.maybe(() => [faker.internet.url()], {
				probability: 0.3
			})
		}
	};

	const user = new User(userData);
	await user.save();

	return user._id as Types.ObjectId;
}

/**
 * Create multiple users with various roles
 * 
 * Always creates:
 * - 1 test user (username: "testuser", email: "test@codincod.com", password: "TestPassword123!")
 * - 2-3 moderators (username: "moderator1", etc.)
 * - Remaining users with random data
 */
export async function createUsers(count: number): Promise<Types.ObjectId[]> {
	const userIds: Types.ObjectId[] = [];

	// Create test user with known credentials
	userIds.push(
		await createUser({
			username: "codincoder",
			email: "codincoder@codincod.com",
			role: userRole.USER,
			reportCount: 0,
			banCount: 0
		})
	);

	// Create 2-3 moderators
	const moderatorCount = faker.number.int({ min: 2, max: 3 });
	for (let i = 0; i < moderatorCount; i++) {
		userIds.push(
			await createUser({
				username: `moderator${i + 1}`,
				email: `moderator${i + 1}@codincod.com`,
				role: userRole.MODERATOR,
				reportCount: 0,
				banCount: 0
			})
		);
	}

	// Create regular users
	const regularUserCount = count - userIds.length;
	for (let i = 0; i < regularUserCount; i++) {
		userIds.push(await createUser());
	}

	return userIds;
}

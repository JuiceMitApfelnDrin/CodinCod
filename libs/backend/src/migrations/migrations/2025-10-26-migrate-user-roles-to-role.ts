import { Migration } from "../framework/migration.interface.js";
import User from "../../models/user/user.js";
import { DEFAULT_USER_ROLE } from "types";

interface OldUser {
	_id: any;
	roles?: string[];
	role?: string;
}

/**
 * Migration: Convert user roles array to single role
 *
 * This migration:
 * 1. Finds users with the old 'roles' array field
 * 2. Takes the first role from the array (or uses default if empty)
 * 3. Sets it as the new 'role' string field
 * 4. Removes the old 'roles' array field
 */
export class MigrateUserRolesToRoleMigration implements Migration {
	name = "2025-10-26-migrate-user-roles-to-role";
	description =
		"Migrate user 'roles' array field to singular 'role' string field";

	async up(): Promise<void> {
		console.log("\n👥 Migrating User roles to role...");

		// Find users that still have the old 'roles' array field
		const users = (await User.find({
			roles: { $exists: true }
		}).lean()) as unknown as OldUser[];

		console.log(`   Found ${users.length} users to migrate`);

		let migrated = 0;
		let skipped = 0;

		for (const user of users) {
			if (!user.roles || !Array.isArray(user.roles)) {
				skipped++;
				continue;
			}

			const newRole = user.roles.length > 0 ? user.roles[0] : DEFAULT_USER_ROLE;

			await User.findByIdAndUpdate(user._id, {
				$set: { role: newRole },
				$unset: { roles: "" }
			});

			migrated++;
		}

		console.log(`   ✓ Migrated ${migrated} users (${skipped} skipped)`);
	}

	async down(): Promise<void> {
		console.log("\n👥 Rolling back User role to roles...");

		// Find users with the singular 'role' field
		const users = await User.find({
			role: { $exists: true }
		}).lean();

		console.log(`   Found ${users.length} users to rollback`);

		let rolledBack = 0;

		for (const user of users) {
			const currentRole = (user).role;

			if (!currentRole) {
				continue;
			}

			// Convert singular role to array
			await User.findByIdAndUpdate(user._id, {
				$set: { roles: [currentRole] },
				$unset: { role: "" }
			});

			rolledBack++;
		}

		console.log(`   ✓ Rolled back ${rolledBack} users`);
	}
}

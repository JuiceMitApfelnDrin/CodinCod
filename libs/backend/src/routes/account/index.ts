import { FastifyInstance } from "fastify";
import authenticated from "../../plugins/middleware/authenticated.js";
import checkUserBan from "../../plugins/middleware/check-user-ban.js";
import { AuthenticatedInfo, DEFAULT_USER_ROLE, httpResponseCodes } from "types";
import User from "../../models/user/user.js";
import { validateBody } from "@/plugins/middleware/validate-body.js";
import { z } from "zod";

const updateProfileSchema = z.object({
	bio: z.string().max(500).optional(),
	location: z.string().max(100).optional(),
	picture: z.string().url().optional().or(z.literal("")),
	socials: z.array(z.string().url()).max(5).optional()
});

export default async function accountRoutes(fastify: FastifyInstance) {
	// GET /account - Get current user info
	fastify.get(
		"/",
		{
			preHandler: [authenticated, checkUserBan]
		},
		async (request, reply) => {
			const user = request.user as AuthenticatedInfo | undefined;

			if (!user) {
				return reply.status(401).send({
					isAuthenticated: false,
					message: "Not authenticated"
				});
			}

			try {
				// Fetch the user from database to get the role
				const dbUser = await User.findById(user.userId);

				return reply.status(200).send({
					isAuthenticated: true,
					userId: user.userId,
					username: user.username,
					role: dbUser?.role || DEFAULT_USER_ROLE
				});
			} catch (error) {
				fastify.log.error(error, "Failed to fetch user data");
				return reply.status(500).send({
					isAuthenticated: false,
					message: "Failed to fetch user data"
				});
			}
		}
	);

	// PATCH /account/profile - Update user profile
	fastify.patch(
		"/profile",
		{
			preHandler: [
				authenticated,
				checkUserBan,
				validateBody(updateProfileSchema)
			]
		},
		async (request, reply) => {
			const user = request.user as AuthenticatedInfo | undefined;

			if (!user) {
				return reply.status(httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED).send({
					message: "Not authenticated"
				});
			}

			try {
				const updates = request.body as z.infer<typeof updateProfileSchema>;

				const dbUser = await User.findById(user.userId);

				if (!dbUser) {
					return reply.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND).send({
						message: "User not found"
					});
				}

				// Update profile fields
				if (!dbUser.profile) {
					dbUser.profile = {};
				}

				if (updates.bio !== undefined) dbUser.profile.bio = updates.bio;
				if (updates.location !== undefined)
					dbUser.profile.location = updates.location;
				if (updates.picture !== undefined)
					dbUser.profile.picture = updates.picture;
				if (updates.socials !== undefined)
					dbUser.profile.socials = updates.socials;

				await dbUser.save();

				return reply.status(httpResponseCodes.SUCCESSFUL.OK).send({
					message: "Profile updated successfully",
					profile: dbUser.profile
				});
			} catch (error) {
				fastify.log.error(error, "Failed to update profile");
				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send({
						message: "Failed to update profile"
					});
			}
		}
	);
}

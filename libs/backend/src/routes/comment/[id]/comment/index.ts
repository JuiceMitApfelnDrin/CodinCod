import Comment from "@/models/comment/comment.js";
import authenticated from "@/plugins/middleware/authenticated.js";
import { ParamsId } from "@/types/types.js";
import { FastifyInstance } from "fastify";
import {
	CommentEntity,
	CommentErrorResponse,
	commentTypeEnum,
	CreateCommentRequest,
	createCommentSchema,
	CreateCommentSuccessResponse,
	isAuthenticatedInfo,
	isCreateCommentSuccessResponse
} from "types";
import {
	handleAndSendError,
	sendUnauthorizedError
} from "@/helpers/error.helpers.js";
import { ClientSession } from "mongoose";

export default async function commentByIdCommentRoutes(
	fastify: FastifyInstance
) {
	fastify.post<{
		Params: ParamsId;
		Body: CreateCommentRequest;
		Reply: CreateCommentSuccessResponse | CommentErrorResponse;
	}>(
		"/",
		{
			preHandler: [authenticated]
		},
		async (request, reply) => {
			const parseResult = createCommentSchema.safeParse(request.body);

			if (!parseResult.success) {
				return handleAndSendError(reply, parseResult.error, request.url);
			}

			if (!isAuthenticatedInfo(request.user)) {
				return sendUnauthorizedError(reply, "Invalid credentials");
			}

			const id = request.params.id;
			const user = request.user;
			const userId = user.userId;

			const newCommentData: CommentEntity = {
				...parseResult.data,
				author: userId,
				upvote: 0,
				downvote: 0,
				comments: [],
				commentType: commentTypeEnum.COMMENT,
				parentId: id
			};

			let session: ClientSession | null = null;
			try {
				session = await Comment.startSession();
				session.startTransaction();

				const newComment = new Comment(newCommentData);
				await newComment.save({ session });

				await Comment.findByIdAndUpdate(
					id,
					{ $push: { comments: newComment._id } },
					{ session, new: true }
				);

				await session.commitTransaction();
				session.endSession();

				const comment = await Comment.findById(newComment._id).populate(
					"author"
				);

				if (!comment) {
					throw new Error("Failed to retrieve created comment");
				}

				if (!isCreateCommentSuccessResponse(comment)) {
					throw new Error("Invalid comment structure");
				}

				return reply.status(201).send(comment);
			} catch (error) {
				if (session) {
					await session.abortTransaction();
					session.endSession();
				}

				return handleAndSendError(reply, error, request.url);
			}
		}
	);
}

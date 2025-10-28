import Submission, { SubmissionDocument } from "../models/submission/submission.js";
import { ObjectId, SubmissionEntity } from "types";

export class SubmissionService {
	async findById(id: string | ObjectId): Promise<SubmissionDocument | null> {
		return await Submission.findById(id);
	}

	async findByIdWithCode(id: string | ObjectId): Promise<SubmissionDocument | null> {
		return await Submission.findById(id).select("+code");
	}

	async findByIdPopulated(id: string | ObjectId): Promise<SubmissionDocument | null> {
		return await Submission.findById(id)
			.populate("user")
			.populate("programmingLanguage")
			.populate("puzzle");
	}

	async findByIdWithCodePopulated(id: string | ObjectId): Promise<SubmissionDocument | null> {
		return await Submission.findById(id)
			.select("+code")
			.populate("user")
			.populate("programmingLanguage")
			.populate("puzzle");
	}

	async findByUser(userId: string | ObjectId, limit?: number): Promise<SubmissionDocument[]> {
		const query = Submission.find({ user: userId })
			.sort({ createdAt: -1 })
			.populate("puzzle")
			.populate("programmingLanguage");

		if (limit) {
			query.limit(limit);
		}

		return await query.exec();
	}

	async findByPuzzle(puzzleId: string | ObjectId): Promise<SubmissionDocument[]> {
		return await Submission.find({ puzzle: puzzleId })
			.populate("user")
			.populate("programmingLanguage")
			.sort({ createdAt: -1 });
	}

	async create(data: SubmissionEntity): Promise<SubmissionDocument> {
		const submission = new Submission(data);
		return await submission.save();
	}

	async countByUser(userId: string | ObjectId): Promise<number> {
		return await Submission.countDocuments({ user: userId });
	}

	async countByPuzzle(puzzleId: string | ObjectId): Promise<number> {
		return await Submission.countDocuments({ puzzle: puzzleId });
	}

	async findSuccessfulByUser(userId: string | ObjectId): Promise<SubmissionDocument[]> {
		return await Submission.find({
			user: userId,
			"result.successRate": 1
		})
			.populate("puzzle")
			.populate("programmingLanguage")
			.sort({ createdAt: -1 });
	}

	async deleteMany(ids: (string | ObjectId)[]): Promise<void> {
		await Submission.deleteMany({ _id: { $in: ids } });
	}

	async deleteByPuzzle(puzzleId: string | ObjectId): Promise<void> {
		await Submission.deleteMany({ puzzle: puzzleId });
	}

	async deleteByUser(userId: string | ObjectId): Promise<void> {
		await Submission.deleteMany({ user: userId });
	}
}

export const submissionService = new SubmissionService();

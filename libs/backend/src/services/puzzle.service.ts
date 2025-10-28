import Puzzle, { PuzzleDocument } from "../models/puzzle/puzzle.js";
import { ObjectId, PuzzleEntity, puzzleVisibilityEnum } from "types";
import { PipelineStage } from "mongoose";

/**
 * Service for Puzzle database operations
 * Centralizes all MongoDB queries for puzzles
 */
export class PuzzleService {
	/**
	 * Find a puzzle by ID
	 */
	async findById(id: string | ObjectId): Promise<PuzzleDocument | null> {
		return await Puzzle.findById(id).exec();
	}

	/**
	 * Find a puzzle by ID with author populated
	 */
	async findByIdPopulated(
		id: string | ObjectId
	): Promise<PuzzleDocument | null> {
		return await Puzzle.findById(id).populate("author").exec();
	}

	/**
	 * Find random approved puzzles
	 */
	async findRandomApproved(count: number = 1): Promise<PuzzleDocument[]> {
		const pipeline: PipelineStage[] = [
			{ $match: { visibility: puzzleVisibilityEnum.APPROVED } },
			{ $sample: { size: count } }
		];
		return await Puzzle.aggregate(pipeline).exec();
	}

	/**
	 * Create a new puzzle
	 */
	async create(puzzleEntity: PuzzleEntity): Promise<PuzzleDocument> {
		const puzzle = new Puzzle(puzzleEntity);
		return await puzzle.save();
	}

	/**
	 * Update a puzzle by ID
	 */
	async updateById(
		id: string | ObjectId,
		update: Partial<PuzzleEntity>
	): Promise<PuzzleDocument | null> {
		return await Puzzle.findByIdAndUpdate(id, update, {
			new: true,
			runValidators: true
		}).exec();
	}

	/**
	 * Find puzzles by author ID
	 */
	async findByAuthorId(
		authorId: string | ObjectId,
		options?: {
			visibility?: string;
			limit?: number;
			skip?: number;
			sort?: Record<string, 1 | -1>;
		}
	): Promise<PuzzleDocument[]> {
		const filter: Record<string, any> = { author: authorId };
		if (options?.visibility) {
			filter.visibility = options.visibility;
		}

		let query = Puzzle.find(filter);

		if (options?.sort) {
			query = query.sort(options.sort);
		}
		if (options?.skip) {
			query = query.skip(options.skip);
		}
		if (options?.limit) {
			query = query.limit(options.limit);
		}

		return await query.exec();
	}

	/**
	 * Find all puzzles with optional filters
	 */
	async findAll(options?: {
		filter?: Record<string, any>;
		limit?: number;
		skip?: number;
		sort?: Record<string, 1 | -1>;
		populate?: string | string[];
	}): Promise<PuzzleDocument[]> {
		let query = Puzzle.find(options?.filter ?? {});

		if (options?.sort) {
			query = query.sort(options.sort);
		}
		if (options?.skip) {
			query = query.skip(options.skip);
		}
		if (options?.limit) {
			query = query.limit(options.limit);
		}
		if (options?.populate) {
			query = query.populate(options.populate);
		}

		return await query.exec();
	}

	/**
	 * Count puzzles matching a filter
	 */
	async count(filter?: Record<string, any>): Promise<number> {
		return await Puzzle.countDocuments(filter ?? {});
	}

	/**
	 * Delete a puzzle by ID
	 */
	async deleteById(id: string | ObjectId): Promise<PuzzleDocument | null> {
		return await Puzzle.findByIdAndDelete(id).exec();
	}

	/**
	 * Find puzzles with pagination
	 */
	async findWithPagination(
		page: number,
		pageSize: number,
		filter?: Record<string, any>,
		sort?: Record<string, 1 | -1>
	): Promise<{
		puzzles: PuzzleDocument[];
		total: number;
		page: number;
		pageSize: number;
		totalPages: number;
	}> {
		const skip = (page - 1) * pageSize;
		const [puzzles, total] = await Promise.all([
			this.findAll({
				...(filter && { filter }),
				skip,
				limit: pageSize,
				...(sort && { sort })
			}),
			this.count(filter)
		]);

		return {
			puzzles,
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / pageSize)
		};
	}
}

// Export a singleton instance
export const puzzleService = new PuzzleService();

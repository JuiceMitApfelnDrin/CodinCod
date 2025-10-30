import ProgrammingLanguage, {
	ProgrammingLanguageDocument
} from "../models/programming-language/language.js";
import {
	ObjectId,
	ProgrammingLanguageDto,
	programmingLanguageDtoSchema
} from "types";

/**
 * Service for ProgrammingLanguage database operations
 * Centralizes all MongoDB queries for programming languages
 */
export class ProgrammingLanguageService {
	/**
	 * Find a programming language by ID
	 */
	async findById(
		id: string | ObjectId
	): Promise<ProgrammingLanguageDocument | null> {
		return (await ProgrammingLanguage.findById(
			id
		).lean()) as ProgrammingLanguageDocument | null;
	}

	/**
	 * Find all programming languages
	 */
	async findAll(): Promise<ProgrammingLanguageDocument[]> {
		return await ProgrammingLanguage.find()
			.select("-createdAt -updatedAt -__v")
			.sort({ language: 1, version: -1 });
	}

	/**
	 * Find programming language by language name and version
	 */
	async findByLanguageAndVersion(
		language: string,
		version: string
	): Promise<ProgrammingLanguageDocument | null> {
		return await ProgrammingLanguage.findOne({ language, version });
	}

	/**
	 * Convert a ProgrammingLanguageDocument to DTO
	 */
	toDto(doc: ProgrammingLanguageDocument): ProgrammingLanguageDto {
		return programmingLanguageDtoSchema.parse({
			_id: doc._id.toString(),
			language: doc.language,
			version: doc.version,
			aliases: doc.aliases,
			runtime: doc.runtime
		});
	}

	/**
	 * Get all programming languages as DTOs
	 */
	async findAllAsDto(): Promise<ProgrammingLanguageDto[]> {
		const languages = await this.findAll();
		return languages.map((lang) => this.toDto(lang));
	}

	/**
	 * Count all programming languages
	 */
	async count(): Promise<number> {
		return await ProgrammingLanguage.countDocuments({});
	}

	/**
	 * Create a new programming language
	 */
	async create(data: {
		language: string;
		version: string;
		aliases?: string[];
		runtime?: string;
	}): Promise<ProgrammingLanguageDocument> {
		const programmingLanguage = new ProgrammingLanguage(data);
		return await programmingLanguage.save();
	}

	/**
	 * Create multiple programming languages
	 */
	async createMany(
		data: Array<{
			language: string;
			version: string;
			aliases?: string[];
			runtime?: string;
		}>
	): Promise<ProgrammingLanguageDocument[]> {
		return (await ProgrammingLanguage.insertMany(
			data
		)) as ProgrammingLanguageDocument[];
	}

	/**
	 * Delete all programming languages
	 */
	async deleteAll(): Promise<void> {
		await ProgrammingLanguage.deleteMany({});
	}
}

// Export a singleton instance
export const programmingLanguageService = new ProgrammingLanguageService();

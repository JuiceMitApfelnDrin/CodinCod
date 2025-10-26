import { faker } from "@faker-js/faker";

/**
 * Randomly select an item from an array
 */
export function randomFromArray<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

/**
 * Randomly select multiple items from an array
 */
export function randomMultipleFromArray<T>(
	array: T[],
	min: number,
	max: number
): T[] {
	const count = faker.number.int({ min, max });
	const shuffled = [...array].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Generate a random subset of an enum's values
 */
export function randomEnumValues<T extends Record<string, string>>(
	enumObj: T,
	min = 1,
	max = 3
): string[] {
	const values = Object.values(enumObj);
	return randomMultipleFromArray(values, min, max);
}

/**
 * Weighted random boolean (default 50/50)
 */
export function randomBoolean(probability = 0.5): boolean {
	return Math.random() < probability;
}

/**
 * Progress logger for seeding operations
 */
export class SeedLogger {
	private startTime: number;

	constructor(private operation: string) {
		this.startTime = Date.now();
		console.log(`\n🌱 ${operation}...`);
	}

	success(count: number, itemType: string): void {
		const duration = Date.now() - this.startTime;
		console.log(
			`✅ Created ${count} ${itemType} (${duration}ms)`
		);
	}

	error(error: unknown): void {
		console.error(`❌ ${this.operation} failed:`, error);
	}
}

/**
 * Get environment variable as number with fallback
 */
export function getEnvNumber(key: string, defaultValue: number): number {
	const value = process.env[key];
	return value ? parseInt(value, 10) : defaultValue;
}

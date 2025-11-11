/**
 * Configuration for the ban and escalation system
 * All durations are in milliseconds
 */

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

export const BAN_CONFIG = {
	// Ban durations
	durations: {
		SHORT: 1 * DAY, // 1 day
		MEDIUM: 3 * DAY, // 3 days
		LONG: 7 * DAY, // 1 week
		VERY_LONG: 30 * DAY // 30 days
	},

	// Escalation thresholds
	escalation: {
		// Number of resolved reports before automatic action
		FIRST_WARNING: 1, // First resolved report against user
		TEMPORARY_BAN_1: 3, // 3 resolved reports → 1 day ban
		TEMPORARY_BAN_2: 5, // 5 resolved reports → 3 day ban
		TEMPORARY_BAN_3: 7, // 7 resolved reports → 1 week ban
		PERMANENT_BAN: 10 // 10 resolved reports → permanent ban
	},

	// Reason validation
	reasonValidation: {
		MIN_LENGTH: 10, // Minimum characters for ban/unban reason
		MAX_LENGTH: 500 // Maximum characters for ban/unban reason
	},

	// Chat history retention
	chatRetention: {
		CONTEXT_MESSAGES_BEFORE: 5, // Messages to show before reported message
		CONTEXT_MESSAGES_AFTER: 5, // Messages to show after reported message
		RETENTION_PERIOD: 90 * DAY // Keep chat messages for 90 days
	}
} as const;

/**
 * Get ban duration in milliseconds based on report count
 */
export function getBanDuration(reportCount: number): number | null {
	if (reportCount >= BAN_CONFIG.escalation.PERMANENT_BAN) {
		return null; // Permanent ban (no duration)
	}
	if (reportCount >= BAN_CONFIG.escalation.TEMPORARY_BAN_3) {
		return BAN_CONFIG.durations.LONG;
	}
	if (reportCount >= BAN_CONFIG.escalation.TEMPORARY_BAN_2) {
		return BAN_CONFIG.durations.MEDIUM;
	}
	if (reportCount >= BAN_CONFIG.escalation.TEMPORARY_BAN_1) {
		return BAN_CONFIG.durations.SHORT;
	}
	return null; // No ban
}

/**
 * Check if automatic ban should be applied
 */
export function shouldAutoBan(reportCount: number): boolean {
	return reportCount >= BAN_CONFIG.escalation.TEMPORARY_BAN_1;
}

/**
 * Check if ban should be permanent
 */
export function shouldBePermanent(reportCount: number): boolean {
	return reportCount >= BAN_CONFIG.escalation.PERMANENT_BAN;
}

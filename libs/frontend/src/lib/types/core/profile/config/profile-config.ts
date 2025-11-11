/**
 * Profile validation configuration constants extracted from OpenAPI spec.
 * These match the validation rules defined in the Elixir backend.
 */

export const PROFILE_CONFIG = {
	/**
	 * Maximum length for user bio/description
	 */
	maxBioLength: 500,

	/**
	 * Maximum length for user location
	 */
	maxLocationLength: 100,

	/**
	 * Maximum number of social media links
	 */
	maxSocials: 5
} as const;

export type ProfileConfig = typeof PROFILE_CONFIG;

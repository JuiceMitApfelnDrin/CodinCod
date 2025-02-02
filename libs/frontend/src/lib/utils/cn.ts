import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names into one string. Can handle conditional classes.
 * Example: cn("a", false && "b", "bg-red-500", "") → "a bg-red-500".
 *
 * see: https://www.npmjs.com/package/clsx and https://www.npmjs.com/package/tailwind-merge
 */
export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}

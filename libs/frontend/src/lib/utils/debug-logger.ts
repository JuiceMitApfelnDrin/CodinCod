/**
 * Development-only debug logger
 * Provides consistent, colorful logging with timestamps and categories
 */

import { dev } from "$app/environment";

type LogCategory =
	| "AUTH"
	| "API"
	| "STORE"
	| "NAVIGATION"
	| "PAGE"
	| "WEBSOCKET"
	| "FORM"
	| "ERROR";

interface LogStyle {
	bg: string;
	color: string;
	icon: string;
}

const styles: Record<LogCategory, LogStyle> = {
	AUTH: { bg: "#006342ff", color: "#fff", icon: "🔐" },
	API: { bg: "#002f7bff", color: "#fff", icon: "🌐" },
	STORE: { bg: "#25007bff", color: "#fff", icon: "📦" },
	NAVIGATION: { bg: "#744900ff", color: "#fff", icon: "🧭" },
	PAGE: { bg: "#670034ff", color: "#fff", icon: "📄" },
	WEBSOCKET: { bg: "#006577ff", color: "#fff", icon: "🔌" },
	FORM: { bg: "#416c00ff", color: "#fff", icon: "📝" },
	ERROR: { bg: "#7d0000ff", color: "#fff", icon: "❌" }
};

class DebugLogger {
	private enabled: boolean;

	constructor() {
		this.enabled = dev;
	}

	private getTimestamp(): string {
		const now = new Date();
		return now.toISOString().split("T")[1].split(".")[0];
	}

	private log(
		category: LogCategory,
		message: string,
		data?: unknown,
		isError = false
	): void {
		if (!this.enabled) return;

		const style = styles[category];
		const timestamp = this.getTimestamp();
		const prefix = `%c${style.icon} ${category}%c [${timestamp}]`;
		const prefixStyles = [
			`background: ${style.bg}; color: ${style.color}; padding: 2px 6px; border-radius: 3px; font-weight: bold;`,
			`color: #666; font-size: 0.9em;`
		];

		if (isError) {
			console.error(prefix, ...prefixStyles, message, data ?? "");
		} else if (data !== undefined) {
			console.log(prefix, ...prefixStyles, message, data);
		} else {
			console.log(prefix, ...prefixStyles, message);
		}
	}

	// Authentication logs
	auth(message: string, data?: unknown): void {
		this.log("AUTH", message, data);
	}

	// API request/response logs
	api(message: string, data?: unknown): void {
		this.log("API", message, data);
	}

	// Store state changes
	store(message: string, data?: unknown): void {
		this.log("STORE", message, data);
	}

	// Navigation events
	nav(message: string, data?: unknown): void {
		this.log("NAVIGATION", message, data);
	}

	// Page lifecycle events
	page(message: string, data?: unknown): void {
		this.log("PAGE", message, data);
	}

	// WebSocket events
	ws(message: string, data?: unknown): void {
		this.log("WEBSOCKET", message, data);
	}

	// Form events
	form(message: string, data?: unknown): void {
		this.log("FORM", message, data);
	}

	// Errors
	error(message: string, error?: unknown): void {
		this.log("ERROR", message, error, true);
	}

	// Group related logs together
	group(category: LogCategory, title: string, fn: () => void): void {
		if (!this.enabled) return;

		const style = styles[category];
		console.group(
			`%c${style.icon} ${category}: ${title}`,
			`background: ${style.bg}; color: ${style.color}; padding: 2px 6px; border-radius: 3px; font-weight: bold;`
		);
		fn();
		console.groupEnd();
	}

	// Table format for structured data
	table(category: LogCategory, title: string, data: unknown): void {
		if (!this.enabled) return;

		const style = styles[category];
		console.log(
			`%c${style.icon} ${category}: ${title}`,
			`background: ${style.bg}; color: ${style.color}; padding: 2px 6px; border-radius: 3px; font-weight: bold;`
		);
		console.table(data);
	}
}

export const logger = new DebugLogger();

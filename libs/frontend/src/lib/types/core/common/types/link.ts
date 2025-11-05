import type { FrontendUrl } from "../config/frontend-urls.js";

export type Link = {
	href: string;
	text: string;
};

export type FrontendLink = {
	href: FrontendUrl;
	text: string;
};

export type BackendLink = {
	href: string;
	text: string;
};

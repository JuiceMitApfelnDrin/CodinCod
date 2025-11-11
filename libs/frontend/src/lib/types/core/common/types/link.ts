import type { FrontendUrl } from "@codincod/shared/constants/frontend-urls";

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

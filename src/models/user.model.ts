import type { Puzzle } from './puzzle.model';
import type { Submission } from './submission.model';

export type User = {
	username: string;
	avaterUrl: string;
	bio: string;

	// TODO: array of user_ids? probably have to change it out to something else than string later
	friends: string[];

	links: string[];

	// TODO: to be determined what type it has
	// achievements:

	// TODO: to be determined what type it has
	// guilds:

	solved_puzzles: Submission[];
	contributions: Puzzle[];
};

import { z } from 'zod';
import { getValues } from '../../../utils/functions/get-values.js';

export const API_TAGS = {
	AUTHENTICATION: 'Authentication',
	USERS: 'Users',
	PUZZLES: 'Puzzles',
	SUBMISSIONS: 'Submissions',
	GAMES: 'Games',
	COMMENTS: 'Comments',
	ACCOUNT: 'Account',
	HEALTH: 'Health',
	CODE_EXECUTION: 'Code Execution',
} as const;

export const apiTagSchema = z.enum(getValues(API_TAGS));

export type ApiTag = z.infer<typeof apiTagSchema>;

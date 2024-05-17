import { faker } from "@faker-js/faker";

export const generateSubmission = () => {
	return {
		id: faker.string.uuid(),
		puzzle_id: faker.string.uuid(),
		user_id: faker.string.uuid(),
		code: "let i = 0; console.log(i);",
		submitted_at: faker.date.recent()
	};
};

export const generateSubmissions = (numSubmissions: number) => {
	return Array.from({ length: numSubmissions }, generateSubmission);
};

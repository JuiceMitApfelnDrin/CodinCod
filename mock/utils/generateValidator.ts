import { faker } from "@faker-js/faker";

export const generateValidator = () => {
	return {
		id: faker.string.uuid(),
		type: faker.datatype.boolean(),
		input: faker.lorem.paragraphs(),
		output: faker.lorem.paragraphs()
	};
};

export const generateValidators = (numValidators: number) => {
	return Array.from({ length: numValidators }, generateValidator);
};

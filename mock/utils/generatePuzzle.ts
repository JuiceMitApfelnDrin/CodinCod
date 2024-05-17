import { faker } from "@faker-js/faker"
import { generateValidators } from "./generateValidator";
import { type Type, type Puzzle, Difficulty } from "../../src/lib/models/puzzle.model"

const generatePuzzleType = (): Type => {
    return faker.number.int({ min: 1, max: 3 }) as Type
}
const generatePuzzleTypes = () => {
    return Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, generatePuzzleType);
}
const generatePuzzleDifficulty = (): Difficulty => {
    return faker.number.int({ min: 1, max: 5 }) as Difficulty
}

export const generatePuzzle = (): Puzzle => {
    return {
        id: faker.string.uuid(),
        title: faker.lorem.words({ max: 10, min: 1 }),
        statement: faker.lorem.words({ max: 100, min: 1 }),
        constraints: faker.lorem.words({ max: 100, min: 1 }),
        author_id: faker.string.uuid(),
        validators: generateValidators(10),
        types: generatePuzzleTypes(),
        difficulty: generatePuzzleDifficulty(),
        updated_at: faker.date.past(),
        created_at: faker.date.past(),
    };
};

export const generatePuzzles = (numPuzzles: number) => {
    return Array.from({ length: numPuzzles }, generatePuzzle);
};
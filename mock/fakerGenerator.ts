import fs from "fs";
import { generateUsers } from "./utils/generateUser";
import { generatePuzzles } from "./utils/generatePuzzle";
import { generateValidators } from "./utils/generateValidator";
import { faker } from "@faker-js/faker";
import { generateAccount } from "./utils/generateAccount";
import { generateSubmissions } from "./utils/generateSubmission";

const numberOfUsers = faker.number.int({ min: 10, max: 100 });
const numberOfPuzzles = faker.number.int({ min: 10, max: 100 });
const numberOfValidators = faker.number.int({ min: 10, max: 100 });
const numberOfSubmissions = faker.number.int({ min: 10, max: 500 });

fs.writeFileSync(
	"db.json",
	JSON.stringify(
		{
			users: generateUsers(numberOfUsers),
			puzzles: generatePuzzles(numberOfPuzzles),
			validators: generateValidators(numberOfValidators),
			account: generateAccount(),
			submissions: generateSubmissions(numberOfSubmissions)
		},
		null,
		"\t"
	)
);

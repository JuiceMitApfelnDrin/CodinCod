import type { Puzzle } from "../../lib/models/puzzle.model";

const testMarkdownParsing =
	`
This is a description paragraph.

* This is a list
* With two items
  1. And a sublist
  2. That is ordered
    - With another
    - Sublist inside
	3. xdd

| And this is | A table |
|-------------|---------|
| With two    | columns |

<script>alert("hi there bois")</s` +
	"cript> => shouldn't alert :) \n```js\n const something = 'bruh'\n```";

export const puzzle: Puzzle = {
	_id: "random id that doesn't matter one bit",
	author_id: "juicemitapfelndrin",
	constraints: "N lines",
	statement:
		'Print numbers from 1 to N, but if the number is divisible by F, print "Fizz", and if the number is divisible by B print "Buzz". If it is divisible by both print "FizzBuzz".' +
		testMarkdownParsing,
	title: "FizzBuzz",
	validators: [
		{
			input: "7 2 3",
			output: "1\nFizz\nBuzz\nFizz\n5\nFizzBuzz\n7"
		},
		{
			input: "3 1 1",
			output: "FizzBuzz\nFizzBuzz\nFizzBuzz"
		},
		{
			input: "10 11 12",
			output: "1\n2\n3\n4\n5\n6\n7\n8\n9\n10"
		}
	]
};

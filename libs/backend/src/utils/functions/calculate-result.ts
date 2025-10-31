import {
	isPistonExecutionResponseSuccess,
	PistonExecutionResponse,
	PuzzleResultEnum,
	PuzzleResultInformation
} from "types";

function compareOutputWithExpectedOutput(
	expectedOutput: string,
	output: string
) {
	return expectedOutput.trimEnd() === output.trimEnd();
}

export function calculateResults(
	expectedOutput: string[],
	executionResponses: PistonExecutionResponse[]
): PuzzleResultInformation & { passed: number; failed: number; total: number } {
	const successfulTests = executionResponses.reduce(
		(previous, executionResponse, index) => {
			if (isPistonExecutionResponseSuccess(executionResponse)) {
				const currentExpectedOutput = expectedOutput[index];

				return (
					previous +
					Number(
						compareOutputWithExpectedOutput(
							currentExpectedOutput,
							executionResponse.run.output
						) ||
							compareOutputWithExpectedOutput(
								currentExpectedOutput,
								executionResponse.run.stdout
							)
					)
				);
			}

			return previous;
		},
		0
	);

	const totalTests = executionResponses.length;
	const successRate = successfulTests / totalTests;
	const failedTests = totalTests - successfulTests;

	return {
		result:
			successfulTests === totalTests
				? PuzzleResultEnum.SUCCESS
				: PuzzleResultEnum.ERROR,
		successRate,
		passed: successfulTests,
		failed: failedTests,
		total: totalTests
	};
}

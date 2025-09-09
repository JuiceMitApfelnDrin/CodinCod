export const calculatePercentage = (
	min: number,
	max: number,
	current: number
): number => {
	const range = max - min;
	const valueRelativeToRange = current - min;

	return valueRelativeToRange / range;
};

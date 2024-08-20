function calculateDifficulty(successRate: number) {
	if (successRate >= 80) return Difficulty.BEGINNER; // High pass rate
	if (successRate >= 50) return Difficulty.INTERMEDIATE; // Moderate pass rate
	if (successRate >= 30) return Difficulty.ADVANCED; // Lower pass rate
	return Difficulty.EXPERT; // Very low pass rate
}

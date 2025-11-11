export const gameModeEnum = {
	// Core modes
	FASTEST: "fastest", // Complete the task in the shortest time
	SHORTEST: "shortest", // Write the least amount of code (characters)

	// Challenge modes
	BACKWARDS: "backwards", // Work from output to input
	HARDCORE: "hardcore", // One attempt only, no tries
	DEBUG: "debug", // Fix broken code instead of writing from scratch
	TYPERACER: "typeracer", // Copy code perfectly, fastest wins

	// Advanced modes
	EFFICIENCY: "efficiency", // Focus on writing the most efficient code (computationally or memory)
	INCREMENTAL: "incremental", // Requirements added each minute

	// Special modes
	RANDOM: "random" // Randomized game mode
} as const;

// dont fucking add random game modes that don't belong

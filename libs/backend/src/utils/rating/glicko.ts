/**
 * Glicko-2 Rating System Implementation
 *
 * A simplified, rudimentary implementation of the Glicko-2 rating system
 * for competitive multiplayer games. This can be expanded later with more
 * sophisticated calculations.
 *
 * Reference: http://www.glicko.net/glicko/glicko2.pdf
 */

export interface GlickoRating {
	rating: number; // Player's rating (μ)
	rd: number; // Rating deviation (φ) - uncertainty in rating
	volatility: number; // Volatility (σ) - degree of expected fluctuation
	lastUpdated: Date;
}

export interface GameOutcome {
	opponentRating: number;
	opponentRd: number;
	score: number; // 1 = win, 0.5 = draw, 0 = loss
}

// Glicko-2 system constants
const TAU = 0.5; // System constant (volatility constraint)
const EPSILON = 0.000001; // Convergence tolerance
const GLICKO_SCALE = 173.7178; // Conversion factor (q in original Glicko)

/**
 * Convert Glicko-2 rating to Glicko-2 scale
 */
function toGlicko2Scale(rating: number): number {
	return (rating - 1500) / GLICKO_SCALE;
}

/**
 * Convert Glicko-2 scale back to rating
 */
function fromGlicko2Scale(mu: number): number {
	return mu * GLICKO_SCALE + 1500;
}

/**
 * g function - measures impact of opponent's RD
 */
function g(rd: number): number {
	const phi = rd / GLICKO_SCALE;
	return 1 / Math.sqrt(1 + (3 * phi * phi) / (Math.PI * Math.PI));
}

/**
 * E function - expected score against opponent
 */
function E(playerMu: number, opponentMu: number, opponentPhi: number): number {
	const gValue = g(opponentPhi * GLICKO_SCALE);
	return 1 / (1 + Math.exp(-gValue * (playerMu - opponentMu)));
}

/**
 * Calculate variance (v) based on opponents
 */
function calculateVariance(playerMu: number, outcomes: GameOutcome[]): number {
	let sum = 0;
	for (const outcome of outcomes) {
		const opponentMu = toGlicko2Scale(outcome.opponentRating);
		const opponentPhi = outcome.opponentRd / GLICKO_SCALE;
		const gValue = g(outcome.opponentRd);
		const eValue = E(playerMu, opponentMu, opponentPhi);
		sum += gValue * gValue * eValue * (1 - eValue);
	}
	return sum > 0 ? 1 / sum : Infinity;
}

/**
 * Calculate delta (improvement in rating)
 */
function calculateDelta(playerMu: number, outcomes: GameOutcome[]): number {
	let sum = 0;
	for (const outcome of outcomes) {
		const opponentMu = toGlicko2Scale(outcome.opponentRating);
		const opponentPhi = outcome.opponentRd / GLICKO_SCALE;
		const gValue = g(outcome.opponentRd);
		const eValue = E(playerMu, opponentMu, opponentPhi);
		sum += gValue * (outcome.score - eValue);
	}
	return sum;
}

/**
 * Simplified volatility update (using Newton-Raphson approximation)
 * This is a rudimentary implementation - can be refined later
 */
function updateVolatility(
	sigma: number,
	phi: number,
	v: number,
	delta: number
): number {
	const a = Math.log(sigma * sigma);
	const delta2 = delta * delta;
	const phi2 = phi * phi;

	// Simplified calculation - good enough for initial implementation
	const f = (x: number): number => {
		const ex = Math.exp(x);
		return (
			(ex * (delta2 - phi2 - v - ex)) /
				(2 * (phi2 + v + ex) * (phi2 + v + ex)) -
			(x - a) / (TAU * TAU)
		);
	};

	// Find approximate solution
	let A = a;
	let B: number;
	if (delta2 > phi2 + v) {
		B = Math.log(delta2 - phi2 - v);
	} else {
		let k = 1;
		while (f(a - k * TAU) < 0) {
			k++;
		}
		B = a - k * TAU;
	}

	// Newton-Raphson iterations (simplified)
	let fA = f(A);
	let fB = f(B);

	while (Math.abs(B - A) > EPSILON) {
		const C = A + ((A - B) * fA) / (fB - fA);
		const fC = f(C);

		if (fC * fB < 0) {
			A = B;
			fA = fB;
		} else {
			fA = fA / 2;
		}

		B = C;
		fB = fC;
	}

	return Math.exp(A / 2);
}

/**
 * Calculate new rating after a series of games
 * This is the main function to use for rating updates
 */
export function calculateNewRating(
	currentRating: GlickoRating,
	outcomes: GameOutcome[]
): GlickoRating {
	// If no games, increase RD (rating becomes more uncertain over time)
	if (outcomes.length === 0) {
		const daysSinceLastGame =
			(Date.now() - currentRating.lastUpdated.getTime()) /
			(1000 * 60 * 60 * 24);
		const rdIncrease = Math.min(
			Math.sqrt(currentRating.rd * currentRating.rd + daysSinceLastGame * 2),
			350
		);

		return {
			...currentRating,
			rd: rdIncrease,
			lastUpdated: new Date()
		};
	}

	// Convert to Glicko-2 scale
	const mu = toGlicko2Scale(currentRating.rating);
	const phi = currentRating.rd / GLICKO_SCALE;
	const sigma = currentRating.volatility;

	// Step 3: Calculate v (variance)
	const v = calculateVariance(mu, outcomes);

	// Step 4: Calculate delta (improvement)
	const delta = v * calculateDelta(mu, outcomes);

	// Step 5: Update volatility
	const newSigma = updateVolatility(sigma, phi, v, delta);

	// Step 6: Update phi (rating deviation)
	const phiStar = Math.sqrt(phi * phi + newSigma * newSigma);

	// Step 7: Update phi and mu
	const newPhi = 1 / Math.sqrt(1 / (phiStar * phiStar) + 1 / v);
	const newMu = mu + newPhi * newPhi * calculateDelta(mu, outcomes);

	// Convert back to Glicko scale
	return {
		rating: fromGlicko2Scale(newMu),
		rd: newPhi * GLICKO_SCALE,
		volatility: newSigma,
		lastUpdated: new Date()
	};
}

/**
 * Initialize default rating for new player
 */
export function getDefaultRating(): GlickoRating {
	return {
		rating: 1500,
		rd: 350,
		volatility: 0.06,
		lastUpdated: new Date()
	};
}

/**
 * Calculate expected win probability against opponent
 */
export function expectedWinProbability(
	playerRating: GlickoRating,
	opponentRating: GlickoRating
): number {
	const playerMu = toGlicko2Scale(playerRating.rating);
	const opponentMu = toGlicko2Scale(opponentRating.rating);
	const opponentPhi = opponentRating.rd / GLICKO_SCALE;

	return E(playerMu, opponentMu, opponentPhi);
}

/**
 * Simplified rating update for head-to-head games
 * Easier to use for simple win/loss scenarios
 */
export function updateRatingAfterGame(
	playerRating: GlickoRating,
	opponentRating: GlickoRating,
	playerWon: boolean
): GlickoRating {
	const outcome: GameOutcome = {
		opponentRating: opponentRating.rating,
		opponentRd: opponentRating.rd,
		score: playerWon ? 1 : 0
	};

	return calculateNewRating(playerRating, [outcome]);
}

/**
 * Batch update for multiple games in a rating period
 */
export function updateRatingAfterMultipleGames(
	playerRating: GlickoRating,
	games: Array<{ opponentRating: GlickoRating; playerWon: boolean }>
): GlickoRating {
	const outcomes: GameOutcome[] = games.map((game) => ({
		opponentRating: game.opponentRating.rating,
		opponentRd: game.opponentRating.rd,
		score: game.playerWon ? 1 : 0
	}));

	return calculateNewRating(playerRating, outcomes);
}

import mongoose, { Document, Schema } from "mongoose";
import { UserMetricsEntity } from "types";
import { USER_METRICS, USER } from "../../utils/constants/model.js";

export interface UserMetricsDocument
	extends Document,
		Omit<UserMetricsEntity, "_id" | "userId"> {
	userId: mongoose.Types.ObjectId;
}

const glickoRatingSchema = new Schema(
	{
		rating: {
			type: Number,
			default: 1500
		},
		rd: {
			type: Number,
			default: 350
		},
		volatility: {
			type: Number,
			default: 0.06
		},
		lastUpdated: {
			type: Date,
			default: Date.now
		}
	},
	{ _id: false }
);

const gameModeMetricsSchema = new Schema(
	{
		gamesPlayed: {
			type: Number,
			default: 0,
			min: 0
		},
		gamesWon: {
			type: Number,
			default: 0,
			min: 0
		},
		bestScore: {
			type: Number,
			default: 0,
			min: 0
		},
		averageScore: {
			type: Number,
			default: 0,
			min: 0
		},
		totalScore: {
			type: Number,
			default: 0,
			min: 0
		},
		glickoRating: {
			type: glickoRatingSchema,
			default: () => ({})
		},
		rank: {
			type: Number,
			required: false
		},
		lastGameDate: {
			type: Date,
			required: false
		}
	},
	{ _id: false }
);

const userMetricsSchema = new Schema<UserMetricsDocument>({
	userId: {
		type: Schema.Types.ObjectId,
		ref: USER,
		required: true,
		unique: true,
		index: true
	},

	// Metrics per game mode
	fastest: {
		type: gameModeMetricsSchema,
		required: false
	},
	shortest: {
		type: gameModeMetricsSchema,
		required: false
	},
	backwards: {
		type: gameModeMetricsSchema,
		required: false
	},
	hardcore: {
		type: gameModeMetricsSchema,
		required: false
	},
	debug: {
		type: gameModeMetricsSchema,
		required: false
	},
	typeracer: {
		type: gameModeMetricsSchema,
		required: false
	},
	efficiency: {
		type: gameModeMetricsSchema,
		required: false
	},
	incremental: {
		type: gameModeMetricsSchema,
		required: false
	},
	random: {
		type: gameModeMetricsSchema,
		required: false
	},

	// Overall stats
	totalGamesPlayed: {
		type: Number,
		default: 0,
		min: 0
	},
	totalGamesWon: {
		type: Number,
		default: 0,
		min: 0
	},

	// Tracking for incremental updates
	lastProcessedGameDate: {
		type: Date,
		default: () => new Date(0) // Unix epoch
	},
	lastCalculationDate: {
		type: Date,
		default: Date.now
	},

	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	}
});

// Update timestamp on save
userMetricsSchema.pre<UserMetricsDocument>("save", function (next) {
	this.updatedAt = new Date();
	next();
});

// Compound index for leaderboard queries per game mode
userMetricsSchema.index({ "fastest.glickoRating.rating": -1 });
userMetricsSchema.index({ "shortest.glickoRating.rating": -1 });
userMetricsSchema.index({ "backwards.glickoRating.rating": -1 });
userMetricsSchema.index({ "hardcore.glickoRating.rating": -1 });
userMetricsSchema.index({ "debug.glickoRating.rating": -1 });
userMetricsSchema.index({ "typeracer.glickoRating.rating": -1 });
userMetricsSchema.index({ "efficiency.glickoRating.rating": -1 });
userMetricsSchema.index({ "incremental.glickoRating.rating": -1 });
userMetricsSchema.index({ "random.glickoRating.rating": -1 });

const UserMetrics = mongoose.model<UserMetricsDocument>(
	USER_METRICS,
	userMetricsSchema
);

export default UserMetrics;

import mongoose, { Schema, Document } from "mongoose";
import { ValueOf } from "types";

export const migrationStatus = {
	APPLIED: "applied",
	ROLLED_BACK: "rolled-back",
	FAILED: "failed"
} as const;
export type MigrationStatus = ValueOf<typeof migrationStatus>;

export interface MigrationRecord extends Document {
	name: string;
	description: string;
	appliedAt: Date;
	rollbackAt?: Date;
	status: MigrationStatus;
	error?: string;
}

const migrationRecordSchema = new Schema<MigrationRecord>({
	name: {
		type: String,
		required: true,
		unique: true,
		index: true
	},
	description: {
		type: String,
		required: true
	},
	appliedAt: {
		type: Date,
		required: true,
		default: Date.now
	},
	rollbackAt: {
		type: Date,
		required: false
	},
	status: {
		type: String,
		enum: Object.values(migrationStatus),
		required: true,
		default: migrationStatus.APPLIED
	},
	error: {
		type: String,
		required: false
	}
});

export const MigrationTracker = mongoose.model<MigrationRecord>(
	"MigrationTracker",
	migrationRecordSchema
);

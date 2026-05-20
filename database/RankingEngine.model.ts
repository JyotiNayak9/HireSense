import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRankingCriteria {
  name: string;
  weight: number;
  description?: string;
}

export interface IRankingEngine extends Document {
  rankingCriteria: IRankingCriteria[];
  minimumScore: number;
  createdAt: Date;
  updatedAt: Date;
}


const rankingCriteriaSchema = new Schema<IRankingCriteria>(
  {
    name: {
      type: String,
      required: [true, 'Criteria name is required'],
      trim: true,
      minlength: [2, 'Criteria name must be at least 2 characters long'],
      maxlength: [50, 'Criteria name cannot exceed 50 characters'],
    },
    weight: {
      type: Number,
      required: [true, 'Weight is required'],
      min: [0, 'Weight cannot be negative'],
      max: [100, 'Weight cannot exceed 100'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
  },
  { _id: false } 
);

const rankingEngineSchema = new Schema<IRankingEngine>(
  {

    rankingCriteria: {
      type: [rankingCriteriaSchema],
      required: [true, 'Ranking criteria must be specified'],
      default: [],
      validate: {
        validator: (v: IRankingCriteria[]) => {
          // Ensure non-empty array
          if (!Array.isArray(v) || v.length === 0) {
            return false;
          }
          // Ensure weights sum to 100
          const totalWeight = v.reduce((sum, criterion) => sum + criterion.weight, 0);
          return totalWeight === 100;
        },
        message: 'Ranking criteria must be non-empty and weights must sum to 100',
      },
    },
    minimumScore: {
      type: Number,
      required: [true, 'Minimum score is required'],
      min: [0, 'Minimum score cannot be negative'],
      max: [100, 'Minimum score cannot exceed 100'],
    },
  },
  {
    timestamps: true, 
  }
);


rankingEngineSchema.index({ rankingId: 1 });


const RankingEngine: Model<IRankingEngine> =
  mongoose.models.RankingEngine ||
  mongoose.model<IRankingEngine>('RankingEngine', rankingEngineSchema);

export default RankingEngine;

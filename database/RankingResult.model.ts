import mongoose, { Schema, Model } from 'mongoose';

export interface IRankingResult {
  jobId: mongoose.Types.ObjectId | string;
  applicationId: mongoose.Types.ObjectId | string;
  userId: mongoose.Types.ObjectId | string;
  resumeId: mongoose.Types.ObjectId | string;
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  algorithm: string;
  rank: number;
  isRecommended: boolean;
  jobTokenCount: number;
  candidateTokenCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const rankingResultSchema = new Schema<IRankingResult>(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Job ID is required'],
      ref: 'Job',
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Application ID is required'],
      ref: 'Application',
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'User ID is required'],
      ref: 'User',
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Resume ID is required'],
      ref: 'Resume',
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: [0, 'Score cannot be less than 0'],
      max: [100, 'Score cannot exceed 100'],
      default: 0,
    },
    matchedKeywords: {
      type: [String],
      default: [],
    },
    missingKeywords: {
      type: [String],
      default: [],
    },
    algorithm: {
      type: String,
      trim: true,
      required: [true, 'Algorithm name is required'],
      default: 'tfidf_cosine_nlp_v1',
    },
    rank: {
      type: Number,
      min: [0, 'Rank cannot be negative'],
      default: 0,
    },
    isRecommended: {
      type: Boolean,
      default: false,
    },
    jobTokenCount: {
      type: Number,
      min: [0, 'Job token count cannot be negative'],
      default: 0,
    },
    candidateTokenCount: {
      type: Number,
      min: [0, 'Candidate token count cannot be negative'],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

rankingResultSchema.index({ jobId: 1, score: -1 });
rankingResultSchema.index({ jobId: 1, rank: 1 });
rankingResultSchema.index({ userId: 1, jobId: 1 });

const RankingResult: Model<IRankingResult> =
  mongoose.models.RankingResult ||
  mongoose.model<IRankingResult>('RankingResult', rankingResultSchema);

export default RankingResult;

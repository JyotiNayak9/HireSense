import mongoose, { Schema, Document, Model } from 'mongoose';


export interface IResume extends Document {
  userId: mongoose.Types.ObjectId | string;
  candidateId: mongoose.Types.ObjectId | string;
  fileUrl: string;
  publicId?: string | null;
  originalName?: string | null;
  parsedText: string;
  resumeText: string;
  cleanedText?: string;
  embedding?: number[];
  parseStatus: 'pending' | 'completed' | 'failed';
  parseError?: string | null;
  parsedAt?: Date | null;
  extractedSkills: string[];
  extractedEducation: string;
  extractedExperience: string;
  aiScore: number;
  createdAt: Date;
  updatedAt: Date;
}


const resumeSchema = new Schema<IResume>(
  {

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'User ID is required'],
      ref: 'User', 
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Candidate ID is required'],
      ref: 'User',
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true,
      validate: {
        validator: (v: string) => {
          // Basic URL validation
          try {
            new URL(v);
            return true;
          } catch {
            return false;
          }
        },
        message: 'Please provide a valid file URL',
      },
    },
    extractedSkills: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => Array.isArray(v),
        message: 'Extracted skills must be an array of strings',
      },
    },
    extractedEducation: {
      type: String,
      trim: true,
    },
    extractedExperience: {
      type: String,
      trim: true,
    },
    aiScore: {
      type: Number,
      required: [true, 'AI score is required'],
      min: [0, 'AI score cannot be less than 0'],
      max: [100, 'AI score cannot exceed 100'],
      default: 0,
    },
    publicId: {
      type: String,
      trim: true,
      default: null,
    },
    originalName: {
      type: String,
      trim: true,
      default: null,
    },
    parsedText: {
      type: String,
      default: '',
    },
    resumeText: {
      type: String,
      default: '',
    },
    cleanedText: {
      type: String,
      default: '',
    },
    embedding: {
      type: [Number],
      default: [],
    },
    parseStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    parseError: {
      type: String,
      trim: true,
      default: null,
    },
    parsedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, 
  }
);


resumeSchema.index({ userId: 1 });
resumeSchema.index({ aiScore: -1 }); 
resumeSchema.index({ parseStatus: 1 });


const Resume: Model<IResume> =
  mongoose.models.Resume || mongoose.model<IResume>('Resume', resumeSchema);

export default Resume;

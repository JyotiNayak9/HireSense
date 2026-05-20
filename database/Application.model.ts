import mongoose, { Schema, Document, Model } from 'mongoose';


export interface IApplication extends Document {
  applicationId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  jobId: mongoose.Schema.Types.ObjectId;
  applicationDate: Date;
  status: string;
  matchPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}


const applicationSchema = new Schema<IApplication>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'User ID is required'],
      ref: 'User', // Reference to User model for population
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Job ID is required'],
      ref: 'Job', // Reference to Job model for population
    },
    applicationDate: {
      type: Date,
      required: [true, 'Application date is required'],
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
      default: 'pending',
      required: [true, 'Status is required'],
    },
    matchPercentage: {
      type: Number,
      required: [true, 'Match percentage is required'],
      min: [0, 'Match percentage cannot be less than 0'],
      max: [100, 'Match percentage cannot exceed 100'],
      default: 0,
    },
  },
  {
    timestamps: true, 
  }
);


applicationSchema.index({ userId: 1 });
applicationSchema.index({ jobId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ matchPercentage: -1 }); 
applicationSchema.index({ userId: 1, jobId: 1 }, { unique: true }); 


const Application: Model<IApplication> =
  mongoose.models.Application ||
  mongoose.model<IApplication>('Application', applicationSchema);

export default Application;

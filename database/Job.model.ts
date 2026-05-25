import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  requiredSkills: string[];
  salaryRange?: string;
  jobType: string;
  deadline: Date;
  location: string;
  companyId: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      minlength: [3, 'Job title must be at least 3 characters long'],
      maxlength: [100, 'Job title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
      minlength: [20, 'Job description must be at least 20 characters long'],
      maxlength: [3000, 'Job description cannot exceed 3000 characters'],
    },
    requiredSkills: {
      type: [String],
      required: [true, 'Required skills must be specified'],
      default: [],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'Required skills must be a non-empty array',
      },
    },
    salaryRange: {
      type: String,
      trim: true,
      default: '',
      maxlength: [100, 'Salary range cannot exceed 100 characters'],
    },
    jobType: {
      type: String,
      required: [true, 'Job type is required'],
      enum: ['Full-time', 'Part-time', 'Remote', 'Internship'],
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    location: {
      type: String,
      required: [true, 'Job location is required'],
      trim: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Company ID is required'],
      ref: 'Company',
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({ title: 1 });
jobSchema.index({ companyId: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ requiredSkills: 1 });

const Job: Model<IJob> =
  mongoose.models.Job || mongoose.model<IJob>('Job', jobSchema);

export default Job;

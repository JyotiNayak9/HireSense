import bcrypt from 'bcryptjs';
import mongoose, { Schema, Document, Model } from 'mongoose';


export interface ICompany extends Document {

  companyName: string;
  email: string;
  password: string;
  location: string;
  industry: string;
  description: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}


const companySchema = new Schema<ICompany>(
  {

    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      minlength: [2, 'Company name must be at least 2 characters long'],
      maxlength: [150, 'Company name cannot exceed 150 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
      enum: [
        'Technology',
        'Finance',
        'Healthcare',
        'Retail',
        'Manufacturing',
        'Education',
        'Real Estate',
        'Entertainment',
        'Energy',
        'Telecommunications',
        'Other',
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    role: {
      type: String,
      default: 'company',
    },

  },
  {
    timestamps: true, 
  }
);


companySchema.index({ companyName: 1 });
companySchema.index({ industry: 1 });
companySchema.index({ location: 1 });

companySchema.pre('save', async function (this: ICompany) {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

companySchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const Company: Model<ICompany> =
  mongoose.models.Company || mongoose.model<ICompany>('Company', companySchema);

export default Company;

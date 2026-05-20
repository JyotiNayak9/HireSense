import mongoose, { Schema, Document, Model } from 'mongoose';


export interface ICompany extends Document {

  companyName: string;
  location: string;
  industry: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
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
  },
  {
    timestamps: true, 
  }
);


companySchema.index({ companyName: 1 });
companySchema.index({ industry: 1 });
companySchema.index({ location: 1 });


const Company: Model<ICompany> =
  mongoose.models.Company || mongoose.model<ICompany>('Company', companySchema);

export default Company;

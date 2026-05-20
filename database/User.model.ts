import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  phone: string;
  skills: string[];
  education: string;
  experience: string;
  resumeId: mongoose.Schema.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: ['candidate', 'employer', 'admin'],
      default: 'candidate',
      required: [true, 'Role is required'],
    },
    phone: {
      type: String,
      trim: true,
      match: [
        /^[+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
        'Please provide a valid phone number',
      ],
    },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => Array.isArray(v),
        message: 'Skills must be an array of strings',
      },
    },
    education: {
      type: String,
      trim: true,
    },
    experience: {
      type: String,
      trim: true,
    },
    resumeId: {
      type: Schema.Types.ObjectId,
      ref: 'Resume',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;

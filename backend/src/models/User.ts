import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// ── Wedding profile sub-document ─────────────────────────────
// Exported so controllers and other services can type against it
export interface IWeddingProfile {
  partner1:    string;
  partner2:    string;
  weddingDate: Date;
  venue:       string;
  city:        string;
  guestCount:  number;
  budget:      number;
  style:       string;
  events:      string[];
}

const weddingProfileSchema = new Schema<IWeddingProfile>(
  {
    partner1:    { type: String, required: true, trim: true },
    partner2:    { type: String, required: true, trim: true },
    weddingDate: { type: Date,   required: true },
    venue:       { type: String, default: '', trim: true },
    city:        { type: String, required: true, trim: true },
    guestCount:  { type: Number, required: true, min: 1 },
    budget:      { type: Number, required: true, min: 0 },
    style:       { type: String, required: true },
    events:      { type: [String], required: true },
  },
  { _id: false }
);

// ── User document ─────────────────────────────────────────────
export interface IUser extends Document {
  name:                 string;
  email:                string;
  password:             string;
  phone:                string;
  role:                 'user' | 'admin';
  onboardingCompleted:  boolean;
  weddingProfile:       IWeddingProfile | null;
  notificationPrefs:    Map<string, boolean>;
  createdAt:            Date;
  updatedAt:            Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name:                { type: String,  required: true, trim: true },
    email:               { type: String,  required: true, unique: true, lowercase: true, trim: true },
    password:            { type: String,  required: true, minlength: 6, select: false },
    phone:               { type: String,  default: '', trim: true },
    role:                { type: String,  enum: ['user', 'admin'], default: 'user' },
    onboardingCompleted: { type: Boolean, default: false },
    weddingProfile:      { type: weddingProfileSchema, default: null },
    notificationPrefs:   { type: Map, of: Boolean, default: {} },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);
export default User;

import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IGuest extends Document {
  userId:   Types.ObjectId;
  name:     string;
  relation: string;
  phone:    string;
  rsvp:     'confirmed' | 'pending' | 'declined';
  meal:     'Veg' | 'Non-veg' | 'Jain';
  plusOne:  boolean;
  createdAt: Date;
  updatedAt: Date;
}

const guestSchema = new Schema<IGuest>(
  {
    userId:   { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name:     { type: String, required: true, trim: true, maxlength: 100 },
    relation: { type: String, default: '', trim: true, maxlength: 100 },
    phone:    { type: String, default: '', trim: true, maxlength: 30 },
    rsvp:     { type: String, enum: ['confirmed', 'pending', 'declined'], default: 'pending' },
    meal:     { type: String, enum: ['Veg', 'Non-veg', 'Jain'], default: 'Veg' },
    plusOne:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

guestSchema.index({ userId: 1, createdAt: 1 });
guestSchema.index({ userId: 1, rsvp: 1 });

export default mongoose.model<IGuest>('Guest', guestSchema);

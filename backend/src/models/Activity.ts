import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IActivity extends Document {
  userId:    Types.ObjectId;
  icon:      string;
  text:      string;
  read:      boolean;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    icon:   { type: String, default: '◆' },
    text:   { type: String, required: true },
    read:   { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

activitySchema.index({ userId: 1, createdAt: -1 });
// TTL: expire activity documents after 90 days.
// Must be a single-field index — compound indexes cannot carry expireAfterSeconds.
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.model<IActivity>('Activity', activitySchema);

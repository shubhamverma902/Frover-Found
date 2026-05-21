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

// keep only last 50 per user — auto-prune oldest
activitySchema.post('save', async function () {
  const count = await mongoose.model('Activity').countDocuments({ userId: this.userId });
  if (count > 50) {
    const oldest = await mongoose.model('Activity')
      .find({ userId: this.userId })
      .sort({ createdAt: 1 })
      .limit(count - 50)
      .select('_id');
    await mongoose.model('Activity').deleteMany({ _id: { $in: oldest.map(d => d._id) } });
  }
});

export default mongoose.model<IActivity>('Activity', activitySchema);

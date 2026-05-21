import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISeatingTable extends Document {
  userId:   Types.ObjectId;
  name:     string;
  capacity: number;
  shape:    'round' | 'rectangular';
  guestIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const seatingTableSchema = new Schema<ISeatingTable>(
  {
    userId:   { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name:     { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, default: 8, min: 1, max: 200 },
    shape:    { type: String, enum: ['round', 'rectangular'], default: 'round' },
    guestIds: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<ISeatingTable>('SeatingTable', seatingTableSchema);

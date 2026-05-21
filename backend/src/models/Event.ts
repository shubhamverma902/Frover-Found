import mongoose, { Document, Schema, Types } from 'mongoose';

export type EventStatus = 'confirmed' | 'planning' | 'pending';

export interface IEvent extends Document {
  userId:  Types.ObjectId;
  name:    string;
  date:    Date;        // stored as Date; returned as YYYY-MM-DD string in API
  time:    string;      // HH:mm
  venue:   string;
  guests:  number;
  status:  EventStatus;
  desc:    string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name:   { type: String, required: true, trim: true },
    date:   { type: Date, required: true },
    time:   { type: String, default: '' },
    venue:  { type: String, default: '' },
    guests: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['confirmed', 'planning', 'pending'], default: 'pending' },
    desc:   { type: String, default: '' },
  },
  { timestamps: true }
);

const Event = mongoose.model<IEvent>('Event', eventSchema);
export default Event;

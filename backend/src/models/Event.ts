import mongoose, { Document, Schema, Types } from 'mongoose';

export type EventStatus = 'confirmed' | 'planning' | 'pending';

export interface IAttachment {
  _id:          Types.ObjectId;
  filename:     string;
  originalName: string;
  url:          string;
  mimetype:     string;
  size:         number;
  uploadedAt:   Date;
}

export interface IEvent extends Document {
  userId:      Types.ObjectId;
  name:        string;
  date:        Date;
  time:        string;
  venue:       string;
  guests:      number;
  status:      EventStatus;
  desc:        string;
  attachments: Types.DocumentArray<IAttachment & Document>;
  createdAt:   Date;
  updatedAt:   Date;
}

const attachmentSchema = new Schema<IAttachment>(
  {
    filename:     { type: String, required: true },
    originalName: { type: String, required: true },
    url:          { type: String, required: true },
    mimetype:     { type: String, required: true },
    size:         { type: Number, required: true },
    uploadedAt:   { type: Date, default: Date.now },
  },
  { _id: true }
);

const eventSchema = new Schema<IEvent>(
  {
    userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name:        { type: String, required: true, trim: true },
    date:        { type: Date, required: true },
    time:        { type: String, default: '' },
    venue:       { type: String, default: '' },
    guests:      { type: Number, default: 0, min: 0 },
    status:      { type: String, enum: ['confirmed', 'planning', 'pending'], default: 'pending' },
    desc:        { type: String, default: '' },
    attachments: { type: [attachmentSchema], default: [] },
  },
  { timestamps: true }
);

eventSchema.index({ userId: 1, date: 1 });
eventSchema.index({ userId: 1, status: 1 });

const Event = mongoose.model<IEvent>('Event', eventSchema);
export default Event;

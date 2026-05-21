import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAttachment {
  _id:          Types.ObjectId;
  filename:     string;
  originalName: string;
  url:          string;
  mimetype:     string;
  size:         number;
  uploadedAt:   Date;
}

export interface IVendor extends Document {
  userId:      Types.ObjectId;
  icon:        string;
  category:    string;
  name:        string;
  contact:     string;
  location:    string;
  status:      'booked' | 'shortlisted' | 'pending';
  rating:      number;
  notes:       string;
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

const vendorSchema = new Schema<IVendor>(
  {
    userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    icon:        { type: String, default: '🏢' },
    category:    { type: String, required: true, trim: true },
    name:        { type: String, required: true, trim: true },
    contact:     { type: String, default: '', trim: true },
    location:    { type: String, default: '', trim: true },
    status:      { type: String, enum: ['booked', 'shortlisted', 'pending'], default: 'pending' },
    rating:      { type: Number, default: 3, min: 1, max: 5 },
    notes:       { type: String, default: '', trim: true },
    attachments: { type: [attachmentSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<IVendor>('Vendor', vendorSchema);

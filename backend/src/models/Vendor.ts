import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAttachment {
  _id?:         Types.ObjectId;   // optional: Mongoose generates it on push
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
    icon:        { type: String, default: '🏢', maxlength: 10 },
    category:    { type: String, required: true, trim: true, maxlength: 100 },
    name:        { type: String, required: true, trim: true, maxlength: 100 },
    contact:     { type: String, default: '', trim: true, maxlength: 200 },
    location:    { type: String, default: '', trim: true, maxlength: 200 },
    status:      { type: String, enum: ['booked', 'shortlisted', 'pending'], default: 'pending' },
    rating:      { type: Number, default: 3, min: 1, max: 5 },
    notes:       { type: String, default: '', trim: true, maxlength: 2000 },
    attachments: { type: [attachmentSchema], default: [] },
  },
  { timestamps: true }
);

vendorSchema.index({ userId: 1, createdAt: 1 });
vendorSchema.index({ userId: 1, status: 1 });

export default mongoose.model<IVendor>('Vendor', vendorSchema);

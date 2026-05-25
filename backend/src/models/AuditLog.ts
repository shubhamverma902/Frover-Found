import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAuditLog extends Document {
  userId:    Types.ObjectId | null;
  action:    string;
  ip:        string;
  userAgent: string;
  meta:      Record<string, unknown>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId:    { type: Schema.Types.ObjectId, ref: 'User', default: null },
    action:    { type: String, required: true },
    ip:        { type: String, default: '' },
    userAgent: { type: String, default: '' },
    meta:      { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Compliance query patterns: "all events for user X", "all failures between date A and B"
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

export default mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

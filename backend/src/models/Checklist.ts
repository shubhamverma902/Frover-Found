import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITask {
  _id:         Types.ObjectId;
  label:       string;
  due:         string;
  done:        boolean;
  completedAt?: Date;
}

export interface IChecklistCategory extends Document {
  userId:   Types.ObjectId;
  icon:     string;
  category: string;
  tasks:    ITask[];
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    label:       { type: String,  required: true, trim: true },
    due:         { type: String,  default: '' },
    done:        { type: Boolean, default: false },
    completedAt: { type: Date,    default: null },
  },
  { _id: true }
);

const checklistCategorySchema = new Schema<IChecklistCategory>(
  {
    userId:   { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    icon:     { type: String, default: '✓' },
    category: { type: String, required: true, trim: true },
    tasks:    [taskSchema],
  },
  { timestamps: true }
);

checklistCategorySchema.index({ userId: 1, createdAt: 1 });
checklistCategorySchema.index({ userId: 1, category: 1 });

const ChecklistCategory = mongoose.model<IChecklistCategory>('ChecklistCategory', checklistCategorySchema);
export default ChecklistCategory;

import mongoose, { Document, Schema, Types } from 'mongoose';

// ── Budget Config (total per user) ────────────────────────

export interface IBudgetConfig extends Document {
  userId: Types.ObjectId;
  total:  number;
}

const budgetConfigSchema = new Schema<IBudgetConfig>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  total:  { type: Number, default: 0, min: 0 },
});

// ── Expense subdocument ───────────────────────────────────

export interface IExpense {
  _id:    Types.ObjectId;
  amount: number;
  note:   string;
  date:   Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    amount: { type: Number, required: true, min: 0 },
    note:   { type: String, default: '' },
    date:   { type: Date,   default: () => new Date() },
  },
  { _id: true }
);

// ── Budget Category ───────────────────────────────────────

export interface IBudgetCategory extends Document {
  userId:    Types.ObjectId;
  icon:      string;
  category:  string;
  allocated: number;
  expenses:  IExpense[];
  createdAt: Date;
  updatedAt: Date;
}

const budgetCategorySchema = new Schema<IBudgetCategory>(
  {
    userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    icon:      { type: String, default: '💰' },
    category:  { type: String, required: true, trim: true },
    allocated: { type: Number, default: 0, min: 0 },
    expenses:  [expenseSchema],
  },
  { timestamps: true }
);

budgetCategorySchema.index({ userId: 1, createdAt: 1 });

export const BudgetConfig   = mongoose.model<IBudgetConfig>('BudgetConfig', budgetConfigSchema);
export const BudgetCategory = mongoose.model<IBudgetCategory>('BudgetCategory', budgetCategorySchema);

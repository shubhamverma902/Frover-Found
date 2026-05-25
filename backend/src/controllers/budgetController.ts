import { Response, NextFunction } from "express";
import { BudgetCategory } from "../models/Budget";
import User from "../models/User";
import ApiError from "../utils/ApiError";
import { sendSuccess } from "../utils/ApiResponse";
import { AuthRequest } from "../types";
import logActivity from "../utils/logActivity";
import { serializeBudgetCategory } from "../helpers/serializers";
import { ownerId } from "../helpers/authHelpers";
import { sanitize } from "../utils/sanitize";
import { BUDGET_SEED_CATEGORIES } from "../constants/budgetSeeds";

// GET /api/v1/budget
export const getBudget = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const uid = ownerId(req);

    const [user, existingCats] = await Promise.all([
      User.findById(uid),
      BudgetCategory.find({ userId: uid }).sort({ createdAt: 1 }),
    ]);

    const total = user?.weddingProfile?.budget ?? 0;

    let cats = existingCats;
    if (cats.length === 0) {
      const inserted = await BudgetCategory.insertMany(
        BUDGET_SEED_CATEGORIES.map(c => ({ ...c, userId: uid }))
      );
      cats = inserted as unknown as typeof cats;
    }

    sendSuccess(res, {
      total,
      categories: cats.map(serializeBudgetCategory),
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/budget/total — writes back to the onboarding profile
export const updateTotal = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { total } = req.body;
    if (!total || Number(total) <= 0)
      return next(new ApiError(422, "Total must be a positive number"));

    const user = await User.findByIdAndUpdate(
      ownerId(req),
      { "weddingProfile.budget": Number(total) },
      { new: true },
    );

    sendSuccess(res, { total: user?.weddingProfile?.budget ?? Number(total) });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/budget/categories/:id/allocated
export const updateAllocated = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { allocated } = req.body;
    if (allocated === undefined || Number(allocated) < 0)
      return next(new ApiError(422, "Allocated must be ≥ 0"));

    const cat = await BudgetCategory.findOneAndUpdate(
      { _id: req.params.id, userId: ownerId(req) },
      { allocated: Number(allocated) },
      { new: true },
    );

    if (!cat) return next(new ApiError(404, "Category not found"));
    sendSuccess(res, { category: serializeBudgetCategory(cat) });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/budget/categories/:id/expenses
export const addExpense = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { amount, note } = req.body;
    if (!amount || Number(amount) <= 0)
      return next(new ApiError(422, "Amount must be positive"));

    const uid = ownerId(req);
    const cat = await BudgetCategory.findOneAndUpdate(
      { _id: req.params.id, userId: uid },
      {
        $push: {
          expenses: {
            amount: Number(amount),
            note: sanitize(note),
            date: new Date(),
          },
        },
      },
      { new: true },
    );

    if (!cat) return next(new ApiError(404, "Category not found"));
    logActivity(
      uid,
      "₹",
      `Expense recorded: ₹${Number(amount).toLocaleString("en-IN")} in ${cat.category}`,
    );
    sendSuccess(
      res,
      { category: serializeBudgetCategory(cat) },
      "Expense recorded",
      201,
    );
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/budget/categories/:id/expenses/:expId
export const deleteExpense = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const cat = await BudgetCategory.findOneAndUpdate(
      { _id: req.params.id, userId: ownerId(req) },
      { $pull: { expenses: { _id: req.params.expId } } },
      { new: true },
    );

    if (!cat) return next(new ApiError(404, "Category not found"));
    sendSuccess(
      res,
      { category: serializeBudgetCategory(cat) },
      "Expense deleted",
    );
  } catch (err) {
    next(err);
  }
};

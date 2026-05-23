'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Button, Input, FieldLabel } from '@/components/elements';
import { TrashIcon } from '@/components/icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateAllocated, deleteExpense, selectBudgetCategories, selectBudgetMutating } from '@/store/slices/budgetSlice';
import { fmt } from '@/utils/format';

interface EditCategoryModalProps {
  categoryName: string;
  onClose:      () => void;
}

const EditCategoryModal = ({ categoryName, onClose }: EditCategoryModalProps) => {
  const dispatch   = useAppDispatch();
  const categories = useAppSelector(selectBudgetCategories);
  const mutating   = useAppSelector(selectBudgetMutating);
  const cat        = categories.find(c => c.category === categoryName)!;

  const [allocated,      setAllocated]      = useState(String(cat.allocated));
  const [allocatedError, setAllocatedError] = useState('');
  const [deleteId,       setDeleteId]       = useState<string | null>(null);

  const allocatedChanged = Number(allocated) !== cat.allocated;

  const validateAllocated = (v: string) =>
    v === '' || isNaN(Number(v)) || Number(v) < 0 ? 'Must be 0 or more' : '';

  const handleSave = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const newAllocated = Number(allocated);
    const err = validateAllocated(allocated);
    if (err) { setAllocatedError(err); return; }
    if (allocatedChanged) {
      const result = await dispatch(updateAllocated({ categoryId: cat._id, allocated: newAllocated }));
      if (updateAllocated.fulfilled.match(result)) onClose();
    } else {
      onClose();
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    await dispatch(deleteExpense({ categoryId: cat._id, expenseId }));
    setDeleteId(null);
  };

  const previewPct = Number(allocated) > 0
    ? Math.round((cat.spent / Number(allocated)) * 100)
    : 0;
  const over = previewPct > 100;

  return (
    <Modal onClose={onClose} className="flex flex-col max-h-[90svh]">

      {/* Header — fixed */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#E4BC62]/15">
        <div>
          <p className="text-[10px] font-bold text-[#E4BC62] uppercase tracking-[0.4em] mb-0.5">Budget</p>
          <h2 className="text-base font-bold text-white">Edit Category</h2>
        </div>
        <div className="flex items-center gap-3">
          {allocatedChanged && (
            <span className="text-[10px] font-semibold text-[#DFB3AE] border border-[#DFB3AE]/30 px-2 py-0.5 uppercase tracking-widest">
              Unsaved
            </span>
          )}
          <Button variant="close" onClick={onClose}>✕</Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col min-h-0 flex-1">
        <div className="overflow-y-auto flex-1 min-h-0 px-6 pt-5 pb-2 space-y-5">

          {/* Category identity + stats */}
          <div className="flex items-center gap-3 p-4 bg-[#E4BC62]/8 border border-[#E4BC62]/20">
            <span className="text-2xl leading-none">{cat.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#E4BC62] truncate">{cat.category}</p>
              <p className="text-[10px] text-[#DDDED9]/40 mt-0.5">
                {fmt(cat.spent)} spent · {fmt(cat.allocated - cat.spent > 0 ? cat.allocated - cat.spent : 0)} remaining
              </p>
            </div>
            <span className={`text-xs font-black border px-2 py-0.5 shrink-0 ${
              over
                ? 'border-[#DFB3AE]/40 bg-[#DFB3AE]/8 text-[#DFB3AE]'
                : cat.spent / cat.allocated > 0.8
                ? 'border-[#E4BC62]/40 bg-[#E4BC62]/8 text-[#E4BC62]'
                : 'border-[#DDDED9]/20 text-[#DDDED9]/50'
            }`}>
              {Math.round((cat.spent / cat.allocated) * 100)}%
            </span>
          </div>

          {/* Ornament */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E4BC62]/15" />
            <span className="text-[#E4BC62]/30 text-[10px] tracking-[0.4em]">◆ ◆ ◆</span>
            <div className="flex-1 h-px bg-[#E4BC62]/15" />
          </div>

          {/* Allocated budget */}
          <div>
            <FieldLabel>Allocated Budget (₹) <span className="text-[#DFB3AE]">*</span></FieldLabel>
            <Input
              variant="dark"
              type="number"
              min={0}
              placeholder="e.g. 200000"
              value={allocated}
              onChange={e => {
                const v = e.target.value;
                setAllocated(v);
                if (allocatedError) setAllocatedError(validateAllocated(v));
              }}
              onBlur={() => setAllocatedError(validateAllocated(allocated))}
              error={!!allocatedError}
            />
            {allocatedError && <p className="text-xs text-red-400 mt-1">{allocatedError}</p>}
            {/* Live preview bar */}
            {allocatedChanged && Number(allocated) > 0 && (
              <div className="mt-2 space-y-1.5">
                <div className="relative h-2 bg-[#DDDED9]/15 overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full transition-all duration-500 ${
                      over
                        ? 'bg-gradient-to-r from-[#DFB3AE] to-[#DFB3AE]/70'
                        : previewPct > 80
                        ? 'bg-gradient-to-r from-[#E4BC62] to-[#DFB3AE]'
                        : 'bg-gradient-to-r from-[#23292E] to-[#E4BC62]'
                    }`}
                    style={{ width: `${Math.min(previewPct, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className={over ? 'text-[#DFB3AE]' : 'text-[#DDDED9]/40'}>
                    {over
                      ? `⚠ Over by ${fmt(cat.spent - Number(allocated))}`
                      : `${fmt(Number(allocated) - cat.spent)} will remain`}
                  </span>
                  <span className={`font-bold ${over ? 'text-[#DFB3AE]' : 'text-[#E4BC62]'}`}>{previewPct}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Expense list */}
          <div>
            <FieldLabel as="p">Expenses ({cat.expenses.length})</FieldLabel>
            {cat.expenses.length === 0 ? (
              <div className="flex items-center gap-3 px-4 py-4 border border-[#DDDED9]/15 bg-[#DDDED9]/5">
                <span className="text-[#DDDED9]/20 text-lg">◎</span>
                <p className="text-xs text-[#DDDED9]/35">No expenses recorded in this category yet.</p>
              </div>
            ) : (
              <div className="border border-[#DDDED9]/15 overflow-hidden">
                {cat.expenses.map((exp, i) => (
                  <div
                    key={exp._id}
                    className={`${i > 0 ? 'border-t border-[#DDDED9]/10' : ''}`}
                  >
                    {deleteId === exp._id ? (
                      <div className="flex items-center gap-2 px-4 py-3 bg-red-950/30 border-l-2 border-red-700/50">
                        <p className="flex-1 text-xs text-red-300/80">Remove {fmt(exp.amount)}?</p>
                        <button
                          type="button"
                          onClick={() => setDeleteId(null)}
                          className="px-2.5 py-1 text-[11px] font-semibold border border-[#DDDED9]/20 text-[#DDDED9]/50 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(exp._id)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-red-700 text-white hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <div className="group/exp flex items-center gap-3 px-4 py-3 hover:bg-[#DDDED9]/5 transition-colors">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E4BC62]/50 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white/70 truncate">{exp.note || '—'}</p>
                          <p className="text-[10px] text-[#DDDED9]/30 mt-0.5">{exp.date}</p>
                        </div>
                        <span className="text-sm font-black text-[#E4BC62] shrink-0">{fmt(exp.amount)}</span>
                        <button
                          type="button"
                          onClick={() => setDeleteId(exp._id)}
                          className="w-6 h-6 flex items-center justify-center text-[#DDDED9]/20 hover:text-red-400 transition-colors opacity-0 group-hover/exp:opacity-100 shrink-0"
                          title="Delete expense"
                        >
                          <TrashIcon size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {/* Total row */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#E4BC62]/8 border-t border-[#E4BC62]/15">
                  <p className="text-[10px] font-bold text-[#DDDED9]/40 uppercase tracking-widest">Total Spent</p>
                  <p className="text-sm font-black text-[#E4BC62]">{fmt(cat.spent)}</p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer — fixed */}
        <div className="flex-shrink-0 flex gap-3 px-6 py-4 border-t border-[#E4BC62]/10">
          <Button variant="cancel" type="button" onClick={onClose}>Close</Button>
          <Button variant="gold" type="submit" disabled={!allocatedChanged || mutating}>{mutating ? 'Saving…' : 'Save Changes ✦'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditCategoryModal;

'use client';

import { useState } from 'react';
import { ModalShell } from '@/components/ui';
import { Button, Input, FieldLabel } from '@/components/elements';
import { TrashIcon } from '@/components/icons';
import { useUpdateAllocatedMutation, useDeleteExpenseMutation, useGetBudgetQuery } from '@/store/api';
import { fmt } from '@/utils/format';

interface EditCategoryModalProps {
  categoryName: string;
  onClose:      () => void;
}

const EditCategoryModal = ({ categoryName, onClose }: EditCategoryModalProps) => {
  const [updateAllocated, { isLoading: saving }]          = useUpdateAllocatedMutation();
  const [deleteExpense,   { isLoading: deletingExpense }] = useDeleteExpenseMutation();
  const mutating = saving || deletingExpense;

  const { data: budget } = useGetBudgetQuery();
  const cat = budget?.categories.find(c => c.category === categoryName);

  const [allocated,      setAllocated]      = useState(String(cat?.allocated ?? 0));
  const [allocatedError, setAllocatedError] = useState('');
  const [deleteId,       setDeleteId]       = useState<string | null>(null);

  if (!cat) return null;

  const allocatedChanged = Number(allocated) !== cat.allocated;

  const validateAllocated = (v: string) =>
    v === '' || isNaN(Number(v)) || Number(v) < 0 ? 'Must be 0 or more' : '';

  const handleSave = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const err = validateAllocated(allocated);
    if (err) { setAllocatedError(err); return; }
    if (allocatedChanged) {
      try {
        await updateAllocated({ categoryId: cat._id, allocated: Number(allocated) }).unwrap();
        onClose();
      } catch { }
    } else {
      onClose();
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteExpense({ categoryId: cat._id, expenseId }).unwrap();
      setDeleteId(null);
    } catch { }
  };

  const previewPct = Number(allocated) > 0
    ? Math.round((cat.spent / Number(allocated)) * 100)
    : 0;
  const over = previewPct > 100;

  const unsavedBadge = allocatedChanged && (
    <span className="text-[10px] font-semibold text-blush border border-blush/30 px-2 py-0.5 uppercase tracking-widest">
      Unsaved
    </span>
  );

  return (
    <ModalShell
      onClose={onClose}
      eyebrow="Budget"
      title="Edit Category"
      aria-label="Edit budget category"
      headerSlot={unsavedBadge}
    >
      <ModalShell.Form onSubmit={handleSave}>
        <ModalShell.Body className="pb-2 space-y-5">

          <div className="flex items-center gap-3 p-4 bg-gold/8 border border-gold/20">
            <span className="text-2xl leading-none">{cat.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gold truncate">{cat.category}</p>
              <p className="text-[10px] text-silver/40 mt-0.5">
                {fmt(cat.spent)} spent · {fmt(cat.allocated - cat.spent > 0 ? cat.allocated - cat.spent : 0)} remaining
              </p>
            </div>
            <span className={`text-xs font-black border px-2 py-0.5 shrink-0 ${
              over
                ? 'border-blush/40 bg-blush/8 text-blush'
                : cat.spent / cat.allocated > 0.8
                ? 'border-gold/40 bg-gold/8 text-gold'
                : 'border-silver/20 text-silver/50'
            }`}>
              {Math.round((cat.spent / cat.allocated) * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gold/15" />
            <span className="text-gold/30 text-[10px] tracking-[0.4em]">◆ ◆ ◆</span>
            <div className="flex-1 h-px bg-gold/15" />
          </div>

          <div>
            <FieldLabel>Allocated Budget (₹) <span className="text-blush">*</span></FieldLabel>
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
            {allocatedChanged && Number(allocated) > 0 && (
              <div className="mt-2 space-y-1.5">
                <div className="relative h-2 bg-silver/15 overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full transition-all duration-500 ${
                      over
                        ? 'bg-gradient-to-r from-blush to-blush/70'
                        : previewPct > 80
                        ? 'bg-gradient-to-r from-gold to-blush'
                        : 'bg-gradient-to-r from-dark to-gold'
                    }`}
                    style={{ width: `${Math.min(previewPct, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className={over ? 'text-blush' : 'text-silver/40'}>
                    {over
                      ? `⚠ Over by ${fmt(cat.spent - Number(allocated))}`
                      : `${fmt(Number(allocated) - cat.spent)} will remain`}
                  </span>
                  <span className={`font-bold ${over ? 'text-blush' : 'text-gold'}`}>{previewPct}%</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <FieldLabel as="p">Expenses ({cat.expenses.length})</FieldLabel>
            {cat.expenses.length === 0 ? (
              <div className="flex items-center gap-3 px-4 py-4 border border-silver/15 bg-silver/5">
                <span className="text-silver/20 text-lg">◎</span>
                <p className="text-xs text-silver/35">No expenses recorded in this category yet.</p>
              </div>
            ) : (
              <div className="border border-silver/15 overflow-hidden">
                {cat.expenses.map((exp, i) => (
                  <div key={exp._id} className={`${i > 0 ? 'border-t border-silver/10' : ''}`}>
                    {deleteId === exp._id ? (
                      <div className="flex items-center gap-2 px-4 py-3 bg-red-950/30 border-l-2 border-red-700/50">
                        <p className="flex-1 text-xs text-red-300/80">Remove {fmt(exp.amount)}?</p>
                        <Button variant="cancel-sm" type="button" onClick={() => setDeleteId(null)}>Cancel</Button>
                        <Button variant="danger" type="button" onClick={() => handleDeleteExpense(exp._id)} disabled={deletingExpense}>
                          {deletingExpense ? '…' : 'Delete'}
                        </Button>
                      </div>
                    ) : (
                      <div className="group/exp flex items-center gap-3 px-4 py-3 hover:bg-silver/5 transition-colors">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold/50 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white/70 truncate">{exp.note || '—'}</p>
                          <p className="text-[10px] text-silver/30 mt-0.5">{exp.date}</p>
                        </div>
                        <span className="text-sm font-black text-gold shrink-0">{fmt(exp.amount)}</span>
                        <button
                          type="button"
                          onClick={() => setDeleteId(exp._id)}
                          className="w-6 h-6 flex items-center justify-center text-silver/20 hover:text-red-400 transition-colors opacity-0 group-hover/exp:opacity-100 shrink-0"
                          title="Delete expense"
                        >
                          <TrashIcon size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex items-center justify-between px-4 py-2.5 bg-gold/8 border-t border-gold/15">
                  <p className="text-[10px] font-bold text-silver/40 uppercase tracking-widest">Total Spent</p>
                  <p className="text-sm font-black text-gold">{fmt(cat.spent)}</p>
                </div>
              </div>
            )}
          </div>

        </ModalShell.Body>
        <ModalShell.Footer>
          <Button variant="cancel" type="button" onClick={onClose}>Close</Button>
          <Button variant="gold" type="submit" disabled={!allocatedChanged || mutating}>
            {mutating ? 'Saving…' : 'Save Changes ✦'}
          </Button>
        </ModalShell.Footer>
      </ModalShell.Form>
    </ModalShell>
  );
};

export default EditCategoryModal;

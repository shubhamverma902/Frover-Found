'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Button, Input, FieldLabel } from '@/components/elements';
import { CheckIcon } from '@/components/icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addExpense, selectBudgetCategories, selectBudgetMutating } from '@/store/slices/budgetSlice';
import { fmt } from '@/utils/format';

interface AddExpenseModalProps {
  onClose: () => void;
}

const AddExpenseModal = ({ onClose }: AddExpenseModalProps) => {
  const dispatch   = useAppDispatch();
  const categories = useAppSelector(selectBudgetCategories);
  const mutating   = useAppSelector(selectBudgetMutating);

  const [category,     setCategory]     = useState(categories[0]?.category ?? '');
  const [amount,       setAmount]       = useState('');
  const [amountError,  setAmountError]  = useState('');
  const [note,         setNote]         = useState('');
  const [submitErr,    setSubmitErr]    = useState('');

  const selectedCat = categories.find(c => c.category === category);
  const remaining   = selectedCat ? selectedCat.allocated - selectedCat.spent : 0;

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) { setAmountError('Enter a value greater than 0'); return; }
    if (!selectedCat) return;
    setSubmitErr('');
    const result = await dispatch(addExpense({ categoryId: selectedCat._id, amount: amt, note: note.trim() }));
    if (addExpense.fulfilled.match(result)) {
      onClose();
    } else {
      setSubmitErr((result.payload as string) || 'Failed to record expense. Please try again.');
    }
  };

  return (
    <Modal onClose={onClose} className="flex flex-col max-h-[90svh]">

      {/* Header — fixed */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#E4BC62]/15">
        <div>
          <p className="text-[10px] font-bold text-[#E4BC62] uppercase tracking-[0.4em] mb-0.5">Budget</p>
          <h2 className="text-base font-bold text-white">Add Expense</h2>
        </div>
        <Button variant="close" onClick={onClose}>✕</Button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
        <div className="overflow-y-auto flex-1 min-h-0 px-6 pt-5 pb-2 space-y-4">

          {/* API error */}
          {submitErr && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 border border-[#DFB3AE]/50 bg-[#DFB3AE]/10 text-xs text-[#DFB3AE]">
              <span>{submitErr}</span>
              <button type="button" onClick={() => setSubmitErr('')} className="shrink-0 hover:text-white transition-colors">✕</button>
            </div>
          )}

          {/* Ornament */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E4BC62]/15" />
            <span className="text-[#E4BC62]/30 text-[10px] tracking-[0.4em]">◆ ◆ ◆</span>
            <div className="flex-1 h-px bg-[#E4BC62]/15" />
          </div>

          {/* Category */}
          <div>
            <FieldLabel>Category <span className="text-[#DFB3AE]">*</span></FieldLabel>
            {categories.length === 0 && (
              <p className="text-xs text-[#DDDED9]/40 py-3 text-center border border-dashed border-[#DDDED9]/15">
                No categories found. Complete onboarding to auto-populate budget categories.
              </p>
            )}
            <div className="flex flex-col gap-1.5">
              {categories.map(cat => (
                <label
                  key={cat.category}
                  className={`flex items-center gap-3 px-3 py-2.5 border cursor-pointer transition-colors ${
                    category === cat.category
                      ? 'border-[#E4BC62]/40 bg-[#E4BC62]/8'
                      : 'border-[#DDDED9]/15 hover:border-[#DDDED9]/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat.category}
                    checked={category === cat.category}
                    onChange={() => setCategory(cat.category)}
                    className="sr-only"
                  />
                  <span className="text-base leading-none shrink-0">{cat.icon}</span>
                  <span className={`text-xs font-semibold flex-1 ${category === cat.category ? 'text-[#E4BC62]' : 'text-[#DDDED9]/50'}`}>
                    {cat.category}
                  </span>
                  <span className="text-[10px] text-[#DDDED9]/35 shrink-0">
                    {fmt(cat.allocated - cat.spent)} left
                  </span>
                  {category === cat.category && (
                    <CheckIcon size={10} className="shrink-0 text-[#E4BC62]" strokeWidth={1.8} />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <FieldLabel>Amount (₹) <span className="text-[#DFB3AE]">*</span></FieldLabel>
            <Input
              variant="dark"
              type="number"
              min={1}
              placeholder="e.g. 50000"
              value={amount}
              onChange={e => {
                const v = e.target.value;
                setAmount(v);
                if (amountError) setAmountError(!v || Number(v) <= 0 ? 'Enter a value greater than 0' : '');
              }}
              onBlur={() => { if (!amount || Number(amount) <= 0) setAmountError('Enter a value greater than 0'); }}
              error={!!amountError}
            />
            {amountError && <p className="text-xs text-red-400 mt-1">{amountError}</p>}
            {selectedCat && (
              <p className={`text-[10px] mt-1.5 ${Number(amount) > remaining ? 'text-[#DFB3AE]' : 'text-[#DDDED9]/35'}`}>
                {Number(amount) > remaining
                  ? `⚠ Exceeds remaining budget by ${fmt(Number(amount) - remaining)}`
                  : `${fmt(remaining)} remaining in this category`}
              </p>
            )}
          </div>

          {/* Note */}
          <div>
            <FieldLabel>
              Note <span className="text-[#DDDED9]/30 normal-case tracking-normal font-normal">(optional)</span>
            </FieldLabel>
            <Input
              variant="dark"
              placeholder="e.g. Advance payment to vendor"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

        </div>

        {/* Footer — fixed */}
        <div className="flex-shrink-0 flex gap-3 px-6 py-4 border-t border-[#E4BC62]/10">
          <Button variant="cancel" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="gold" type="submit" disabled={!category || !amount || Number(amount) <= 0 || mutating}>{mutating ? 'Saving…' : 'Record Expense ✦'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddExpenseModal;

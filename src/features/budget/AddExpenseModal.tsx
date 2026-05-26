'use client';

import { useState } from 'react';
import { ModalShell } from '@/components/ui';
import { Button, Input, FieldLabel } from '@/components/elements';
import { CheckIcon } from '@/components/icons';
import { useAddExpenseMutation, useGetBudgetQuery } from '@/store/api';
import { fmt } from '@/utils/format';

interface AddExpenseModalProps {
  onClose: () => void;
}

const AddExpenseModal = ({ onClose }: AddExpenseModalProps) => {
  const [addExpense, { isLoading: mutating }] = useAddExpenseMutation();
  const { data: budget } = useGetBudgetQuery();
  const categories = budget?.categories ?? [];

  const [category,    setCategory]    = useState(categories[0]?.category ?? '');
  const [amount,      setAmount]      = useState('');
  const [amountError, setAmountError] = useState('');
  const [note,        setNote]        = useState('');
  const [submitErr,   setSubmitErr]   = useState('');

  const selectedCat = categories.find(c => c.category === category);
  const remaining   = selectedCat ? selectedCat.allocated - selectedCat.spent : 0;

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) { setAmountError('Enter a value greater than 0'); return; }
    if (!selectedCat) return;
    setSubmitErr('');
    try {
      await addExpense({ categoryId: selectedCat._id, amount: amt, note: note.trim() }).unwrap();
      onClose();
    } catch (e) {
      setSubmitErr((e as { error?: string })?.error || 'Failed to record expense. Please try again.');
    }
  };

  return (
    <ModalShell onClose={onClose} eyebrow="Budget" title="Add Expense" aria-label="Add expense">
      <ModalShell.Form onSubmit={handleSubmit}>
        <ModalShell.Body>

          {submitErr && (
            <div role="alert" className="flex items-center justify-between gap-3 px-4 py-3 border border-blush/50 bg-blush/10 text-xs text-blush">
              <span>{submitErr}</span>
              <button type="button" aria-label="Dismiss error" onClick={() => setSubmitErr('')} className="shrink-0 hover:text-white transition-colors">✕</button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gold/15" />
            <span className="text-gold/30 text-[10px] tracking-[0.4em]">◆ ◆ ◆</span>
            <div className="flex-1 h-px bg-gold/15" />
          </div>

          <div>
            <FieldLabel>Category <span className="text-blush">*</span></FieldLabel>
            {categories.length === 0 && (
              <p className="text-xs text-silver/40 py-3 text-center border border-dashed border-silver/15">
                No categories found. Complete onboarding to auto-populate budget categories.
              </p>
            )}
            <div className="flex flex-col gap-1.5">
              {categories.map(cat => (
                <label
                  key={cat.category}
                  className={`flex items-center gap-3 px-3 py-2.5 border cursor-pointer transition-colors ${
                    category === cat.category
                      ? 'border-gold/40 bg-gold/8'
                      : 'border-silver/15 hover:border-silver/30'
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
                  <span className={`text-xs font-semibold flex-1 ${category === cat.category ? 'text-gold' : 'text-silver/50'}`}>
                    {cat.category}
                  </span>
                  <span className="text-[10px] text-silver/35 shrink-0">
                    {fmt(cat.allocated - cat.spent)} left
                  </span>
                  {category === cat.category && (
                    <CheckIcon size={10} className="shrink-0 text-gold" strokeWidth={1.8} />
                  )}
                </label>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>Amount (₹) <span className="text-blush">*</span></FieldLabel>
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
              <p className={`text-[10px] mt-1.5 ${Number(amount) > remaining ? 'text-blush' : 'text-silver/35'}`}>
                {Number(amount) > remaining
                  ? `⚠ Exceeds remaining budget by ${fmt(Number(amount) - remaining)}`
                  : `${fmt(remaining)} remaining in this category`}
              </p>
            )}
          </div>

          <div>
            <FieldLabel>
              Note <span className="text-silver/30 normal-case tracking-normal font-normal">(optional)</span>
            </FieldLabel>
            <Input
              variant="dark"
              placeholder="e.g. Advance payment to vendor"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

        </ModalShell.Body>
        <ModalShell.Footer>
          <Button variant="cancel" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="gold" type="submit" disabled={!category || !amount || Number(amount) <= 0 || mutating}>
            {mutating ? 'Saving…' : 'Record Expense ✦'}
          </Button>
        </ModalShell.Footer>
      </ModalShell.Form>
    </ModalShell>
  );
};

export default AddExpenseModal;

'use client';

import { useRef, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/elements';
import { useImportGuestsMutation } from '@/store/api';

interface ImportGuestModalProps {
  onClose: () => void;
}

const ImportGuestModal = ({ onClose }: ImportGuestModalProps) => {
  const fileInputRef              = useRef<HTMLInputElement>(null);
  const [file,    setFile]        = useState<File | null>(null);
  const [result,  setResult]      = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const [importGuests, { isLoading }] = useImportGuestsMutation();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResult(null);
    setFile(e.target.files?.[0] ?? null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const res = await importGuests(fd);
    if ('data' in res) {
      setResult(res.data);
      if (res.data.imported > 0) setFile(null);
    }
  };

  const handleDownloadTemplate = () => {
    const csv = 'name,relation,phone,rsvp,meal,plusOne\nPriya Sharma,Sister,+91 98765 43210,confirmed,Veg,false\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'guests-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal onClose={onClose} aria-label="Import guests">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4BC62]/15">
        <div>
          <p className="text-[10px] font-bold text-[#E4BC62] uppercase tracking-[0.4em] mb-0.5">Guests</p>
          <h2 className="text-base font-bold text-white">Import from CSV</h2>
        </div>
        <Button variant="close" onClick={onClose}>✕</Button>
      </div>

      <form onSubmit={handleSubmit} className="px-6 pt-5 pb-6 space-y-5">

        {/* Ornament */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E4BC62]/15" />
          <span className="text-[#E4BC62]/30 text-[10px] tracking-[0.4em]">◆ ◆ ◆</span>
          <div className="flex-1 h-px bg-[#E4BC62]/15" />
        </div>

        {/* Format note */}
        <div className="text-xs text-[#DDDED9]/50 space-y-1">
          <p>Required column: <span className="text-[#E4BC62]/70">name</span></p>
          <p>Optional: <span className="text-[#DDDED9]/70">relation, phone, rsvp, meal, plusOne</span></p>
          <p>Valid rsvp: confirmed / pending / declined &nbsp;·&nbsp; meal: Veg / Non-veg / Jain</p>
        </div>

        {/* Drop zone / file input */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative flex flex-col items-center justify-center gap-2 px-4 py-8 border border-dashed border-[#E4BC62]/25 cursor-pointer hover:border-[#E4BC62]/50 transition-colors group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFile}
            className="sr-only"
          />
          <span className="text-2xl text-[#E4BC62]/40 group-hover:text-[#E4BC62]/70 transition-colors">↑</span>
          {file ? (
            <p className="text-xs text-[#E4BC62] font-semibold">{file.name}</p>
          ) : (
            <p className="text-xs text-[#DDDED9]/40">Click to choose a CSV file</p>
          )}
        </div>

        {/* Result summary */}
        {result && (
          <div className={`px-4 py-3 border text-xs space-y-1 ${result.imported > 0 ? 'border-[#E4BC62]/30 bg-[#E4BC62]/5' : 'border-red-500/30 bg-red-500/5'}`}>
            <p className="font-bold text-[#E4BC62]">
              {result.imported} imported{result.skipped > 0 ? `, ${result.skipped} skipped` : ''}
            </p>
            {result.errors.slice(0, 5).map((err, i) => (
              <p key={i} className="text-[#DDDED9]/50">{err}</p>
            ))}
            {result.errors.length > 5 && (
              <p className="text-[#DDDED9]/40">…and {result.errors.length - 5} more</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="text-xs text-[#DDDED9]/40 hover:text-[#E4BC62]/70 transition-colors underline underline-offset-2"
          >
            Download template
          </button>
          <div className="flex-1" />
          <Button variant="cancel" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="gold" type="submit" disabled={!file || isLoading}>
            {isLoading ? 'Importing…' : 'Import ✦'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ImportGuestModal;

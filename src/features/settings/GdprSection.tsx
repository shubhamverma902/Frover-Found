'use client';

import { useState } from 'react';

interface Props {
  onExport: () => Promise<void>;
}

export const GdprSection = ({ onExport }: Props) => {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      await onExport();
    } catch {
      setExportError('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-card px-6 py-5">
      <h3 className="text-sm font-bold text-dark dark:text-background mb-1">Your Data</h3>
      <p className="text-xs text-zinc-400 dark:text-silver/50 mb-4">
        Download a copy of all personal data we hold for your account — your profile, events, guests, vendors, budget, and more.
      </p>
      <button
        onClick={handleExport}
        disabled={exporting}
        className="px-5 py-2.5 text-xs font-semibold border border-silver dark:border-[#2a2f33] text-zinc-500 dark:text-silver/60 hover:border-dark hover:text-dark dark:hover:border-background dark:hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {exporting ? 'Preparing download…' : 'Export My Data'}
      </button>
      {exportError && (
        <p className="mt-2 text-xs text-red-400">{exportError}</p>
      )}
    </div>
  );
};

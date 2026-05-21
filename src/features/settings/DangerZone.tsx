'use client';

import { useState } from 'react';

interface Props {
  onSignOut: () => void;
  onDeleteAccount: () => void;
}

export const DangerZone = ({ onSignOut, onDeleteAccount }: Props) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="border border-[#DFB3AE]/30 bg-card px-6 py-5 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#DFB3AE]" />
      <h3 className="text-sm font-bold text-[#23292E] dark:text-[#FDFDF8] mb-1">Danger Zone</h3>
      <p className="text-xs text-zinc-400 dark:text-[#DDDED9]/50 mb-4">These actions are permanent and cannot be undone.</p>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onSignOut}
          className="px-5 py-2.5 text-xs font-semibold border border-[#DDDED9] dark:border-[#2a2f33] text-zinc-500 dark:text-[#DDDED9]/60 hover:border-[#DFB3AE] hover:text-[#23292E] dark:hover:text-white transition-all"
        >
          Sign Out
        </button>
        {confirmDelete ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-950/30 border border-red-700/30">
            <p className="text-xs text-red-300/80">This will permanently delete your account and all data.</p>
            <button onClick={() => setConfirmDelete(false)} className="px-2.5 py-1 text-[11px] border border-[#DDDED9]/20 text-[#DDDED9]/50 hover:text-white transition-colors">
              Cancel
            </button>
            <button onClick={onDeleteAccount} className="px-2.5 py-1 text-[11px] font-bold bg-red-700 text-white hover:bg-red-600 transition-colors">
              Delete
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-5 py-2.5 text-xs font-semibold border border-[#DFB3AE]/40 text-[#DFB3AE] hover:bg-[#DFB3AE]/8 hover:border-[#DFB3AE] transition-all"
          >
            Delete Account
          </button>
        )}
      </div>
    </div>
  );
};

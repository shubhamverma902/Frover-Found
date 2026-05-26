'use client';

import { useState } from 'react';
import { Button } from '@/components/elements';

interface Props {
  onSignOut: () => void;
  onDeleteAccount: () => void;
}

export const DangerZone = ({ onSignOut, onDeleteAccount }: Props) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="rounded-2xl border border-blush/30 bg-card px-6 py-5 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blush" />
      <h3 className="text-sm font-bold text-dark dark:text-white mb-1">Danger Zone</h3>
      <p className="text-xs text-zinc-400 dark:text-silver/50 mb-4">These actions are permanent and cannot be undone.</p>
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={onSignOut}>Sign Out</Button>
        {confirmDelete ? (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950/30 border border-red-700/30">
            <p className="text-xs text-red-300/80">This will permanently delete your account and all data.</p>
            <Button variant="cancel-sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button variant="danger" onClick={onDeleteAccount}>Delete</Button>
          </div>
        ) : (
          <Button variant="outline-blush" onClick={() => setConfirmDelete(true)}>Delete Account</Button>
        )}
      </div>
    </div>
  );
};

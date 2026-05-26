import type { FC } from 'react';
import { Button } from '@/components/elements';

interface Props {
  saving: boolean;
  label: string;
  disabled?: boolean;
}

export const SettingsSaveBtn: FC<Props> = ({ saving, label, disabled }) => (
  <Button
    variant="save"
    type="submit"
    disabled={disabled || saving}
    className="mt-5"
  >
    {saving ? 'Saving…' : label}
  </Button>
);

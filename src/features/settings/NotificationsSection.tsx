import { Toggle } from '@/components/elements';
import { SettingsSection } from './SettingsSection';

interface Notification {
  key: string;
  label: string;
  sub: string;
  on: boolean;
}

interface Props {
  notifications: Notification[];
  onToggle: (key: string) => void;
}

export const NotificationsSection = ({ notifications, onToggle }: Props) => (
  <SettingsSection icon="🔔" title="Notifications">
    <div className="space-y-2">
      {notifications.map(n => (
        <div
          key={n.key}
          className={`flex items-center justify-between px-4 py-3.5 border transition-all duration-200 ${
            n.on
              ? 'border-gold/30 bg-gold/5 hover:bg-gold/8'
              : 'border-silver dark:border-[#2a2f33] hover:border-blush/40 hover:bg-silver/10 dark:hover:bg-silver/8'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-1.5 h-8 shrink-0 transition-colors ${n.on ? 'bg-gold' : 'bg-silver'}`} />
            <div>
              <p className={`text-sm font-semibold transition-colors ${n.on ? 'text-dark dark:text-background' : 'text-zinc-500 dark:text-silver/60'}`}>
                {n.label}
              </p>
              <p className="text-[11px] text-zinc-400 dark:text-silver/50 mt-0.5">{n.sub}</p>
            </div>
          </div>
          <Toggle checked={n.on} onChange={() => onToggle(n.key)} />
        </div>
      ))}
    </div>
  </SettingsSection>
);

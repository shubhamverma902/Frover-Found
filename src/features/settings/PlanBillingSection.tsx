import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/authSlice';
import { Logo } from '@/components/layout';
import { PLAN_FEATURES } from '@/constants/settings';
import { SettingsSection } from './SettingsSection';

export const PlanBillingSection = () => {
  const user    = useAppSelector(selectUser);
  const premium = user?.plan === 'premium';

  return (
  <SettingsSection icon="✦" title="Plan & Billing">
    <div className="bg-[#23292E] border border-[#E4BC62]/20 p-1 mb-6">
      <div className="border border-[#E4BC62]/15 px-6 py-5 flex items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute inset-0 shimmer pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1.5">
            <Logo size="sm" theme="light" href="/" />
            <span className="text-[10px] font-bold text-[#E4BC62] border border-[#E4BC62]/30 px-1.5 py-0.5 uppercase tracking-widest">
              {premium ? 'Premium' : 'Free Plan'}
            </span>
          </div>
          <p className="text-xs text-[#DDDED9]/60 leading-relaxed max-w-sm">
            {premium
              ? 'You have full access to all Premium features including vendor management, budget analytics, and priority support.'
              : 'Upgrade to Premium for vendor management, budget analytics, unlimited guests & priority support.'}
          </p>
        </div>
        {!premium && (
          <button className="relative shrink-0 px-6 py-2.5 text-xs font-semibold bg-[#E4BC62] text-[#23292E] hover:bg-[#E4BC62]/90 hover:shadow-[0_4px_14px_rgba(228,188,98,0.4)] transition-all whitespace-nowrap">
            Upgrade ✦
          </button>
        )}
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
      {PLAN_FEATURES.map(({ feature, free }) => (
        <div
          key={feature}
          className={`flex items-center gap-3 px-4 py-3.5 border text-xs transition-all duration-200 lift ${
            free
              ? 'border-[#E4BC62]/30 bg-[#E4BC62]/5 text-[#23292E] dark:text-[#FDFDF8]'
              : 'border-[#DDDED9] dark:border-[#2a2f33] text-zinc-400 dark:text-[#DDDED9]/50 hover:border-[#DFB3AE]/30'
          }`}
        >
          <span className={`text-base shrink-0 ${free ? 'text-[#E4BC62]' : 'text-[#DDDED9]'}`}>{free ? '✓' : '✦'}</span>
          <span className={free ? 'font-medium' : ''}>{feature}</span>
          {!free && (
            <span className="ml-auto text-[9px] font-bold text-[#DFB3AE] border border-[#DFB3AE]/30 px-1.5 py-0.5 uppercase tracking-widest">Pro</span>
          )}
        </div>
      ))}
    </div>
  </SettingsSection>
  );
};

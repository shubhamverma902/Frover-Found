import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/authSlice';
import { Logo } from '@/components/layout';
import { PLAN_FEATURES } from '@/constants/settings';
import { SettingsSection } from './SettingsSection';
import { Button } from '@/components/elements';

export const PlanBillingSection = () => {
  const user    = useAppSelector(selectUser);
  const premium = user?.plan === 'premium';

  return (
  <SettingsSection icon="✦" title="Plan & Billing">
    <div className="bg-subtle dark:bg-dark border border-blush/20 dark:border-gold/20 rounded-2xl p-1 mb-6">
      <div className="border border-gold/15 px-6 py-5 flex items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute inset-0 shimmer pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1.5">
            <Logo size="sm" theme="auto" href="/" />
            <span className="text-[10px] font-bold text-gold border border-gold/30 px-1.5 py-0.5 uppercase tracking-widest">
              {premium ? 'Premium' : 'Free Plan'}
            </span>
          </div>
          <p className="text-xs text-silver/60 leading-relaxed max-w-sm">
            {premium
              ? 'You have full access to all Premium features including vendor management, budget analytics, and priority support.'
              : 'Upgrade to Premium for vendor management, budget analytics, unlimited guests & priority support.'}
          </p>
        </div>
        {!premium && (
          <Button variant="gold-cta" className="shrink-0">
            Upgrade ✦
          </Button>
        )}
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
      {PLAN_FEATURES.map(({ feature, free }) => (
        <div
          key={feature}
          className={`flex items-center gap-3 px-4 py-3.5 border text-xs transition-all duration-200 lift ${
            free
              ? 'border-gold/30 bg-gold/5 text-dark dark:text-white'
              : 'border-silver dark:border-[#3D3268] text-zinc-400 dark:text-silver/50 hover:border-blush/30'
          }`}
        >
          <span className={`text-base shrink-0 ${free ? 'text-gold' : 'text-silver'}`}>{free ? '✓' : '✦'}</span>
          <span className={free ? 'font-medium' : ''}>{feature}</span>
          {!free && (
            <span className="ml-auto text-[9px] font-bold text-blush border border-blush/30 px-1.5 py-0.5 uppercase tracking-widest">Pro</span>
          )}
        </div>
      ))}
    </div>
  </SettingsSection>
  );
};
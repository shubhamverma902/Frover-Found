import { Button } from '@/components/elements';

export const PremiumNudge = () => (
  <div className="bg-subtle dark:bg-dark rounded-2xl border border-blush/20 dark:border-gold/20 p-1">
    <div className="border border-blush/15 dark:border-gold/20 rounded-xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <p className="text-[10px] font-semibold text-blush dark:text-gold uppercase tracking-[0.35em] mb-1">Premium Plan</p>
        <h3 className="text-base font-bold text-dark dark:text-white">Get priority support</h3>
        <p className="text-xs text-silver dark:text-silver/50 mt-1">
          Premium members get dedicated support with response times under 2 hours.
        </p>
      </div>
      <Button variant="gold-cta" className="shrink-0">Upgrade ✦</Button>
    </div>
  </div>
);

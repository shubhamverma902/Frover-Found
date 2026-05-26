import { Button } from '@/components/elements';

export const PremiumNudge = () => (
  <div className="bg-dark p-1">
    <div className="border border-gold/20 px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <p className="text-[10px] font-semibold text-gold uppercase tracking-[0.35em] mb-1">Premium Plan</p>
        <h3 className="text-base font-bold text-white">Get priority support</h3>
        <p className="text-xs text-silver/50 mt-1">
          Premium members get dedicated support with response times under 2 hours.
        </p>
      </div>
      <Button variant="gold-cta" className="shrink-0">Upgrade ✦</Button>
    </div>
  </div>
);

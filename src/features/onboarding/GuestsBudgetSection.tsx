import { Input } from '@/components/elements';
import { OnboardingSection } from './OnboardingSection';
import { OnboardingField } from './OnboardingField';

interface Props {
  guestCount: string;
  budget: string;
  errorGuests?: string;
  errorBudget?: string;
  onChangeGuests: (v: string) => void;
  onChangeBudget: (v: string) => void;
  onBlurGuests?: () => void;
  onBlurBudget?: () => void;
}

export const GuestsBudgetSection = ({ guestCount, budget, errorGuests, errorBudget, onChangeGuests, onChangeBudget, onBlurGuests, onBlurBudget }: Props) => (
  <OnboardingSection n="03" label="Guests & Budget">
    <OnboardingField label="Approximate Guest Count" error={errorGuests}>
      <Input type="number" placeholder="e.g. 300" min={1}
        value={guestCount} onChange={e => onChangeGuests(e.target.value)} onBlur={onBlurGuests}
        error={!!errorGuests} width="100%" height={48} />
    </OnboardingField>
    <div className="mt-4">
      <OnboardingField label="Total Budget (₹)" error={errorBudget}>
        <Input type="number" placeholder="e.g. 2000000" min={1}
          value={budget} onChange={e => onChangeBudget(e.target.value)} onBlur={onBlurBudget}
          error={!!errorBudget} width="100%" height={48} />
      </OnboardingField>
    </div>
  </OnboardingSection>
);

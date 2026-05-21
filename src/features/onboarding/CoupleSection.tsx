import { Input } from '@/components/elements';
import { OnboardingSection } from './OnboardingSection';
import { OnboardingField } from './OnboardingField';

interface Props {
  partner1: string;
  partner2: string;
  error1?: string;
  error2?: string;
  onChangePartner1: (v: string) => void;
  onChangePartner2: (v: string) => void;
  onBlurPartner1?: () => void;
  onBlurPartner2?: () => void;
}

export const CoupleSection = ({ partner1, partner2, error1, error2, onChangePartner1, onChangePartner2, onBlurPartner1, onBlurPartner2 }: Props) => (
  <OnboardingSection n="01" label="The Couple">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <OnboardingField label="Partner 1 Name" error={error1}>
        <Input type="text" placeholder="e.g. Priya Sharma"
          value={partner1} onChange={e => onChangePartner1(e.target.value)} onBlur={onBlurPartner1}
          error={!!error1} width="100%" height={48} />
      </OnboardingField>
      <OnboardingField label="Partner 2 Name" error={error2}>
        <Input type="text" placeholder="e.g. Rahul Verma"
          value={partner2} onChange={e => onChangePartner2(e.target.value)} onBlur={onBlurPartner2}
          error={!!error2} width="100%" height={48} />
      </OnboardingField>
    </div>
  </OnboardingSection>
);

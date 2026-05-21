import { Input } from '@/components/elements';
import { OnboardingSection } from './OnboardingSection';
import { OnboardingField } from './OnboardingField';

interface Props {
  weddingDate: string;
  city: string;
  errorDate?: string;
  errorCity?: string;
  onChangeDate: (v: string) => void;
  onChangeCity: (v: string) => void;
}

export const DateVenueSection = ({ weddingDate, city, errorDate, errorCity, onChangeDate, onChangeCity }: Props) => (
  <OnboardingSection n="02" label="Date & Venue">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <OnboardingField label="Wedding Date" error={errorDate}>
        <Input type="date"
          value={weddingDate} onChange={e => onChangeDate(e.target.value)}
          width="100%" height={48} />
      </OnboardingField>
      <OnboardingField label="City / Location" error={errorCity}>
        <Input type="text" placeholder="e.g. Mumbai"
          value={city} onChange={e => onChangeCity(e.target.value)}
          width="100%" height={48} />
      </OnboardingField>
    </div>
  </OnboardingSection>
);

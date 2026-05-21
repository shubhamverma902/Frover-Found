import { WEDDING_STYLES } from '@/constants/onboarding';
import { OnboardingSection } from './OnboardingSection';

interface Props {
  style: string;
  error?: string;
  onSelect: (value: string) => void;
}

export const StyleSection = ({ style, error, onSelect }: Props) => (
  <OnboardingSection n="05" label="Wedding Style">
    {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
    <div className="flex flex-wrap gap-2">
      {WEDDING_STYLES.map(s => (
        <button key={s.value} type="button" onClick={() => onSelect(s.value)}
          className={`px-4 py-2 border text-sm font-semibold transition-all duration-150 ${
            style === s.value
              ? 'border-[#23292E] bg-[#23292E] text-[#E4BC62]'
              : 'border-[#DDDED9] bg-white text-zinc-500 hover:border-[#23292E]/40'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  </OnboardingSection>
);

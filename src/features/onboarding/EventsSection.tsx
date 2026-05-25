import { EVENT_TYPES } from '@/constants/onboarding';
import { OnboardingSection } from './OnboardingSection';

interface Props {
  events: string[];
  error?: string;
  onToggle: (id: string) => void;
}

export const EventsSection = ({ events, error, onToggle }: Props) => (
  <OnboardingSection n="04" label="Events to Plan">
    {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {EVENT_TYPES.map(ev => {
        const checked = events.includes(ev.id);
        return (
          <button key={ev.id} type="button" onClick={() => onToggle(ev.id)}
            className={`flex items-center gap-3 border px-4 py-3 text-left transition-all duration-150 ${
              checked
                ? 'border-gold bg-dark text-gold'
                : 'border-silver bg-white text-zinc-600 hover:border-dark/30'
            }`}
          >
            <span className="text-xl">{ev.icon}</span>
            <span className="text-sm font-semibold">{ev.label}</span>
            {checked && <span className="ml-auto text-gold text-xs">✓</span>}
          </button>
        );
      })}
    </div>
  </OnboardingSection>
);

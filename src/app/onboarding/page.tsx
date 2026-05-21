'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form } from '@/components/elements';
import { PATH } from '@/constants/path';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  submitOnboarding,
  selectOnboardingStatus,
  selectOnboardingError,
  clearOnboardingError,
} from '@/store/slices/onboardingSlice';
import { selectIsAuthenticated, selectUser } from '@/store/slices/authSlice';
import type { WeddingProfile } from '@/types/onboarding';
import {
  SuccessScreen,
  OnboardingHero,
  ApiErrorBanner,
  CoupleSection,
  DateVenueSection,
  GuestsBudgetSection,
  EventsSection,
  StyleSection,
  SubmitButton,
} from '@/features/onboarding';

type FormData = Omit<WeddingProfile, 'guestCount' | 'budget'> & {
  guestCount: string;
  budget:     string;
};

const EMPTY: FormData = {
  partner1: '', partner2: '', weddingDate: '', city: '',
  guestCount: '', budget: '', style: '', events: [],
};

const OnboardingPage = () => {
  const router   = useRouter();
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user            = useAppSelector(selectUser);
  const status          = useAppSelector(selectOnboardingStatus);
  const apiError        = useAppSelector(selectOnboardingError);

  const [data,   setData]   = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    if (!isAuthenticated) { router.replace(PATH.auth.login); return; }
    if (user?.onboardingCompleted) router.replace(PATH.dashboard.base);
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (status === 'succeeded') setTimeout(() => router.push(PATH.dashboard.base), 1600);
  }, [status, router]);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const toggleEvent = (id: string) => {
    setData(prev => ({
      ...prev,
      events: prev.events.includes(id) ? prev.events.filter(e => e !== id) : [...prev.events, id],
    }));
    setErrors(prev => ({ ...prev, events: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!data.partner1.trim())    e.partner1    = 'Required';
    if (!data.partner2.trim())    e.partner2    = 'Required';
    if (!data.weddingDate)        e.weddingDate = 'Required';
    if (!data.city.trim())        e.city        = 'Required';
    if (!data.guestCount)         e.guestCount  = 'Required';
    if (!data.budget)             e.budget      = 'Required';
    if (!data.style)              e.style       = 'Select a style';
    if (data.events.length === 0) e.events      = 'Select at least one event';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!validate()) return;
    dispatch(clearOnboardingError());
    dispatch(submitOnboarding({
      partner1:    data.partner1,
      partner2:    data.partner2,
      weddingDate: data.weddingDate,
      city:        data.city,
      guestCount:  Number(data.guestCount),
      budget:      Number(data.budget),
      style:       data.style,
      events:      data.events,
    }));
  };

  if (status === 'succeeded') return <SuccessScreen />;

  return (
    <div className="min-h-screen bg-[#FDFDF8] flex flex-col items-center justify-start py-12 px-4">

      <OnboardingHero />

      <div className="w-full max-w-2xl">
        {apiError && <ApiErrorBanner error={apiError} onDismiss={() => dispatch(clearOnboardingError())} />}

        <Form onSubmit={handleSubmit}>
          <CoupleSection
            partner1={data.partner1}    partner2={data.partner2}
            error1={errors.partner1}    error2={errors.partner2}
            onChangePartner1={v => set('partner1', v)}
            onChangePartner2={v => set('partner2', v)}
          />
          <DateVenueSection
            weddingDate={data.weddingDate} city={data.city}
            errorDate={errors.weddingDate} errorCity={errors.city}
            onChangeDate={v => set('weddingDate', v)}
            onChangeCity={v => set('city', v)}
          />
          <GuestsBudgetSection
            guestCount={data.guestCount}   budget={data.budget}
            errorGuests={errors.guestCount} errorBudget={errors.budget}
            onChangeGuests={v => set('guestCount', v)}
            onChangeBudget={v => set('budget', v)}
          />
          <EventsSection events={data.events} error={errors.events} onToggle={toggleEvent} />
          <StyleSection  style={data.style}   error={errors.style}  onSelect={v => set('style', v)} />
          <SubmitButton loading={status === 'loading'} />
        </Form>

        <p className="text-center text-xs text-zinc-300 mt-6">
          You can update these details anytime from Settings.
        </p>
      </div>
    </div>
  );
};

export default OnboardingPage;

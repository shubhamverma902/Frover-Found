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
import { selectUser } from '@/store/slices/authSlice';
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

  const user = useAppSelector(selectUser);
  const status          = useAppSelector(selectOnboardingStatus);
  const apiError        = useAppSelector(selectOnboardingError);

  const [data,    setData]    = useState<FormData>(EMPTY);
  const [errors,  setErrors]  = useState<Partial<Record<keyof FormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});

  useEffect(() => {
    if (user?.onboardingCompleted) router.replace(PATH.dashboard.base);
  }, [user, router]);

  useEffect(() => {
    if (status === 'succeeded') setTimeout(() => router.push(PATH.dashboard.base), 1600);
  }, [status, router]);

  const validateField = (key: keyof FormData, value: FormData[keyof FormData]): string => {
    switch (key) {
      case 'partner1':    return !String(value).trim() ? 'Required' : '';
      case 'partner2':    return !String(value).trim() ? 'Required' : '';
      case 'weddingDate': return !value ? 'Required' : '';
      case 'city':        return !String(value).trim() ? 'Required' : '';
      case 'guestCount':  return !value || Number(value) <= 0 ? 'Required' : '';
      case 'budget':      return !value || Number(value) <= 0 ? 'Required' : '';
      case 'style':       return !value ? 'Select a style' : '';
      case 'events':      return (value as string[]).length === 0 ? 'Select at least one' : '';
      default:            return '';
    }
  };

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
    if (touched[key]) {
      const msg = validateField(key, value);
      setErrors(prev => ({ ...prev, [key]: msg || undefined }));
    }
  };

  const touch = <K extends keyof FormData>(key: K) => {
    setTouched(prev => ({ ...prev, [key]: true }));
    const msg = validateField(key, data[key]);
    if (msg) setErrors(prev => ({ ...prev, [key]: msg }));
  };

  const toggleEvent = (id: string) => {
    const next = data.events.includes(id)
      ? data.events.filter(e => e !== id)
      : [...data.events, id];
    setData(prev => ({ ...prev, events: next }));
    if (touched.events) {
      setErrors(prev => ({ ...prev, events: next.length === 0 ? 'Select at least one' : undefined }));
    }
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
    setTouched({ partner1: true, partner2: true, weddingDate: true, city: true, guestCount: true, budget: true, style: true, events: true });
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-start py-12 px-4">

      <OnboardingHero />

      <div className="w-full max-w-2xl">
        {apiError && <ApiErrorBanner error={apiError.message} onDismiss={() => dispatch(clearOnboardingError())} />}

        <Form onSubmit={handleSubmit}>
          <CoupleSection
            partner1={data.partner1}    partner2={data.partner2}
            error1={errors.partner1}    error2={errors.partner2}
            onChangePartner1={v => set('partner1', v)}
            onChangePartner2={v => set('partner2', v)}
            onBlurPartner1={() => touch('partner1')}
            onBlurPartner2={() => touch('partner2')}
          />
          <DateVenueSection
            weddingDate={data.weddingDate} city={data.city}
            errorDate={errors.weddingDate} errorCity={errors.city}
            onChangeDate={v => set('weddingDate', v)}
            onChangeCity={v => set('city', v)}
            onBlurDate={() => touch('weddingDate')}
            onBlurCity={() => touch('city')}
          />
          <GuestsBudgetSection
            guestCount={data.guestCount}   budget={data.budget}
            errorGuests={errors.guestCount} errorBudget={errors.budget}
            onChangeGuests={v => set('guestCount', v)}
            onChangeBudget={v => set('budget', v)}
            onBlurGuests={() => touch('guestCount')}
            onBlurBudget={() => touch('budget')}
          />
          <EventsSection events={data.events} error={errors.events} onToggle={toggleEvent} />
          <StyleSection  style={data.style}   error={errors.style}  onSelect={v => set('style', v)} />
          <SubmitButton loading={status === 'loading'} />
        </Form>

        <p className="text-center text-xs text-silver mt-6">
          You can update these details anytime from Settings.
        </p>
      </div>
    </div>
  );
};

export default OnboardingPage;

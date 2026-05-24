export const PATH = {
  home: '/',

  auth: {
    base:            '/auth',
    login:           '/auth/login',
    signup:          '/auth/signup',
    acceptInvite:    '/auth/accept-invite',
    forgotPassword:  '/auth/forgot-password',
    resetPassword:   '/auth/reset-password',
  },

  onboarding: '/onboarding',

  dashboard: {
    base:      '/dashboard',
    events:    '/dashboard/events',
    checklist: '/dashboard/checklist',
    budget:    '/dashboard/budget',
    guests:    '/dashboard/guests',
    vendors:   '/dashboard/vendors',
    seating:   '/dashboard/seating',
    insights:  '/dashboard/insights',
    settings:  '/dashboard/settings',
    help:      '/dashboard/help',
  },

  wedding: (slug: string) => `/wedding/${slug}`,

  // Landing page in-page anchor targets
  landing: {
    services:     '#services',
    gallery:      '#gallery',
    testimonials: '#testimonials',
    contact:      '#contact',
  },
};

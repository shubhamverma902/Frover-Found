// Centralised API endpoint paths — import API and use these instead of inline strings.
// Dynamic segments are expressed as small helper functions so call-sites stay readable.

export const API = {

  auth: {
    login:    '/auth/login',
    register: '/auth/register',
    me:       '/auth/me',
    refresh:  '/auth/refresh',
    logout:   '/auth/logout',
  },

  onboarding: '/onboarding',

  dashboard: '/dashboard',

  events: {
    base:        '/events',
    byId:        (id: string) => `/events/${id}`,
    status:      (id: string) => `/events/${id}/status`,
    attachments: (id: string) => `/events/${id}/attachments`,
    attachment:  (id: string, fileId: string) => `/events/${id}/attachments/${fileId}`,
  },

  checklist: {
    base:   '/checklist',
    tasks:  '/checklist/tasks',
    toggle: (taskId: string) => `/checklist/tasks/${taskId}/toggle`,
    task:   (taskId: string) => `/checklist/tasks/${taskId}`,
  },

  budget: {
    base:      '/budget',
    total:     '/budget/total',
    allocated: (catId: string) => `/budget/categories/${catId}/allocated`,
    expenses:  (catId: string) => `/budget/categories/${catId}/expenses`,
    expense:   (catId: string, expId: string) => `/budget/categories/${catId}/expenses/${expId}`,
  },

  guests: {
    base: '/guests',
    rsvp: (id: string) => `/guests/${id}/rsvp`,
    byId: (id: string) => `/guests/${id}`,
  },

  vendors: {
    base:        '/vendors',
    byId:        (id: string) => `/vendors/${id}`,
    status:      (id: string) => `/vendors/${id}/status`,
    attachments: (id: string) => `/vendors/${id}/attachments`,
    attachment:  (id: string, fileId: string) => `/vendors/${id}/attachments/${fileId}`,
  },

  seating: {
    base:   '/seating',
    byId:   (id: string) => `/seating/${id}`,
    assign: '/seating/assign',
  },

  settings: {
    base:          '/settings',
    profile:       '/settings/profile',
    wedding:       '/settings/wedding',
    notifications: '/settings/notifications',
    account:       '/settings/account',
    partner:       '/settings/partner',
    partnerInvite: '/settings/partner/invite',
    partnerAccept: '/settings/partner/accept',
  },

  notifications: {
    base:    '/notifications',
    readAll: '/notifications/read-all',
  },

  collaborators: {
    base:   '/collaborators',
    invite: '/collaborators/invite',
    accept: '/collaborators/accept',
    byId:   (id: string) => `/collaborators/${id}`,
  },

};

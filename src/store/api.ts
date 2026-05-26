import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQueryWithRetry } from "./axiosBaseQuery";
import type { AxiosBaseQueryError } from "./axiosBaseQuery";
import type { RootState } from "./store";
import { API } from "@/constants/api";
import type { Guest } from "@/types/guest";
import type { Vendor } from "@/types/vendor";
import type { WeddingEvent } from "@/types/event";
import type { SeatingTable } from "@/types/seating";
import type { BudgetCategory } from "@/types/budget";
import type { ChecklistCategory } from "@/types/checklist";
import { parseResponse } from "@/api/parse";
import {
  GuestsDataSchema,
  VendorsDataSchema,
  EventsDataSchema,
  BudgetDataSchema,
  ChecklistResponseSchema,
  SeatingTablesResponseSchema,
  SettingsDataSchema,
  NotificationsDataSchema,
  DashboardDataSchema,
  PartnerStatusDataSchema,
  CollaboratorsDataSchema,
  AnalyticsDataSchema,
  GuestSchema,
  VendorSchema,
  WeddingEventSchema,
} from "@/api/schemas";
import type { GuestsData } from "@/api/guests.api";
import type { CreateGuestPayload, UpdateGuestPayload } from "@/api/guests.api";
import type { VendorsData } from "@/api/vendors.api";
import type { VendorPayload } from "@/api/vendors.api";
import type { EventsData } from "@/api/events.api";
import type { BudgetData } from "@/api/budget.api";
import type { SettingsData, PartnerStatusData, InviteResult } from "@/api/settings.api";
import { startToggle, finishToggle } from "./slices/checklistSlice";

export interface CollaboratorEntry {
  _id:      string;
  email:    string;
  name:     string;
  role:     'planner' | 'viewer';
  accepted: boolean;
  linkedAt: string | null;
}

export interface CollaboratorInviteResult {
  inviteUrl:  string;
  email:      string;
  role:       'planner' | 'viewer';
  expiresAt:  string;
}
import type { NotificationsData } from "@/api/notifications.api";
import type { DashboardData } from "@/api/dashboard.api";
import type { AnalyticsData } from "@/api/analytics.api";

// ── Combined type for the seating query (tables + full guest list) ───────────
export interface SeatingData {
  tables: SeatingTable[];
  guests: Guest[];
}


export const api = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQueryWithRetry,
  refetchOnReconnect: true,
  tagTypes: [
    "Guest",
    "Vendor",
    "Event",
    "Seating",
    "Budget",
    "Checklist",
    "Settings",
    "Notifications",
    "Dashboard",
    "Analytics",
    "Partner",
    "Collaborator",
  ],

  endpoints: (build) => ({
    // ── Guests ───────────────────────────────────────────────────────────────
    getGuests: build.query<GuestsData, { page: number; limit: number; query?: string }>({
      query: ({ page, limit, query }) => ({
        url: API.guests.base,
        params: { page, limit, ...(query ? { q: query } : {}) },
      }),
      transformResponse: (raw) => parseResponse(GuestsDataSchema, raw, 'getGuests'),
      providesTags: [{ type: "Guest", id: "LIST" }],
    }),

    createGuest: build.mutation<Guest, CreateGuestPayload>({
      query: (body) => ({ url: API.guests.base, method: 'POST', data: body }),
      transformResponse: (raw) => parseResponse(GuestSchema, (raw as { guest: unknown }).guest, 'createGuest'),
      invalidatesTags: [{ type: 'Guest', id: 'LIST' }, 'Dashboard', 'Analytics'],
    }),

    updateGuest: build.mutation<void, { guestId: string; payload: UpdateGuestPayload }>({
      query: ({ guestId, payload }) => ({ url: API.guests.byId(guestId), method: 'PUT', data: payload }),
      onQueryStarted: async ({ guestId, payload }, { dispatch, getState, queryFulfilled }) => {
        const patches = api.util.selectInvalidatedBy(getState() as RootState, [{ type: 'Guest', id: 'LIST' }])
          .filter(e => e.endpointName === 'getGuests')
          .map(({ originalArgs }) => dispatch(api.util.updateQueryData('getGuests', originalArgs as { page: number; limit: number; query?: string }, draft => {
            const g = draft.guests.find(g => g._id === guestId);
            if (g) {
              const prev = g.rsvp;
              Object.assign(g, payload);
              if (prev !== payload.rsvp) {
                if (prev         === 'confirmed') draft.confirmed = Math.max(0, draft.confirmed - 1);
                if (prev         === 'pending')   draft.pending   = Math.max(0, draft.pending   - 1);
                if (prev         === 'declined')  draft.declined  = Math.max(0, draft.declined  - 1);
                if (payload.rsvp === 'confirmed') draft.confirmed += 1;
                if (payload.rsvp === 'pending')   draft.pending   += 1;
                if (payload.rsvp === 'declined')  draft.declined  += 1;
              }
            }
          })));
        try { await queryFulfilled; }
        catch { patches.forEach(p => p.undo()); }
      },
      invalidatesTags: [{ type: 'Guest', id: 'LIST' }, 'Dashboard', 'Analytics'],
    }),

    patchGuestRsvp: build.mutation<void, { guestId: string; rsvp: Guest['rsvp'] }>({
      query: ({ guestId, rsvp }) => ({ url: API.guests.rsvp(guestId), method: 'PATCH', data: { rsvp } }),
      onQueryStarted: async ({ guestId, rsvp }, { dispatch, getState, queryFulfilled }) => {
        const patches = api.util.selectInvalidatedBy(getState() as RootState, [{ type: 'Guest', id: 'LIST' }])
          .filter(e => e.endpointName === 'getGuests')
          .map(({ originalArgs }) => dispatch(api.util.updateQueryData('getGuests', originalArgs as { page: number; limit: number; query?: string }, draft => {
            const g = draft.guests.find(g => g._id === guestId);
            if (g) g.rsvp = rsvp;
          })));
        try { await queryFulfilled; }
        catch { patches.forEach(p => p.undo()); }
      },
      invalidatesTags: [{ type: 'Guest', id: 'LIST' }, 'Dashboard', 'Analytics'],
    }),

    deleteGuest: build.mutation<void, string>({
      query: (guestId) => ({ url: API.guests.byId(guestId), method: 'DELETE' }),
      onQueryStarted: async (guestId, { dispatch, getState, queryFulfilled }) => {
        const patches = api.util.selectInvalidatedBy(getState() as RootState, [{ type: 'Guest', id: 'LIST' }])
          .filter(e => e.endpointName === 'getGuests')
          .map(({ originalArgs }) => dispatch(api.util.updateQueryData('getGuests', originalArgs as { page: number; limit: number; query?: string }, draft => {
            const idx = draft.guests.findIndex(g => g._id === guestId);
            if (idx !== -1) {
              const [removed] = draft.guests.splice(idx, 1);
              draft.total      = Math.max(0, draft.total - 1);
              draft.grandTotal = Math.max(0, draft.grandTotal - 1);
              if      (removed.rsvp === 'confirmed') draft.confirmed = Math.max(0, draft.confirmed - 1);
              else if (removed.rsvp === 'pending')   draft.pending   = Math.max(0, draft.pending   - 1);
              else if (removed.rsvp === 'declined')  draft.declined  = Math.max(0, draft.declined  - 1);
            }
          })));
        try { await queryFulfilled; }
        catch { patches.forEach(p => p.undo()); }
      },
      invalidatesTags: [{ type: 'Guest', id: 'LIST' }, 'Dashboard', 'Analytics'],
    }),

    // ── Vendors ──────────────────────────────────────────────────────────────
    getVendors: build.query<VendorsData, { page: number; limit: number; query?: string }>({
      query: ({ page, limit, query }) => ({
        url: API.vendors.base,
        params: { page, limit, ...(query ? { q: query } : {}) },
      }),
      transformResponse: (raw) => parseResponse(VendorsDataSchema, raw, 'getVendors'),
      providesTags: [{ type: "Vendor", id: "LIST" }],
    }),

    createVendor: build.mutation<Vendor, VendorPayload>({
      query: (body) => ({ url: API.vendors.base, method: 'POST', data: body }),
      transformResponse: (raw) => parseResponse(VendorSchema, (raw as { vendor: unknown }).vendor, 'createVendor'),
      invalidatesTags: [{ type: 'Vendor', id: 'LIST' }, 'Dashboard', 'Analytics'],
    }),

    updateVendor: build.mutation<void, { vendorId: string; payload: VendorPayload }>({
      query: ({ vendorId, payload }) => ({ url: API.vendors.byId(vendorId), method: 'PUT', data: payload }),
      onQueryStarted: async ({ vendorId, payload }, { dispatch, getState, queryFulfilled }) => {
        const patches = api.util.selectInvalidatedBy(getState() as RootState, [{ type: 'Vendor', id: 'LIST' }])
          .filter(e => e.endpointName === 'getVendors')
          .map(({ originalArgs }) => dispatch(api.util.updateQueryData('getVendors', originalArgs as { page: number; limit: number; query?: string }, draft => {
            const v = draft.vendors.find(v => v._id === vendorId);
            if (v) Object.assign(v, payload);
          })));
        try { await queryFulfilled; }
        catch { patches.forEach(p => p.undo()); }
      },
      invalidatesTags: [{ type: 'Vendor', id: 'LIST' }, 'Dashboard', 'Analytics'],
    }),

    patchVendorStatus: build.mutation<void, { vendorId: string; status: Vendor['status'] }>({
      query: ({ vendorId, status }) => ({ url: API.vendors.status(vendorId), method: 'PATCH', data: { status } }),
      onQueryStarted: async ({ vendorId, status }, { dispatch, getState, queryFulfilled }) => {
        const patches = api.util.selectInvalidatedBy(getState() as RootState, [{ type: 'Vendor', id: 'LIST' }])
          .filter(e => e.endpointName === 'getVendors')
          .map(({ originalArgs }) => dispatch(api.util.updateQueryData('getVendors', originalArgs as { page: number; limit: number; query?: string }, draft => {
            const v = draft.vendors.find(v => v._id === vendorId);
            if (v) {
              const prev = v.status;
              v.status = status;
              if (prev   === 'booked')      draft.booked      = Math.max(0, draft.booked      - 1);
              if (prev   === 'shortlisted') draft.shortlisted = Math.max(0, draft.shortlisted - 1);
              if (status === 'booked')      draft.booked      += 1;
              if (status === 'shortlisted') draft.shortlisted += 1;
            }
          })));
        try { await queryFulfilled; }
        catch { patches.forEach(p => p.undo()); }
      },
      invalidatesTags: [{ type: 'Vendor', id: 'LIST' }, 'Dashboard', 'Analytics'],
    }),

    deleteVendor: build.mutation<void, string>({
      query: (vendorId) => ({ url: API.vendors.byId(vendorId), method: 'DELETE' }),
      onQueryStarted: async (vendorId, { dispatch, getState, queryFulfilled }) => {
        const patches = api.util.selectInvalidatedBy(getState() as RootState, [{ type: 'Vendor', id: 'LIST' }])
          .filter(e => e.endpointName === 'getVendors')
          .map(({ originalArgs }) => dispatch(api.util.updateQueryData('getVendors', originalArgs as { page: number; limit: number; query?: string }, draft => {
            const idx = draft.vendors.findIndex(v => v._id === vendorId);
            if (idx !== -1) {
              const [removed] = draft.vendors.splice(idx, 1);
              draft.total      = Math.max(0, draft.total - 1);
              draft.grandTotal = Math.max(0, draft.grandTotal - 1);
              if      (removed.status === 'booked')      draft.booked      = Math.max(0, draft.booked      - 1);
              else if (removed.status === 'shortlisted') draft.shortlisted = Math.max(0, draft.shortlisted - 1);
            }
          })));
        try { await queryFulfilled; }
        catch { patches.forEach(p => p.undo()); }
      },
      invalidatesTags: [{ type: 'Vendor', id: 'LIST' }, 'Dashboard', 'Analytics'],
    }),

    addVendorAttachment: build.mutation<Vendor, { vendorId: string; file: File }>({
      query: ({ vendorId, file }) => {
        const form = new FormData();
        form.append('file', file);
        return { url: API.vendors.attachments(vendorId), method: 'POST', data: form };
      },
      transformResponse: (raw) => parseResponse(VendorSchema, (raw as Record<string, unknown>).vendor, 'addVendorAttachment'),
      invalidatesTags: [{ type: 'Vendor', id: 'LIST' }],
    }),

    removeVendorAttachment: build.mutation<Vendor, { vendorId: string; fileId: string }>({
      query: ({ vendorId, fileId }) => ({ url: API.vendors.attachment(vendorId, fileId), method: 'DELETE' }),
      transformResponse: (raw) => parseResponse(VendorSchema, (raw as Record<string, unknown>).vendor, 'removeVendorAttachment'),
      invalidatesTags: [{ type: 'Vendor', id: 'LIST' }],
    }),

    // ── Events ───────────────────────────────────────────────────────────────
    getEvents: build.query<EventsData, { page: number; limit: number; query?: string; status?: string }>({
      query: ({ page, limit, query, status }) => ({
        url: API.events.base,
        params: { page, limit, ...(query ? { q: query } : {}), ...(status ? { status } : {}) },
      }),
      transformResponse: (raw) => parseResponse(EventsDataSchema, raw, 'getEvents'),
      providesTags: [{ type: "Event", id: "LIST" }],
    }),

    createEvent: build.mutation<void, Omit<WeddingEvent, '_id'>>({
      query: (body) => ({ url: API.events.base, method: 'POST', data: body }),
      invalidatesTags: [{ type: 'Event', id: 'LIST' }, 'Dashboard', 'Analytics'],
    }),

    updateEvent: build.mutation<void, { id: string; payload: Omit<WeddingEvent, '_id'> }>({
      query: ({ id, payload }) => ({ url: API.events.byId(id), method: 'PUT', data: payload }),
      onQueryStarted: async ({ id, payload }, { dispatch, getState, queryFulfilled }) => {
        const patches = api.util.selectInvalidatedBy(getState() as RootState, [{ type: 'Event', id: 'LIST' }])
          .filter(e => e.endpointName === 'getEvents')
          .map(({ originalArgs }) => dispatch(api.util.updateQueryData('getEvents', originalArgs as { page: number; limit: number; query?: string; status?: string }, draft => {
            const ev = draft.events.find(e => e._id === id);
            if (ev) Object.assign(ev, payload);
          })));
        try { await queryFulfilled; }
        catch { patches.forEach(p => p.undo()); }
      },
      invalidatesTags: [{ type: 'Event', id: 'LIST' }, 'Dashboard', 'Analytics'],
    }),

    patchEventStatus: build.mutation<void, { id: string; status: WeddingEvent['status'] }>({
      query: ({ id, status }) => ({ url: API.events.status(id), method: 'PATCH', data: { status } }),
      onQueryStarted: async ({ id, status }, { dispatch, getState, queryFulfilled }) => {
        const patches = api.util.selectInvalidatedBy(getState() as RootState, [{ type: 'Event', id: 'LIST' }])
          .filter(e => e.endpointName === 'getEvents')
          .map(({ originalArgs }) => dispatch(api.util.updateQueryData('getEvents', originalArgs as { page: number; limit: number; query?: string; status?: string }, draft => {
            const ev = draft.events.find(e => e._id === id);
            if (ev) ev.status = status;
          })));
        try { await queryFulfilled; }
        catch { patches.forEach(p => p.undo()); }
      },
      invalidatesTags: [{ type: 'Event', id: 'LIST' }, 'Dashboard', 'Analytics'],
    }),

    deleteEvent: build.mutation<void, string>({
      query: (id) => ({ url: API.events.byId(id), method: 'DELETE' }),
      onQueryStarted: async (id, { dispatch, getState, queryFulfilled }) => {
        const patches = api.util.selectInvalidatedBy(getState() as RootState, [{ type: 'Event', id: 'LIST' }])
          .filter(e => e.endpointName === 'getEvents')
          .map(({ originalArgs }) => dispatch(api.util.updateQueryData('getEvents', originalArgs as { page: number; limit: number; query?: string; status?: string }, draft => {
            const idx = draft.events.findIndex(e => e._id === id);
            if (idx !== -1) draft.events.splice(idx, 1);
          })));
        try { await queryFulfilled; }
        catch { patches.forEach(p => p.undo()); }
      },
      invalidatesTags: [{ type: 'Event', id: 'LIST' }, 'Dashboard', 'Analytics'],
    }),

    addEventAttachment: build.mutation<WeddingEvent, { eventId: string; file: File }>({
      query: ({ eventId, file }) => {
        const form = new FormData();
        form.append('file', file);
        return { url: API.events.attachments(eventId), method: 'POST', data: form };
      },
      transformResponse: (raw) => parseResponse(WeddingEventSchema, (raw as Record<string, unknown>).event, 'addEventAttachment'),
      invalidatesTags: [{ type: 'Event', id: 'LIST' }],
    }),

    removeEventAttachment: build.mutation<WeddingEvent, { eventId: string; fileId: string }>({
      query: ({ eventId, fileId }) => ({ url: API.events.attachment(eventId, fileId), method: 'DELETE' }),
      transformResponse: (raw) => parseResponse(WeddingEventSchema, (raw as Record<string, unknown>).event, 'removeEventAttachment'),
      invalidatesTags: [{ type: 'Event', id: 'LIST' }],
    }),

    // ── Seating (combined tables + all guests) ────────────────────────────────
    getSeating: build.query<SeatingData, void>({
      queryFn: async (_, _api, _extra, baseQuery) => {
        // Fetch tables and first guest page concurrently.
        // PAGE_SIZE stays under the backend's 1000-record hard cap.
        const PAGE_SIZE = 500;
        const [tablesRes, firstRes] = await Promise.all([
          baseQuery({ url: API.seating.base }),
          baseQuery({ url: API.guests.base, params: { page: 1, limit: PAGE_SIZE } }),
        ]);
        if (tablesRes.error) return { error: tablesRes.error as AxiosBaseQueryError };
        if (firstRes.error)  return { error: firstRes.error  as AxiosBaseQueryError };

        const tables       = parseResponse(SeatingTablesResponseSchema, tablesRes.data, 'getSeating/tables').tables;
        const firstPayload = parseResponse(GuestsDataSchema, firstRes.data, 'getSeating/guests[1]');
        let   allGuests    = firstPayload.guests;
        const total        = firstPayload.grandTotal;

        // If grandTotal exceeds one page, fetch remaining pages in parallel.
        if (total > PAGE_SIZE) {
          const extraPages = Array.from(
            { length: Math.ceil(total / PAGE_SIZE) - 1 },
            (_, i) => i + 2,
          );
          const restRes = await Promise.all(
            extraPages.map(p => baseQuery({ url: API.guests.base, params: { page: p, limit: PAGE_SIZE } }))
          );
          for (let i = 0; i < restRes.length; i++) {
            if (restRes[i].error) return { error: restRes[i].error as AxiosBaseQueryError };
            const payload = parseResponse(GuestsDataSchema, restRes[i].data, `getSeating/guests[${i + 2}]`);
            allGuests = allGuests.concat(payload.guests);
          }
        }

        return { data: { tables, guests: allGuests } };
      },
      providesTags: ["Seating"],
    }),

    createTable: build.mutation<void, { name: string; capacity: number; shape: SeatingTable['shape'] }>({
      query: (body) => ({ url: API.seating.base, method: 'POST', data: body }),
      invalidatesTags: ['Seating'],
    }),

    updateTable: build.mutation<void, { id: string; name: string; capacity: number; shape: SeatingTable['shape'] }>({
      query: ({ id, ...body }) => ({ url: API.seating.byId(id), method: 'PUT', data: body }),
      invalidatesTags: ['Seating'],
    }),

    deleteTable: build.mutation<void, string>({
      query: (id) => ({ url: API.seating.byId(id), method: 'DELETE' }),
      onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
        const patch = dispatch(api.util.updateQueryData('getSeating', undefined, draft => {
          const idx = draft.tables.findIndex(t => t._id === id);
          if (idx !== -1) draft.tables.splice(idx, 1);
        }));
        try { await queryFulfilled; }
        catch { patch.undo(); }
      },
      invalidatesTags: ['Seating'],
    }),

    assignGuest: build.mutation<void, { guestId: string; tableId: string | null }>({
      query: (body) => ({ url: API.seating.assign, method: 'PATCH', data: body }),
      onQueryStarted: async ({ guestId, tableId }, { dispatch, queryFulfilled }) => {
        const patch = dispatch(api.util.updateQueryData('getSeating', undefined, draft => {
          for (const table of draft.tables) {
            const i = table.guestIds.indexOf(guestId);
            if (i !== -1) table.guestIds.splice(i, 1);
          }
          if (tableId) {
            const target = draft.tables.find(t => t._id === tableId);
            if (target && !target.guestIds.includes(guestId)) target.guestIds.push(guestId);
          }
        }));
        try { await queryFulfilled; }
        catch { patch.undo(); }
      },
      invalidatesTags: ['Seating'],
    }),

    // ── Budget ───────────────────────────────────────────────────────────────
    getBudget: build.query<BudgetData, void>({
      query: () => ({ url: API.budget.base }),
      transformResponse: (raw) => parseResponse(BudgetDataSchema, raw, 'getBudget'),
      providesTags: ["Budget"],
    }),

    updateBudgetTotal: build.mutation<void, number>({
      query: (total) => ({ url: API.budget.total, method: 'PATCH', data: { total } }),
      onQueryStarted: async (total, { dispatch, queryFulfilled }) => {
        const patch = dispatch(api.util.updateQueryData('getBudget', undefined, draft => {
          draft.total = total;
        }));
        try { await queryFulfilled; }
        catch { patch.undo(); }
      },
      invalidatesTags: ['Budget', 'Dashboard', 'Analytics'],
    }),

    updateAllocated: build.mutation<void, { categoryId: string; allocated: number }>({
      query: ({ categoryId, allocated }) => ({ url: API.budget.allocated(categoryId), method: 'PATCH', data: { allocated } }),
      onQueryStarted: async ({ categoryId, allocated }, { dispatch, queryFulfilled }) => {
        const patch = dispatch(api.util.updateQueryData('getBudget', undefined, draft => {
          const cat = draft.categories.find(c => c._id === categoryId);
          if (cat) cat.allocated = allocated;
        }));
        try { await queryFulfilled; }
        catch { patch.undo(); }
      },
      invalidatesTags: ['Budget', 'Dashboard', 'Analytics'],
    }),

    addExpense: build.mutation<void, { categoryId: string; amount: number; note: string }>({
      query: ({ categoryId, amount, note }) => ({ url: API.budget.expenses(categoryId), method: 'POST', data: { amount, note } }),
      invalidatesTags: ['Budget', 'Dashboard', 'Analytics'],
    }),

    deleteExpense: build.mutation<void, { categoryId: string; expenseId: string }>({
      query: ({ categoryId, expenseId }) => ({ url: API.budget.expense(categoryId, expenseId), method: 'DELETE' }),
      onQueryStarted: async ({ categoryId, expenseId }, { dispatch, queryFulfilled }) => {
        const patch = dispatch(api.util.updateQueryData('getBudget', undefined, draft => {
          const cat = draft.categories.find(c => c._id === categoryId);
          if (cat) {
            const idx = cat.expenses.findIndex(e => e._id === expenseId);
            if (idx !== -1) cat.expenses.splice(idx, 1);
          }
        }));
        try { await queryFulfilled; }
        catch { patch.undo(); }
      },
      invalidatesTags: ['Budget', 'Dashboard', 'Analytics'],
    }),

    // ── Checklist ────────────────────────────────────────────────────────────
    getChecklist: build.query<ChecklistCategory[], void>({
      query: () => ({ url: API.checklist.base }),
      transformResponse: (raw) => parseResponse(ChecklistResponseSchema, raw, 'getChecklist').categories,
      providesTags: ["Checklist"],
    }),

    createTask: build.mutation<void, { category: string; label: string; due: string | null }>({
      query: (body) => ({ url: API.checklist.tasks, method: 'POST', data: body }),
      invalidatesTags: ['Checklist', 'Dashboard', 'Analytics'],
    }),

    toggleTask: build.mutation<void, string>({
      query: (taskId) => ({ url: API.checklist.toggle(taskId), method: 'PATCH' }),
      onQueryStarted: async (taskId, { dispatch, queryFulfilled }) => {
        dispatch(startToggle(taskId));
        const patch = dispatch(api.util.updateQueryData('getChecklist', undefined, draft => {
          for (const cat of draft) {
            const task = cat.tasks.find(t => t._id === taskId);
            if (task) { task.done = !task.done; break; }
          }
        }));
        try { await queryFulfilled; }
        catch { patch.undo(); }
        finally { dispatch(finishToggle(taskId)); }
      },
      invalidatesTags: ['Checklist', 'Dashboard', 'Analytics'],
    }),

    updateTask: build.mutation<void, { taskId: string; label: string; due: string | null; category: string; originalCategory: string }>({
      query: ({ taskId, label, due, category, originalCategory }) => ({
        url: API.checklist.task(taskId),
        method: 'PUT',
        data: { label, due, category, originalCategory },
      }),
      invalidatesTags: ['Checklist', 'Dashboard', 'Analytics'],
    }),

    deleteTask: build.mutation<void, string>({
      query: (taskId) => ({ url: API.checklist.task(taskId), method: 'DELETE' }),
      invalidatesTags: ['Checklist', 'Dashboard', 'Analytics'],
    }),

    // ── Settings ─────────────────────────────────────────────────────────────
    getSettings: build.query<SettingsData, void>({
      query: () => ({ url: API.settings.base }),
      transformResponse: (raw) => parseResponse(SettingsDataSchema, raw, 'getSettings'),
      providesTags: ["Settings"],
    }),

    // ── Notifications ────────────────────────────────────────────────────────
    getNotifications: build.query<NotificationsData, void>({
      query: () => ({ url: API.notifications.base }),
      transformResponse: (raw) => parseResponse(NotificationsDataSchema, raw, 'getNotifications'),
      providesTags: ["Notifications"],
    }),

    // ── Dashboard ────────────────────────────────────────────────────────────
    getDashboard: build.query<DashboardData, void>({
      query: () => ({ url: API.dashboard }),
      transformResponse: (raw) => parseResponse(DashboardDataSchema, raw, 'getDashboard'),
      providesTags: ["Dashboard"],
    }),

    // ── Partner ──────────────────────────────────────────────────────────────
    getPartner: build.query<PartnerStatusData, void>({
      query: () => ({ url: API.settings.partner }),
      transformResponse: (raw) => parseResponse(PartnerStatusDataSchema, raw, 'getPartner'),
      providesTags: ["Partner"],
    }),

    invitePartner: build.mutation<InviteResult, { email: string }>({
      query: (body) => ({ url: API.settings.partnerInvite, method: "POST", data: body }),
      invalidatesTags: ["Partner"],
    }),

    acceptInvite: build.mutation<{ token: string }, { token: string }>({
      query: (body) => ({ url: API.settings.partnerAccept, method: "POST", data: body }),
      invalidatesTags: ["Partner", "Guest", "Vendor", "Event", "Seating", "Budget", "Checklist", "Dashboard", "Analytics"],
    }),

    removePartner: build.mutation<{ token: string }, void>({
      query: () => ({ url: API.settings.partner, method: "DELETE" }),
      invalidatesTags: ["Partner", "Guest", "Vendor", "Event", "Seating", "Budget", "Checklist", "Dashboard", "Analytics"],
    }),

    // ── Collaborators ─────────────────────────────────────────────────────────
    getCollaborators: build.query<{ collaborators: CollaboratorEntry[] }, void>({
      query: () => ({ url: API.collaborators.base }),
      transformResponse: (raw) => parseResponse(CollaboratorsDataSchema, raw, 'getCollaborators'),
      providesTags: ["Collaborator"],
    }),

    inviteCollaborator: build.mutation<CollaboratorInviteResult, { email: string; role: 'planner' | 'viewer' }>({
      query: (body) => ({ url: API.collaborators.invite, method: "POST", data: body }),
      invalidatesTags: ["Collaborator"],
    }),

    acceptCollaboratorInvite: build.mutation<{ token: string; role: 'planner' | 'viewer' }, { token: string }>({
      query: (body) => ({ url: API.collaborators.accept, method: "POST", data: body }),
      invalidatesTags: ["Collaborator", "Guest", "Vendor", "Event", "Seating", "Budget", "Checklist", "Dashboard", "Analytics"],
    }),

    removeCollaborator: build.mutation<{ collaborators: CollaboratorEntry[] }, string>({
      query: (id) => ({ url: API.collaborators.byId(id), method: "DELETE" }),
      invalidatesTags: ["Collaborator"],
    }),

    leaveCollaboration: build.mutation<void, void>({
      query: () => ({ url: API.collaborators.leave, method: "DELETE" }),
      invalidatesTags: ["Collaborator", "Dashboard"],
    }),

    // ── Analytics / Insights ─────────────────────────────────────────────────
    getAnalytics: build.query<AnalyticsData, void>({
      query: () => ({ url: API.analytics }),
      transformResponse: (raw) => parseResponse(AnalyticsDataSchema, raw, 'getAnalytics'),
      providesTags: ["Analytics"],
    }),

    // ── Public wedding page ───────────────────────────────────────────────────
    generatePublicSlug: build.mutation<{ slug: string }, void>({
      query: () => ({ url: API.public.generateSlug, method: "POST" }),
    }),

    // ── Guest CSV import ──────────────────────────────────────────────────────
    importGuests: build.mutation<{ imported: number; skipped: number; errors: string[] }, FormData>({
      query: (formData) => ({ url: API.guests.import, method: "POST", data: formData }),
      invalidatesTags: [{ type: "Guest", id: "LIST" }, "Dashboard"],
    }),
  }),
});

// Auto-generated hooks
export const {
  useGetGuestsQuery,
  useCreateGuestMutation,
  useUpdateGuestMutation,
  usePatchGuestRsvpMutation,
  useDeleteGuestMutation,
  useGetVendorsQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  usePatchVendorStatusMutation,
  useDeleteVendorMutation,
  useAddVendorAttachmentMutation,
  useRemoveVendorAttachmentMutation,
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  usePatchEventStatusMutation,
  useDeleteEventMutation,
  useAddEventAttachmentMutation,
  useRemoveEventAttachmentMutation,
  useGetSeatingQuery,
  useCreateTableMutation,
  useUpdateTableMutation,
  useDeleteTableMutation,
  useAssignGuestMutation,
  useGetBudgetQuery,
  useUpdateBudgetTotalMutation,
  useUpdateAllocatedMutation,
  useAddExpenseMutation,
  useDeleteExpenseMutation,
  useGetChecklistQuery,
  useCreateTaskMutation,
  useToggleTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetSettingsQuery,
  useGetNotificationsQuery,
  useGetDashboardQuery,
  useGetPartnerQuery,
  useInvitePartnerMutation,
  useAcceptInviteMutation,
  useRemovePartnerMutation,
  useGetCollaboratorsQuery,
  useInviteCollaboratorMutation,
  useAcceptCollaboratorInviteMutation,
  useRemoveCollaboratorMutation,
  useLeaveCollaborationMutation,
  useGetAnalyticsQuery,
  useGeneratePublicSlugMutation,
  useImportGuestsMutation,
} = api;

import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import type { AxiosBaseQueryError } from "./axiosBaseQuery";
import { API } from "@/constants/api";
import type {
  Guest,
  WeddingEvent,
  SeatingTable,
  BudgetCategory,
  ChecklistCategory,
} from "@/constants/dashboard-pages";
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
} from "@/api/schemas";
import type { GuestsData } from "@/api/guests.api";
import type { VendorsData } from "@/api/vendors.api";
import type { EventsData } from "@/api/events.api";
import type { BudgetData } from "@/api/budget.api";
import type { SettingsData, PartnerStatusData, InviteResult } from "@/api/settings.api";

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
  baseQuery: axiosBaseQuery,
  refetchOnFocus: true,
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

    // ── Vendors ──────────────────────────────────────────────────────────────
    getVendors: build.query<VendorsData, { page: number; limit: number; query?: string }>({
      query: ({ page, limit, query }) => ({
        url: API.vendors.base,
        params: { page, limit, ...(query ? { q: query } : {}) },
      }),
      transformResponse: (raw) => parseResponse(VendorsDataSchema, raw, 'getVendors'),
      providesTags: [{ type: "Vendor", id: "LIST" }],
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

    // ── Budget ───────────────────────────────────────────────────────────────
    getBudget: build.query<BudgetData, void>({
      query: () => ({ url: API.budget.base }),
      transformResponse: (raw) => parseResponse(BudgetDataSchema, raw, 'getBudget'),
      providesTags: ["Budget"],
    }),

    // ── Checklist ────────────────────────────────────────────────────────────
    getChecklist: build.query<ChecklistCategory[], void>({
      query: () => ({ url: API.checklist.base }),
      transformResponse: (raw) => parseResponse(ChecklistResponseSchema, raw, 'getChecklist').categories,
      providesTags: ["Checklist"],
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
      providesTags: [
        "Dashboard",
        "Checklist",
        "Budget",
        { type: "Guest",  id: "LIST" },
        { type: "Vendor", id: "LIST" },
        { type: "Event",  id: "LIST" },
      ],
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
      invalidatesTags: ["Partner", "Guest", "Vendor", "Event", "Seating", "Budget", "Checklist", "Dashboard"],
    }),

    removePartner: build.mutation<{ token: string }, void>({
      query: () => ({ url: API.settings.partner, method: "DELETE" }),
      invalidatesTags: ["Partner", "Guest", "Vendor", "Event", "Seating", "Budget", "Checklist", "Dashboard"],
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
      invalidatesTags: ["Collaborator", "Guest", "Vendor", "Event", "Seating", "Budget", "Checklist", "Dashboard"],
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
      providesTags: [
        "Dashboard",
        "Checklist",
        "Budget",
        { type: "Guest",  id: "LIST" },
        { type: "Vendor", id: "LIST" },
        { type: "Event",  id: "LIST" },
      ],
    }),

    // ── Public wedding page ───────────────────────────────────────────────────
    generatePublicSlug: build.mutation<{ slug: string }, void>({
      query: () => ({ url: API.public.generateSlug, method: "POST" }),
    }),

    // ── Guest CSV import ──────────────────────────────────────────────────────
    importGuests: build.mutation<{ imported: number; skipped: number; errors: string[] }, FormData>({
      query: (formData) => ({ url: API.guests.import, method: "POST", data: formData }),
      invalidatesTags: [{ type: "Guest", id: "LIST" }],
    }),
  }),
});

// Auto-generated hooks
export const {
  useGetGuestsQuery,
  useGetVendorsQuery,
  useGetEventsQuery,
  useGetSeatingQuery,
  useGetBudgetQuery,
  useGetChecklistQuery,
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

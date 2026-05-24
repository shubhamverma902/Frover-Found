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
    getGuests: build.query<GuestsData, { page: number; limit: number }>({
      query: ({ page, limit }) => ({
        url: API.guests.base,
        params: { page, limit },
      }),
      providesTags: [{ type: "Guest", id: "LIST" }],
    }),

    // ── Vendors ──────────────────────────────────────────────────────────────
    getVendors: build.query<VendorsData, { page: number; limit: number }>({
      query: ({ page, limit }) => ({
        url: API.vendors.base,
        params: { page, limit },
      }),
      providesTags: [{ type: "Vendor", id: "LIST" }],
    }),

    // ── Events ───────────────────────────────────────────────────────────────
    getEvents: build.query<EventsData, { page: number; limit: number }>({
      query: ({ page, limit }) => ({
        url: API.events.base,
        params: { page, limit },
      }),
      providesTags: [{ type: "Event", id: "LIST" }],
    }),

    // ── Seating (combined tables + all guests) ────────────────────────────────
    getSeating: build.query<SeatingData, void>({
      queryFn: async (_, _api, _extra, baseQuery) => {
        const [tablesRes, guestsRes] = await Promise.all([
          baseQuery({ url: API.seating.base }),
          baseQuery({ url: API.guests.base, params: { page: 1, limit: 9999 } }),
        ]);
        if (tablesRes.error)
          return { error: tablesRes.error as AxiosBaseQueryError };
        if (guestsRes.error)
          return { error: guestsRes.error as AxiosBaseQueryError };
        return {
          data: {
            tables: (tablesRes.data as { tables: SeatingTable[] }).tables,
            guests: (guestsRes.data as { guests: Guest[] }).guests,
          },
        };
      },
      providesTags: ["Seating"],
    }),

    // ── Budget ───────────────────────────────────────────────────────────────
    getBudget: build.query<BudgetData, void>({
      query: () => ({ url: API.budget.base }),
      providesTags: ["Budget"],
    }),

    // ── Checklist ────────────────────────────────────────────────────────────
    getChecklist: build.query<ChecklistCategory[], void>({
      query: () => ({ url: API.checklist.base }),
      transformResponse: (raw: { categories: ChecklistCategory[] }) =>
        raw.categories,
      providesTags: ["Checklist"],
    }),

    // ── Settings ─────────────────────────────────────────────────────────────
    getSettings: build.query<SettingsData, void>({
      query: () => ({ url: API.settings.base }),
      providesTags: ["Settings"],
    }),

    // ── Notifications ────────────────────────────────────────────────────────
    getNotifications: build.query<NotificationsData, void>({
      query: () => ({ url: API.notifications.base }),
      providesTags: ["Notifications"],
    }),

    // ── Dashboard ────────────────────────────────────────────────────────────
    getDashboard: build.query<DashboardData, void>({
      query: () => ({ url: API.dashboard }),
      providesTags: ["Dashboard"],
    }),

    // ── Partner ──────────────────────────────────────────────────────────────
    getPartner: build.query<PartnerStatusData, void>({
      query: () => ({ url: API.settings.partner }),
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

    // ── Analytics / Insights ─────────────────────────────────────────────────
    getAnalytics: build.query<AnalyticsData, void>({
      query: () => ({ url: API.analytics }),
      providesTags: ["Dashboard"],
    }),

    // ── Public wedding page ───────────────────────────────────────────────────
    generatePublicSlug: build.mutation<{ slug: string }, void>({
      query: () => ({ url: API.public.generateSlug, method: "POST" }),
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
  useGetAnalyticsQuery,
  useGeneratePublicSlugMutation,
} = api;

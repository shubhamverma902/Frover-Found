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
import type { SettingsData } from "@/api/settings.api";
import type { NotificationsData } from "@/api/notifications.api";
import type { DashboardData } from "@/api/dashboard.api";

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
} = api;

import { z } from 'zod';

// ── Domain entities ──────────────────────────────────────────────────────────

export const AttachmentSchema = z.object({
  _id:          z.string(),
  filename:     z.string(),
  originalName: z.string(),
  url:          z.string(),
  mimetype:     z.string(),
  size:         z.number(),
  uploadedAt:   z.string(),
});

export const WeddingEventSchema = z.object({
  _id:         z.string().optional(),
  name:        z.string(),
  date:        z.string(),
  time:        z.string(),
  venue:       z.string(),
  guests:      z.number(),
  status:      z.enum(['confirmed', 'planning', 'pending']),
  desc:        z.string(),
  attachments: z.array(AttachmentSchema).optional(),
});

export const ChecklistTaskSchema = z.object({
  _id:   z.string(),
  done:  z.boolean(),
  label: z.string(),
  due:   z.string().nullable(),
});

export const ChecklistCategorySchema = z.object({
  _id:      z.string(),
  icon:     z.string(),
  category: z.string(),
  tasks:    z.array(ChecklistTaskSchema),
});

export const BudgetExpenseSchema = z.object({
  _id:    z.string(),
  amount: z.number(),
  note:   z.string(),
  date:   z.string(),
});

export const BudgetCategorySchema = z.object({
  _id:       z.string(),
  icon:      z.string(),
  category:  z.string(),
  allocated: z.number(),
  spent:     z.number(),
  expenses:  z.array(BudgetExpenseSchema),
});

export const GuestSchema = z.object({
  _id:      z.string(),
  name:     z.string(),
  relation: z.string(),
  phone:    z.string(),
  rsvp:     z.enum(['confirmed', 'pending', 'declined']),
  meal:     z.enum(['Veg', 'Non-veg', 'Jain']),
  plusOne:  z.boolean(),
});

export const VendorSchema = z.object({
  _id:         z.string(),
  icon:        z.string(),
  category:    z.string(),
  name:        z.string(),
  contact:     z.string(),
  location:    z.string(),
  status:      z.enum(['booked', 'shortlisted', 'pending']),
  rating:      z.number().int().min(1).max(5),
  notes:       z.string(),
  attachments: z.array(AttachmentSchema).optional(),
});

export const SeatingTableSchema = z.object({
  _id:      z.string(),
  name:     z.string(),
  capacity: z.number(),
  shape:    z.enum(['round', 'rectangular']),
  guestIds: z.array(z.string()),
});

// ── API response shapes ──────────────────────────────────────────────────────

export const GuestsDataSchema = z.object({
  guests:     z.array(GuestSchema),
  total:      z.number(),
  page:       z.number(),
  totalPages: z.number(),
  grandTotal: z.number(),
  confirmed:  z.number(),
  pending:    z.number(),
  declined:   z.number(),
});

export const VendorsDataSchema = z.object({
  vendors:     z.array(VendorSchema),
  total:       z.number(),
  page:        z.number(),
  totalPages:  z.number(),
  grandTotal:  z.number(),
  booked:      z.number(),
  shortlisted: z.number(),
});

export const EventsDataSchema = z.object({
  events:     z.array(WeddingEventSchema),
  total:      z.number(),
  page:       z.number(),
  totalPages: z.number(),
  grandTotal: z.number(),
  confirmed:  z.number(),
  planning:   z.number(),
  pending:    z.number(),
});

export const BudgetDataSchema = z.object({
  total:      z.number(),
  categories: z.array(BudgetCategorySchema),
});

export const SeatingTablesResponseSchema = z.object({
  tables: z.array(SeatingTableSchema),
});

export const SeatingDataSchema = z.object({
  tables: z.array(SeatingTableSchema),
  guests: z.array(GuestSchema),
});

export const ChecklistResponseSchema = z.object({
  categories: z.array(ChecklistCategorySchema),
});

// Settings
export const ProfileDataSchema = z.object({
  name:        z.string(),
  partnerName: z.string(),
  email:       z.string(),
  phone:       z.string(),
});

export const WeddingDataSchema = z.object({
  weddingDate: z.string(),
  venue:       z.string(),
  city:        z.string(),
  guestCount:  z.number(),
});

export const NotificationPrefSchema = z.object({
  key:   z.string(),
  label: z.string(),
  sub:   z.string(),
  on:    z.boolean(),
});

export const SettingsDataSchema = z.object({
  profile:       ProfileDataSchema,
  wedding:       WeddingDataSchema.nullable(),
  notifications: z.array(NotificationPrefSchema),
  publicSlug:    z.string().nullable(),
});

// Notifications
export const AppNotificationSchema = z.object({
  _id:  z.string(),
  icon: z.string(),
  text: z.string(),
  time: z.string(),
  read: z.boolean(),
});

export const NotificationsDataSchema = z.object({
  notifications: z.array(AppNotificationSchema),
  unreadCount:   z.number(),
});

// Dashboard
export const DashboardUserDataSchema = z.object({
  name:        z.string(),
  partner:     z.string(),
  weddingDate: z.string(),
  venue:       z.string(),
  daysLeft:    z.number().nullable(),
});

export const DashboardStatsDataSchema = z.object({
  daysLeft:        z.number().nullable(),
  tasksTotal:      z.number(),
  tasksDone:       z.number(),
  budgetTotal:     z.number(),
  budgetSpent:     z.number(),
  guestsTotal:     z.number(),
  guestsConfirmed: z.number(),
  vendorsTotal:    z.number(),
  vendorsBooked:   z.number(),
});

export const DashboardTaskSchema = z.object({
  _id:          z.string(),
  label:        z.string(),
  due:          z.string().nullable(),
  done:         z.boolean(),
  categoryIcon: z.string(),
});

export const DashboardActivitySchema = z.object({
  _id:  z.string(),
  icon: z.string(),
  text: z.string(),
  time: z.string(),
});

export const DashboardDataSchema = z.object({
  user:     DashboardUserDataSchema,
  stats:    DashboardStatsDataSchema,
  tasks:    z.array(DashboardTaskSchema),
  activity: z.array(DashboardActivitySchema),
});

// Partner
export const LinkedPartnerDataSchema = z.object({
  id:       z.string(),
  name:     z.string(),
  email:    z.string(),
  linkedAt: z.string(),
});

export const PartnerStatusDataSchema = z.object({
  linked:  LinkedPartnerDataSchema.nullable(),
  pending: z.object({ email: z.string(), expiresAt: z.string() }).nullable(),
});

// Collaborators
export const CollaboratorEntrySchema = z.object({
  _id:      z.string(),
  email:    z.string(),
  name:     z.string(),
  role:     z.enum(['planner', 'viewer']),
  accepted: z.boolean(),
  linkedAt: z.string().nullable(),
});

export const CollaboratorsDataSchema = z.object({
  collaborators: z.array(CollaboratorEntrySchema),
});

// Analytics
export const BudgetBurnPointSchema = z.object({
  week:       z.string(),
  spent:      z.number(),
  cumulative: z.number(),
});

export const RsvpTrendPointSchema = z.object({
  week:      z.string(),
  confirmed: z.number(),
  declined:  z.number(),
});

export const TaskVelocityPointSchema = z.object({
  week:      z.string(),
  completed: z.number(),
});

export const TaskCategoryPointSchema = z.object({
  category: z.string(),
  done:     z.number(),
  total:    z.number(),
});

export const AnalyticsSummarySchema = z.object({
  budgetSpent:     z.number(),
  budgetTotal:     z.number(),
  burnPct:         z.number(),
  rsvpRate:        z.number(),
  taskRate:        z.number(),
  guestsTotal:     z.number(),
  guestsConfirmed: z.number(),
  tasksTotal:      z.number(),
  tasksDone:       z.number(),
});

export const AnalyticsDataSchema = z.object({
  summary:        AnalyticsSummarySchema,
  budgetBurn:     z.array(BudgetBurnPointSchema),
  rsvpTrend:      z.array(RsvpTrendPointSchema),
  taskVelocity:   z.array(TaskVelocityPointSchema),
  taskByCategory: z.array(TaskCategoryPointSchema),
});

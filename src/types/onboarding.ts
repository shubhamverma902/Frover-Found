/**
 * Canonical shape of the wedding profile.
 * Imported by the onboarding slice, onboarding API, and any other
 * feature (events, budget, guests…) that needs access to wedding details.
 */
export interface WeddingProfile {
  partner1:    string;
  partner2:    string;
  weddingDate: string;   // ISO-8601 date string
  city:        string;
  guestCount:  number;
  budget:      number;
  style:       string;
  events:      string[]; // event-type IDs e.g. ['wedding', 'sangeet']
}

export type WeddingStyle = 'traditional' | 'royal' | 'modern' | 'destination' | 'fusion' | string;
export type EventId      = 'mehendi' | 'haldi' | 'sangeet' | 'wedding' | 'reception' | 'tilak' | string;

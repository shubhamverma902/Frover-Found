import type { Attachment } from './attachment';

export interface Vendor {
  _id:          string;
  icon:         string;
  category:     string;
  name:         string;
  contact:      string;
  location:     string;
  status:       'booked' | 'shortlisted' | 'pending';
  rating:       number;
  notes:        string;
  attachments?: Attachment[];
}

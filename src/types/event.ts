import type { Attachment } from './attachment';

export interface WeddingEvent {
  _id?:         string;
  name:         string;
  date:         string;
  time:         string;
  venue:        string;
  guests:       number;
  status:       'confirmed' | 'planning' | 'pending';
  desc:         string;
  attachments?: Attachment[];
}

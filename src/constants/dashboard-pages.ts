// ── Types ─────────────────────────────────────────────────

export interface Attachment {
  _id:          string;
  filename:     string;
  originalName: string;
  url:          string;
  mimetype:     string;
  size:         number;
  uploadedAt:   string;
}

export interface WeddingEvent {
  _id?:        string;
  name:        string;
  date:        string;
  time:        string;
  venue:       string;
  guests:      number;
  status:      'confirmed' | 'planning' | 'pending';
  desc:        string;
  attachments?: Attachment[];
}

export interface ChecklistTask {
  _id:   string;
  done:  boolean;
  label: string;
  due:   string;
}

export interface ChecklistCategory {
  _id:      string;
  icon:     string;
  category: string;
  tasks:    ChecklistTask[];
}

export interface BudgetExpense {
  _id:    string;
  amount: number;
  note:   string;
  date:   string;
}

export interface BudgetCategory {
  _id:       string;
  icon:      string;
  category:  string;
  allocated: number;
  spent:     number;
  expenses:  BudgetExpense[];
}

export interface Guest {
  _id:      string;
  name:     string;
  relation: string;
  phone:    string;
  rsvp:     'confirmed' | 'pending' | 'declined';
  meal:     'Veg' | 'Non-veg' | 'Jain';
  plusOne:  boolean;
}

export interface Vendor {
  _id:         string;
  icon:        string;
  category:    string;
  name:        string;
  contact:     string;
  location:    string;
  status:      'booked' | 'shortlisted' | 'pending';
  rating:      number;
  notes:       string;
  attachments?: Attachment[];
}

export interface SeatingTable {
  _id:      string;
  name:     string;
  capacity: number;
  shape:    'round' | 'rectangular';
  guestIds: string[];
}


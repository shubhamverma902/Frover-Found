export interface SeatingTable {
  _id:      string;
  name:     string;
  capacity: number;
  shape:    'round' | 'rectangular';
  guestIds: string[];
}

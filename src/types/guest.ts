export interface Guest {
  _id:      string;
  name:     string;
  relation: string;
  phone:    string;
  rsvp:     'confirmed' | 'pending' | 'declined';
  meal:     'Veg' | 'Non-veg' | 'Jain';
  plusOne:  boolean;
}

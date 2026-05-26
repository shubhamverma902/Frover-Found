export interface ChecklistTask {
  _id:   string;
  done:  boolean;
  label: string;
  due:   string | null;
}

export interface ChecklistCategory {
  _id:      string;
  icon:     string;
  category: string;
  tasks:    ChecklistTask[];
}

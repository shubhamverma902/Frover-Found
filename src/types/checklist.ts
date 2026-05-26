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

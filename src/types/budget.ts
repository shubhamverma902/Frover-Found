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

export interface BudgetBurnPoint {
  week:       string;
  spent:      number;
  cumulative: number;
}

export interface RsvpTrendPoint {
  week:      string;
  confirmed: number;
  declined:  number;
}

export interface TaskVelocityPoint {
  week:      string;
  completed: number;
}

export interface TaskCategoryPoint {
  category: string;
  done:     number;
  total:    number;
}

export interface AnalyticsSummary {
  budgetSpent:     number;
  budgetTotal:     number;
  burnPct:         number;
  rsvpRate:        number;
  taskRate:        number;
  guestsTotal:     number;
  guestsConfirmed: number;
  tasksTotal:      number;
  tasksDone:       number;
}

export interface AnalyticsData {
  summary:        AnalyticsSummary;
  budgetBurn:     BudgetBurnPoint[];
  rsvpTrend:      RsvpTrendPoint[];
  taskVelocity:   TaskVelocityPoint[];
  taskByCategory: TaskCategoryPoint[];
}

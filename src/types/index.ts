// Financial transaction data type
export interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: string;
  account_number: string;
  currency: string;
  category?: string; // Added for categorization
}

// Spending category type
export interface SpendingCategory {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

// Monthly spending summary
export interface MonthlySpending {
  month: string;
  totalSpent: number;
  categories: Record<string, number>;
}

// Savings goal type
export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  createdAt: string;
}

// Savings recommendation type
export interface SavingsRecommendation {
  category: string;
  currentSpending: number;
  suggestedReduction: number;
  potentialSavings: number;
  description: string;
}

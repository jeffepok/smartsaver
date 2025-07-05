import { Transaction, SavingsGoal, Budget, BudgetAlert } from '@/types';

// Storage keys
const TRANSACTIONS_STORAGE_KEY = 'smartsave_transactions';
const SAVINGS_GOALS_STORAGE_KEY = 'smartsave_savings_goals';
const BUDGETS_KEY = 'smartsave_budgets';
const BUDGET_ALERTS_KEY = 'smartsave_budget_alerts';

// Save transactions to localStorage
export const saveTransactions = (transactions: Transaction[]): void => {
  try {
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transactions to localStorage:', error);
  }
};

// Load transactions from localStorage
export const loadTransactions = (): Transaction[] => {
  try {
    const storedTransactions = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    if (storedTransactions) {
      return JSON.parse(storedTransactions);
    }
  } catch (error) {
    console.error('Error loading transactions from localStorage:', error);
  }
  return [];
};

// Save savings goals to localStorage
export const saveSavingsGoals = (goals: SavingsGoal[]): void => {
  try {
    localStorage.setItem(SAVINGS_GOALS_STORAGE_KEY, JSON.stringify(goals));
  } catch (error) {
    console.error('Error saving savings goals to localStorage:', error);
  }
};

// Load savings goals from localStorage
export const loadSavingsGoals = (): SavingsGoal[] => {
  try {
    const storedGoals = localStorage.getItem(SAVINGS_GOALS_STORAGE_KEY);
    if (storedGoals) {
      return JSON.parse(storedGoals);
    }
  } catch (error) {
    console.error('Error loading savings goals from localStorage:', error);
  }
  return [];
};

// Budgets storage functions
export const saveBudgets = (budgets: Budget[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
  }
};

export const loadBudgets = (): Budget[] => {
  if (typeof window !== 'undefined') {
    const storedBudgets = localStorage.getItem(BUDGETS_KEY);
    return storedBudgets ? JSON.parse(storedBudgets) : [];
  }
  return [];
};

// Budget alerts storage functions
export const saveBudgetAlerts = (alerts: BudgetAlert[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(BUDGET_ALERTS_KEY, JSON.stringify(alerts));
  }
};

export const loadBudgetAlerts = (): BudgetAlert[] => {
  if (typeof window !== 'undefined') {
    const storedAlerts = localStorage.getItem(BUDGET_ALERTS_KEY);
    return storedAlerts ? JSON.parse(storedAlerts) : [];
  }
  return [];
};

// Clear all stored data
export const clearStoredData = (): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(TRANSACTIONS_STORAGE_KEY);
      localStorage.removeItem(SAVINGS_GOALS_STORAGE_KEY);
      localStorage.removeItem(BUDGETS_KEY);
      localStorage.removeItem(BUDGET_ALERTS_KEY);
    } catch (error) {
      console.error('Error clearing stored data from localStorage:', error);
    }
  }
};

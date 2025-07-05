import { Transaction, SavingsGoal } from '@/types';

const TRANSACTIONS_STORAGE_KEY = 'smartsave-transactions';
const SAVINGS_GOALS_STORAGE_KEY = 'smartsave-savings-goals';

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

// Clear all stored data
export const clearStoredData = (): void => {
  try {
    localStorage.removeItem(TRANSACTIONS_STORAGE_KEY);
    localStorage.removeItem(SAVINGS_GOALS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing stored data from localStorage:', error);
  }
};

import { Transaction, Budget, BudgetAlert } from '@/types';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

// Get current spending per category for the current month
export const getCurrentMonthlySpending = (transactions: Transaction[]): Record<string, number> => {
  const now = new Date();
  const startOfCurrentMonth = startOfMonth(now);
  const endOfCurrentMonth = endOfMonth(now);
  
  // Group and sum transactions by category
  const categorySpending: Record<string, number> = {};
  
  transactions.forEach(transaction => {
    const transactionDate = new Date(transaction.date);
    
    // Only include transactions from current month and with negative amount (spending)
    if (
      transaction.category &&
      transaction.amount < 0 &&
      isWithinInterval(transactionDate, {
        start: startOfCurrentMonth,
        end: endOfCurrentMonth
      })
    ) {
      const category = transaction.category;
      const absAmount = Math.abs(transaction.amount);
      
      categorySpending[category] = (categorySpending[category] || 0) + absAmount;
    }
  });
  
  return categorySpending;
};

// Check budgets against current spending and generate alerts
export const checkBudgetsAndGenerateAlerts = (
  budgets: Budget[],
  transactions: Transaction[],
  thresholds: number[] = [50, 80, 90, 100]
): BudgetAlert[] => {
  // Get current spending for this month
  const currentSpending = getCurrentMonthlySpending(transactions);
  const alerts: BudgetAlert[] = [];
  
  // Check each budget against spending
  budgets.forEach(budget => {
    // Currently only supporting monthly budgets
    if (budget.period === 'monthly' && currentSpending[budget.category]) {
      const spending = currentSpending[budget.category];
      const percentageUsed = (spending / budget.amount) * 100;
      
      // Check against thresholds
      for (const threshold of thresholds) {
        if (percentageUsed >= threshold) {
          const message = generateAlertMessage(budget.category, percentageUsed, threshold, budget.amount);
          
          alerts.push({
            budgetId: budget.id,
            category: budget.category,
            threshold,
            currentSpending: spending,
            budgetAmount: budget.amount,
            percentageUsed,
            message
          });
          
          // Only generate one alert per budget (the highest threshold passed)
          break;
        }
      }
    }
  });
  
  return alerts;
};

// Generate an appropriate alert message based on the situation
const generateAlertMessage = (
  category: string,
  percentageUsed: number,
  threshold: number,
  budgetAmount: number
): string => {
  const roundedPercentage = Math.floor(percentageUsed);
  
  if (percentageUsed >= 100) {
    return `Warning: You've exceeded your ${category} budget of ${budgetAmount.toFixed(2)}!`;
  } else {
    return `Alert: You've used ${roundedPercentage}% of your ${category} budget this month.`;
  }
};

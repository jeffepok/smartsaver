import { Transaction } from '@/types';
import { calculateCategoryTotals } from '@/utils/categorization';
import { subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface RecommendationRule {
  id: string;
  condition: (data: FinancialData) => boolean;
  recommendation: (data: FinancialData) => string;
  priority: number; // Higher number = higher priority
}

interface CategorySpending {
  category: string;
  amount: number;
  percentOfTotal: number;
  monthlyAverage: number;
  monthOverMonthChange: number; // Percentage change from previous month
}

interface FinancialData {
  transactions: Transaction[];
  categoryTotals: Record<string, number>;
  topExpenseCategories: CategorySpending[];
  monthlyExpenses: {
    month: string;
    total: number;
  }[];
  savingsRate: number;
  averageMonthlyIncome: number;
  averageMonthlyExpenses: number;
  budgets: {
    category: string;
    amount: number;
    period: string;
    percentUsed: number;
  }[];
  recentMonthsData: {
    month: Date;
    expenses: Record<string, number>;
    totalExpense: number;
  }[];
}

// Prepare financial data for analysis
export function prepareFinancialData(
  transactions: Transaction[],
  budgets: any[]
): FinancialData {
  const today = new Date();
  const threeMonthsAgo = subMonths(today, 3);
  
  // Filter recent transactions (last 3 months)
  const recentTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= threeMonthsAgo;
  });

  // Calculate category totals
  const categoryTotals = calculateCategoryTotals(recentTransactions);
  
  // Calculate expenses per month for the last 3 months
  const last3Months = Array.from({ length: 3 }, (_, i) => subMonths(today, i));
  
  const recentMonthsData = last3Months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return isWithinInterval(date, { start: monthStart, end: monthEnd });
    });
    
    const expenses: Record<string, number> = {};
    monthTransactions.forEach(t => {
      if (t.amount < 0) { // Only expenses
        const category = t.category || 'Uncategorized';
        if (!expenses[category]) {
          expenses[category] = 0;
        }
        expenses[category] += Math.abs(t.amount);
      }
    });
    
    const totalExpense = Object.values(expenses).reduce((sum, amount) => sum + amount, 0);
    
    return {
      month,
      expenses,
      totalExpense
    };
  });

  // Calculate total expenses and income
  const expenseTransactions = transactions.filter(t => t.amount < 0);
  const incomeTransactions = transactions.filter(t => t.amount > 0);
  
  const totalExpenses = Math.abs(expenseTransactions.reduce((sum, t) => sum + t.amount, 0));
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  const averageMonthlyExpenses = totalExpenses / 3; // Last 3 months
  const averageMonthlyIncome = totalIncome / 3; // Last 3 months
  
  // Calculate savings rate
  const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
  
  // Process top expense categories with detailed analysis
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
    .filter(([, amount]) => amount < 0) // Only include expense categories
    .map(([category, amount]): [string, number] => [category, Math.abs(amount)]);
  
  const totalSpending = sortedCategories.reduce((sum, [, amount]) => sum + amount, 0);
  
  const topExpenseCategories = sortedCategories.map(([category, amount]) => {
    // Calculate month-over-month change for this category
    let monthOverMonthChange = 0;
    if (recentMonthsData.length >= 2) {
      const currentMonth = recentMonthsData[0].expenses[category] || 0;
      const previousMonth = recentMonthsData[1].expenses[category] || 0;
      
      if (previousMonth > 0) {
        monthOverMonthChange = ((currentMonth - previousMonth) / previousMonth) * 100;
      }
    }
    
    return {
      category,
      amount,
      percentOfTotal: (amount / totalSpending) * 100,
      monthlyAverage: amount / 3,
      monthOverMonthChange
    };
  });
  
  // Format budget data with progress
  const formattedBudgets = budgets.map(b => {
    const categorySpending = Math.abs(categoryTotals[b.category] || 0);
    const percentUsed = (categorySpending / b.amount) * 100;
    
    return {
      category: b.category,
      amount: b.amount,
      period: b.period,
      percentUsed
    };
  });
  
  const monthlyExpenses = recentMonthsData.map(data => ({
    month: data.month.toLocaleString('default', { month: 'long' }),
    total: data.totalExpense
  }));
  
  return {
    transactions: recentTransactions,
    categoryTotals,
    topExpenseCategories,
    monthlyExpenses,
    savingsRate,
    averageMonthlyIncome,
    averageMonthlyExpenses,
    budgets: formattedBudgets,
    recentMonthsData
  };
}

// Define rules for spending recommendations
const spendingReductionRules: RecommendationRule[] = [
  // High spending category rules
  {
    id: 'high-category-percentage',
    condition: (data) => data.topExpenseCategories.some(cat => cat.percentOfTotal > 30),
    recommendation: (data) => {
      const highPercentageCat = data.topExpenseCategories.find(cat => cat.percentOfTotal > 30);
      if (highPercentageCat) {
        return `Your ${highPercentageCat.category} spending accounts for ${highPercentageCat.percentOfTotal.toFixed(1)}% of your total expenses (€${highPercentageCat.amount.toFixed(2)}). Consider setting a stricter budget for this category and identify specific items to cut back on.`;
      }
      return '';
    },
    priority: 9
  },
  
  // Month-over-month increase rules
  {
    id: 'significant-category-increase',
    condition: (data) => data.topExpenseCategories.some(cat => cat.monthOverMonthChange > 20),
    recommendation: (data) => {
      const increasedCats = data.topExpenseCategories.filter(cat => cat.monthOverMonthChange > 20);
      if (increasedCats.length > 0) {
        const catMentions = increasedCats
          .slice(0, 2)
          .map(cat => `${cat.category} (+${cat.monthOverMonthChange.toFixed(1)}%)`);
        
        return `Your spending has significantly increased in: ${catMentions.join(', ')}. Review these categories to identify recent changes and consider returning to previous spending levels.`;
      }
      return '';
    },
    priority: 8
  },
  
  // Budget overspending rules
  {
    id: 'budget-overspent',
    condition: (data) => data.budgets.some(b => b.percentUsed > 100),
    recommendation: (data) => {
      const overspentBudgets = data.budgets.filter(b => b.percentUsed > 100);
      if (overspentBudgets.length > 0) {
        const mentions = overspentBudgets
          .slice(0, 2)
          .map(b => `${b.category} (${b.percentUsed.toFixed(0)}% used)`);
        
        return `You've exceeded your budget in: ${mentions.join(', ')}. Focus on immediately reducing spending in these categories for the rest of the period.`;
      }
      return '';
    },
    priority: 10
  },
  
  // Low savings rate rule
  {
    id: 'low-savings-rate',
    condition: (data) => data.savingsRate < 15,
    recommendation: (data) => {
      return `Your savings rate is ${data.savingsRate.toFixed(1)}%, which is below the recommended 15-20%. Consider applying the 50/30/20 rule: 50% on needs, 30% on wants, and 20% on savings.`;
    },
    priority: 7
  },
  
  // Luxury or discretionary spending rule
  {
    id: 'high-discretionary',
    condition: (data) => {
      const discretionaryCategories = ['Entertainment', 'Dining', 'Shopping', 'Travel', 'Subscriptions'];
      const discretionaryTotal = data.topExpenseCategories
        .filter(cat => discretionaryCategories.some(dc => cat.category.includes(dc)))
        .reduce((sum, cat) => sum + cat.amount, 0);
      
      const totalExpenses = data.topExpenseCategories.reduce((sum, cat) => sum + cat.amount, 0);
      return (discretionaryTotal / totalExpenses) > 0.25; // More than 25% on discretionary
    },
    recommendation: (data) => {
      const discretionaryCategories = ['Entertainment', 'Dining', 'Shopping', 'Travel', 'Subscriptions'];
      const discretionaryCats = data.topExpenseCategories
        .filter(cat => discretionaryCategories.some(dc => cat.category.includes(dc)));
      
      const totalDisc = discretionaryCats.reduce((sum, cat) => sum + cat.amount, 0);
      const totalExpenses = data.topExpenseCategories.reduce((sum, cat) => sum + cat.amount, 0);
      const percentage = (totalDisc / totalExpenses) * 100;
      
      const topDiscCats = discretionaryCats
        .slice(0, 2)
        .map(cat => `${cat.category} (€${cat.amount.toFixed(2)})`);
      
      return `You're spending ${percentage.toFixed(1)}% of your budget on discretionary items, particularly ${topDiscCats.join(' and ')}. Try using the 24-hour rule: wait 24 hours before making non-essential purchases.`;
    },
    priority: 6
  },
  
  // Inconsistent expense pattern rule
  {
    id: 'expense-volatility',
    condition: (data) => {
      if (data.monthlyExpenses.length < 3) return false;
      
      const expenses = data.monthlyExpenses.map(m => m.total);
      const avg = expenses.reduce((sum, exp) => sum + exp, 0) / expenses.length;
      
      // Calculate variance
      const variance = expenses.reduce((sum, exp) => sum + Math.pow(exp - avg, 2), 0) / expenses.length;
      const stdDev = Math.sqrt(variance);
      
      // Coefficient of variation > 20% indicates high volatility
      return (stdDev / avg) > 0.2;
    },
    recommendation: (data) => {
      const highest = Math.max(...data.monthlyExpenses.map(m => m.total));
      const lowest = Math.min(...data.monthlyExpenses.map(m => m.total));
      const difference = highest - lowest;
      const percentDiff = (difference / lowest) * 100;
      
      return `Your monthly spending varies by up to ${percentDiff.toFixed(0)}% (€${difference.toFixed(2)}). Creating a consistent monthly budget and sticking to it can help stabilize your finances and make your expenses more predictable.`;
    },
    priority: 5
  },
  
  // Recurring subscription check
  {
    id: 'subscription-audit',
    condition: (data) => {
      // This is a general recommendation that applies to most people
      return true;
    },
    recommendation: (data) => {
      return `Consider auditing your subscriptions and recurring charges. Many people save €15-30 monthly by canceling unused subscriptions. Look for small regular transactions that might be forgotten subscriptions.`;
    },
    priority: 3
  },
  
  // Cashback/rewards optimization
  {
    id: 'rewards-optimization',
    condition: (data) => {
      // Apply to users with significant spending
      return data.averageMonthlyExpenses > 1000;
    },
    recommendation: (data) => {
      return `With your current spending level of €${data.averageMonthlyExpenses.toFixed(2)}/month, using the right cashback or rewards credit card could save you €${(data.averageMonthlyExpenses * 0.02).toFixed(2)}/month. Make sure you're maximizing rewards on your highest spending categories.`;
    },
    priority: 2
  }
];

export function getSpendingRecommendations(
  transactions: Transaction[],
  budgets: any[]
): string[] {
  try {
    // Prepare data for analysis
    const financialData = prepareFinancialData(transactions, budgets);
    
    // Apply rules to generate recommendations
    const validRecommendations = spendingReductionRules
      .filter(rule => rule.condition(financialData))
      .sort((a, b) => b.priority - a.priority) // Sort by priority (highest first)
      .map(rule => rule.recommendation(financialData))
      .filter(rec => rec.length > 0);
    
    // Limit to top 3-5 recommendations to avoid overwhelming the user
    return validRecommendations.slice(0, 4);
  } catch (error) {
    console.error("Error generating spending recommendations:", error);
    return ["Unable to generate personalized recommendations due to an error."];
  }
}

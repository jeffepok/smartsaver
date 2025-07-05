import { Transaction, SavingsRecommendation } from '@/types';
import { calculateCategoryTotals } from './categorization';

// Get average monthly spending by category
export function getAverageMonthlySpending(transactions: Transaction[]): Record<string, number> {
  // Group transactions by month and category
  const monthCategoryMap: Record<string, Record<string, number>> = {};
  
  transactions.forEach(transaction => {
    if (!transaction.category || transaction.amount >= 0) return;
    
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (!monthCategoryMap[monthKey]) {
      monthCategoryMap[monthKey] = {};
    }
    
    const category = transaction.category;
    const absAmount = Math.abs(transaction.amount);
    
    monthCategoryMap[monthKey][category] = (monthCategoryMap[monthKey][category] || 0) + absAmount;
  });
  
  // Count number of months
  const monthsCount = Object.keys(monthCategoryMap).length;
  if (monthsCount === 0) return {};
  
  // Calculate total for each category across all months
  const categoryTotals: Record<string, number> = {};
  
  Object.values(monthCategoryMap).forEach(monthData => {
    Object.entries(monthData).forEach(([category, amount]) => {
      categoryTotals[category] = (categoryTotals[category] || 0) + amount;
    });
  });
  
  // Calculate averages
  const averages: Record<string, number> = {};
  
  Object.entries(categoryTotals).forEach(([category, total]) => {
    averages[category] = total / monthsCount;
  });
  
  return averages;
}

// Generate savings recommendations based on spending patterns
export function generateSavingsRecommendations(transactions: Transaction[]): SavingsRecommendation[] {
  const averageSpending = getAverageMonthlySpending(transactions);
  const recommendations: SavingsRecommendation[] = [];
  
  // Categories with high potential for savings
  const targetCategories = [
    { 
      name: "Food & Dining", 
      suggestedReductionPercentage: 0.15, 
      description: "Reducing restaurant and takeout meals could save you money. Consider cooking at home more often."
    },
    { 
      name: "Entertainment", 
      suggestedReductionPercentage: 0.20, 
      description: "Look for free or lower-cost entertainment options to reduce spending in this category."
    },
    { 
      name: "Shopping", 
      suggestedReductionPercentage: 0.15, 
      description: "Consider implementing a 24-hour rule before non-essential purchases to reduce impulse buying."
    },
    { 
      name: "Subscriptions", 
      suggestedReductionPercentage: 0.30, 
      description: "Review your subscriptions and cancel those you don't regularly use."
    },
    { 
      name: "Transportation", 
      suggestedReductionPercentage: 0.10, 
      description: "Consider carpooling, public transport, or biking for some trips to save on transport costs."
    }
  ];
  
  // Generate recommendations for categories with significant spending
  targetCategories.forEach(targetCategory => {
    const currentSpending = averageSpending[targetCategory.name];
    
    if (currentSpending && currentSpending > 50) { // Only suggest for categories with significant spending
      const suggestedReduction = targetCategory.suggestedReductionPercentage;
      const potentialSavings = currentSpending * suggestedReduction;
      
      recommendations.push({
        category: targetCategory.name,
        currentSpending,
        suggestedReduction: suggestedReduction * 100, // Convert to percentage
        potentialSavings,
        description: targetCategory.description
      });
    }
  });
  
  // Sort recommendations by potential savings (highest first)
  return recommendations.sort((a, b) => b.potentialSavings - a.potentialSavings);
}

// Calculate potential monthly savings based on spending patterns
export function calculatePotentialMonthlySavings(transactions: Transaction[]): number {
  const recommendations = generateSavingsRecommendations(transactions);
  
  // Sum up potential savings from all recommendations
  return recommendations.reduce((total, recommendation) => {
    return total + recommendation.potentialSavings;
  }, 0);
}

// Calculate suggested monthly savings amount
export function suggestMonthlySavingsAmount(transactions: Transaction[]): number {
  // Calculate average monthly income
  const monthlyIncomeMap: Record<string, number> = {};
  
  transactions.forEach(transaction => {
    if (transaction.amount <= 0) return; // Skip expenses
    
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (!monthlyIncomeMap[monthKey]) {
      monthlyIncomeMap[monthKey] = 0;
    }
    
    monthlyIncomeMap[monthKey] += transaction.amount;
  });
  
  const monthsCount = Object.keys(monthlyIncomeMap).length;
  if (monthsCount === 0) return 0;
  
  const totalIncome = Object.values(monthlyIncomeMap).reduce((sum, amount) => sum + amount, 0);
  const averageMonthlyIncome = totalIncome / monthsCount;
  
  // Calculate average monthly expenses
  const monthlyExpenseMap: Record<string, number> = {};
  
  transactions.forEach(transaction => {
    if (transaction.amount >= 0) return; // Skip income
    
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (!monthlyExpenseMap[monthKey]) {
      monthlyExpenseMap[monthKey] = 0;
    }
    
    monthlyExpenseMap[monthKey] += Math.abs(transaction.amount);
  });
  
  const totalExpenses = Object.values(monthlyExpenseMap).reduce((sum, amount) => sum + amount, 0);
  const averageMonthlyExpenses = totalExpenses / monthsCount;
  
  // Calculate disposable income
  const disposableIncome = averageMonthlyIncome - averageMonthlyExpenses;
  
  // Suggest saving a percentage of disposable income (adjusted based on amount)
  if (disposableIncome <= 0) {
    // If no disposable income, suggest minimum savings through expense reductions
    return calculatePotentialMonthlySavings(transactions);
  } else if (disposableIncome < 500) {
    return disposableIncome * 0.2; // 20% of disposable income
  } else if (disposableIncome < 1000) {
    return disposableIncome * 0.3; // 30% of disposable income
  } else {
    return disposableIncome * 0.4; // 40% of disposable income
  }
}

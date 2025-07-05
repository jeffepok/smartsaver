import React from 'react';
import { Transaction } from '@/types';
import { getLastThreeMonthsTransactions, groupTransactionsByMonth, calculateMonthlySpending } from '@/utils/csvParser';
import { format, parseISO } from 'date-fns';
import { calculateCategoryTotals, categoryColors } from '@/utils/categorization';

interface ExpenseSummaryProps {
  transactions: Transaction[];
}

const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({ transactions }) => {
  // Get transactions from the last three months
  const recentTransactions = getLastThreeMonthsTransactions(transactions);
  
  // Group transactions by month
  const groupedByMonth = groupTransactionsByMonth(recentTransactions);
  
  // Calculate monthly totals
  const monthlyTotals = calculateMonthlySpending(groupedByMonth);
  
  // Get category totals across all months
  const categoryTotals = calculateCategoryTotals(recentTransactions);
  
  // Sort categories by total amount (descending)
  const sortedCategories = Object.entries(categoryTotals)
    .filter(([category]) => category !== 'Income' && category !== 'Transfer') // Exclude income and transfers
    .sort((a, b) => b[1] - a[1]);
  
  // Calculate total spending
  const totalSpending = sortedCategories.reduce((total, [_, amount]) => total + amount, 0);

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6">Last 3 Months Expense Summary</h2>
      
      {/* Monthly spending overview */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Monthly Spending</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(monthlyTotals).map(([month, total]) => (
            <div key={month} className="p-4 bg-blue-50 rounded-lg">
              <h4 className="text-md font-medium">{month}</h4>
              <p className="text-2xl font-bold text-blue-800">
                €{total.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">
                {groupedByMonth[month]?.length || 0} transactions
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Category breakdown */}
      <div>
        <h3 className="text-lg font-medium mb-4">Spending by Category</h3>
        <div className="space-y-3">
          {sortedCategories.map(([category, amount]) => {
            const percentage = totalSpending > 0 ? (amount / totalSpending) * 100 : 0;
            
            return (
              <div key={category} className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-2" 
                  style={{ backgroundColor: categoryColors[category] || categoryColors.Other }}
                ></div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{category}</span>
                    <span className="text-gray-600">€{amount.toFixed(2)} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: categoryColors[category] || categoryColors.Other
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExpenseSummary;

import React, { useState, useEffect } from 'react';
import { Transaction } from '@/types';
import { getLastThreeMonthsTransactions, groupTransactionsByMonth, calculateMonthlySpending } from '@/utils/csvParser';
import { format, parseISO, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { calculateCategoryTotals, categoryColors } from '@/utils/categorization';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardProps {
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  // Initialize with a 3-month date range by default
  const currentDate = new Date();
  const [startDate, setStartDate] = useState<Date>(startOfMonth(subMonths(currentDate, 2))); // 3 months ago
  const [endDate, setEndDate] = useState<Date>(endOfMonth(currentDate)); // today
  
  // Filter transactions based on date range
  const filterTransactionsByDateRange = (transactions: Transaction[], start: Date, end: Date): Transaction[] => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return isWithinInterval(transactionDate, { start, end });
    });
  };
  
  // Filtered transactions based on date range
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  
  // Update filtered transactions when date range or transactions change
  useEffect(() => {
    const filtered = filterTransactionsByDateRange(transactions, startDate, endDate);
    setFilteredTransactions(filtered);
  }, [transactions, startDate, endDate]);
  
  // Group transactions by month
  const groupedByMonth = groupTransactionsByMonth(filteredTransactions);
  
  // Calculate monthly totals
  const monthlyTotals = calculateMonthlySpending(groupedByMonth);
  
  // Get category totals across all months
  const categoryTotals = calculateCategoryTotals(filteredTransactions);
  
  // Sort categories by total amount (descending)
  const sortedCategories = Object.entries(categoryTotals)
    .filter(([category]) => category !== 'Income' && category !== 'Transfer') // Exclude income and transfers
    .sort((a, b) => b[1] - a[1]);
  
  // Calculate total spending
  const totalSpending = sortedCategories.reduce((total, [_, amount]) => total + amount, 0);
  
  // Handle date range change
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setStartDate(new Date(e.target.value));
    }
  };
  
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setEndDate(new Date(e.target.value));
    }
  };

  // Prepare data for category distribution chart (doughnut)
  const categoryChartData = {
    labels: Object.keys(categoryTotals).filter(
      category => category !== 'Income' && category !== 'Transfer'
    ),
    datasets: [
      {
        data: Object.entries(categoryTotals)
          .filter(([category]) => category !== 'Income' && category !== 'Transfer')
          .map(([_, amount]) => amount),
        backgroundColor: Object.entries(categoryTotals)
          .filter(([category]) => category !== 'Income' && category !== 'Transfer')
          .map(([category]) => categoryColors[category] || categoryColors.Other),
        borderWidth: 1,
      },
    ],
  };
  
  // Prepare data for monthly spending trend chart (line)
  const monthlySpendingChartData = {
    labels: Object.keys(monthlyTotals),
    datasets: [
      {
        label: 'Monthly Spending',
        data: Object.values(monthlyTotals),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3,
      },
    ],
  };

  // Prepare data for category comparison by month (bar)
  const months = Object.keys(groupedByMonth);
  const mainCategories = Object.entries(categoryTotals)
    .filter(([category, amount]) => 
      category !== 'Income' && 
      category !== 'Transfer' && 
      amount > 0
    )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5) // Take top 5 categories
    .map(([category]) => category);
  
  const categoryByMonthData = {
    labels: months,
    datasets: mainCategories.map((category) => {
      const color = categoryColors[category] || categoryColors.Other;
      return {
        label: category,
        data: months.map(month => {
          const monthTransactions = groupedByMonth[month] || [];
          return monthTransactions
            .filter(t => t.category === category && t.amount < 0)
            .reduce((total, t) => total + Math.abs(t.amount), 0);
        }),
        backgroundColor: color,
      };
    }),
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        
        {/* Date range filter */}
        <div className="mt-3 md:mt-0 flex flex-col sm:flex-row gap-3 bg-gray-50 p-3 rounded-lg">
          <div className="flex flex-col">
            <label htmlFor="start-date" className="text-xs text-gray-600 mb-1">Start Date</label>
            <input 
              type="date" 
              id="start-date"
              value={format(startDate, 'yyyy-MM-dd')} 
              onChange={handleStartDateChange}
              className="px-2 py-1 border rounded text-sm" 
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="end-date" className="text-xs text-gray-600 mb-1">End Date</label>
            <input 
              type="date" 
              id="end-date"
              value={format(endDate, 'yyyy-MM-dd')} 
              onChange={handleEndDateChange}
              className="px-2 py-1 border rounded text-sm" 
            />
          </div>
        </div>
      </div>
      
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

      {/* Charts Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-6">Spending Analysis</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Spending Trend */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Monthly Spending Trend</h3>
            <div className="h-64">
              <Line 
                data={monthlySpendingChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return '€' + value;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
          
          {/* Category Distribution */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Spending by Category</h3>
            <div className="h-64 flex justify-center">
              <div style={{ maxWidth: '300px' }}>
                <Doughnut 
                  data={categoryChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          boxWidth: 12
                        }
                      }
                    },
                    cutout: '65%'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Category Comparison by Month */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">Top Categories by Month</h3>
          <div className="h-80">
            <Bar 
              data={categoryByMonthData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                          label += ': ';
                        }
                        if (context.parsed.y !== null) {
                          label += '€' + context.parsed.y.toFixed(2);
                        }
                        return label;
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    stacked: false,
                  },
                  y: {
                    stacked: false,
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '€' + value;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

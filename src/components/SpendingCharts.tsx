import React from 'react';
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
import { Transaction } from '@/types';
import { 
  groupTransactionsByMonth, 
  calculateMonthlySpending,
  getLastThreeMonthsTransactions 
} from '@/utils/csvParser';
import { calculateCategoryTotals, categoryColors } from '@/utils/categorization';

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

interface SpendingChartsProps {
  transactions: Transaction[];
}

const SpendingCharts: React.FC<SpendingChartsProps> = ({ transactions }) => {
  // Get transactions from the last three months
  const recentTransactions = getLastThreeMonthsTransactions(transactions);
  
  // Group transactions by month
  const groupedByMonth = groupTransactionsByMonth(recentTransactions);
  
  // Calculate monthly totals
  const monthlyTotals = calculateMonthlySpending(groupedByMonth);
  
  // Get category totals across all months
  const categoryTotals = calculateCategoryTotals(recentTransactions);
  
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
          const categoryTotal = monthTransactions
            .filter(t => t.category === category && t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
          return categoryTotal;
        }),
        backgroundColor: color,
      };
    }),
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6">Spending Visualization</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution Chart */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-4 text-center">Spending by Category</h3>
          <div className="h-64 md:h-80">
            <Doughnut 
              data={categoryChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      boxWidth: 12,
                      font: {
                        size: 10
                      }
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
        
        {/* Monthly Spending Trend Chart */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-4 text-center">Monthly Spending Trend</h3>
          <div className="h-64 md:h-80">
            <Line 
              data={monthlySpendingChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '€' + value;
                      }
                    }
                  }
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return '€' + context.parsed.y;
                      }
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
        
        {/* Category Comparison by Month Chart */}
        <div className="p-4 bg-gray-50 rounded-lg lg:col-span-2">
          <h3 className="text-lg font-medium mb-4 text-center">Top Categories by Month</h3>
          <div className="h-80">
            <Bar 
              data={categoryByMonthData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    stacked: false,
                  },
                  y: {
                    stacked: false,
                    ticks: {
                      callback: function(value) {
                        return '€' + value;
                      }
                    }
                  }
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return context.dataset.label + ': €' + context.parsed.y;
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

export default SpendingCharts;

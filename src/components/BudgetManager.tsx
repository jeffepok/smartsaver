import React, { useState, useEffect } from 'react';
import { Budget, Transaction } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { checkBudgetsAndGenerateAlerts, getCurrentMonthlySpending } from '@/utils/budgetUtils';

interface BudgetManagerProps {
  transactions: Transaction[];
  budgets: Budget[];
  onAddBudget: (budget: Budget) => Promise<Budget | null>;
  onUpdateBudget: (budget: Budget) => Promise<Budget | null>;
  onDeleteBudget: (budgetId: string) => Promise<void>;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ transactions, budgets, onAddBudget, onUpdateBudget, onDeleteBudget }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [categorySpending, setCategorySpending] = useState<Record<string, number>>({}); // Track current spending per category

  // Common categories for quick selection
  const commonCategories = [
    'Food & Dining', 
    'Shopping', 
    'Entertainment', 
    'Transportation', 
    'Utilities', 
    'Subscriptions', 
    'Other'
  ];

  // Generate alerts and calculate spending when budgets or transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      // Get current spending per category
      const spending = getCurrentMonthlySpending(transactions);
      setCategorySpending(spending);
      
      // Generate alerts if we have budgets
      if (budgets.length > 0) {
        const budgetAlerts = checkBudgetsAndGenerateAlerts(budgets, transactions);
        setAlerts(budgetAlerts.map(alert => alert.message));
      }
    }
  }, [budgets, transactions]);

  // Handle form submit to add/edit budget
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !amount || isNaN(parseFloat(amount))) {
      return;
    }

    const budgetAmount = parseFloat(amount);
    const now = new Date();
    
    if (editingBudgetId) {
      // Edit existing budget
      const existingBudget = budgets.find(b => b.id === editingBudgetId);
      if (!existingBudget) return;
      
      const updatedBudget = {
        ...existingBudget,
        category,
        amount: budgetAmount,
        period,
        lastUpdated: format(now, 'yyyy-MM-dd')
      };
      
      // Call API to update budget
      await onUpdateBudget(updatedBudget);
    } else {
      // Add new budget
      const newBudget: Budget = {
        id: uuidv4(), // This ID will be replaced by the one generated in the backend
        category,
        amount: budgetAmount,
        period,
        createdAt: format(now, 'yyyy-MM-dd'),
        lastUpdated: format(now, 'yyyy-MM-dd')
      };
      
      // Call API to add budget
      await onAddBudget(newBudget);
    }
    
    // Reset form
    resetForm();
  };

  // Reset the form
  const resetForm = () => {
    setCategory('');
    setAmount('');
    setPeriod('monthly');
    setEditingBudgetId(null);
    setShowAddForm(false);
  };

  // Start editing a budget
  const startEditing = (budget: Budget) => {
    setEditingBudgetId(budget.id);
    setCategory(budget.category);
    setAmount(budget.amount.toString());
    setPeriod(budget.period);
    setShowAddForm(true);
  };

  // Delete a budget
  const deleteBudget = async (budgetId: string) => {
    // Call API to delete budget
    await onDeleteBudget(budgetId);
  };
  
  // Helper function to calculate budget usage percentage
  const getBudgetUsage = (budget: Budget): { used: number, percentage: number, remaining: number } => {
    const spent = categorySpending[budget.category] || 0;
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    const remaining = Math.max(0, budget.amount - spent);
    
    return {
      used: spent,
      percentage: Math.min(100, percentage), // Cap at 100%
      remaining
    };
  };
  
  // Get color based on usage percentage
  const getColorForPercentage = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500'; // Over 90% - red
    if (percentage >= 75) return 'bg-yellow-500'; // 75-90% - yellow
    if (percentage >= 50) return 'bg-blue-500'; // 50-75% - blue
    return 'bg-green-500'; // Under 50% - green
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Budget Manager</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? 'Cancel' : '+ Add Budget'}
        </button>
      </div>
      
      {/* Budget alerts */}
      {alerts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Budget Alerts</h3>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <ul className="list-disc pl-5 space-y-1">
              {alerts.map((alert, index) => (
                <li key={index} className="text-yellow-700">{alert}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Budget form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a category</option>
                {commonCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as 'monthly' | 'weekly' | 'yearly')}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="mr-2 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {editingBudgetId ? 'Update Budget' : 'Add Budget'}
            </button>
          </div>
        </form>
      )}
      
      {/* Budgets list */}
      <div>
        {budgets.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No budgets created yet. Add your first budget to start tracking your spending.
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <h3 className="text-lg font-medium mb-2">Your Budgets</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {budgets.map((budget) => {
                    const usage = getBudgetUsage(budget);
                    const colorClass = getColorForPercentage(usage.percentage);
                    
                    return (
                      <tr key={budget.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {budget.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {budget.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex flex-col space-y-2">
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-500">
                                {usage.used.toFixed(2)} / {budget.amount.toFixed(2)}
                              </span>
                              <span className="text-xs font-medium" style={{ 
                                color: usage.percentage >= 90 ? 'rgb(220, 38, 38)' : 
                                       usage.percentage >= 75 ? 'rgb(202, 138, 4)' : 'rgb(75, 85, 99)' 
                              }}>
                                {usage.percentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className={`${colorClass} h-1.5 rounded-full`} 
                                style={{ width: `${usage.percentage}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {usage.remaining.toFixed(2)} remaining
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => startEditing(budget)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteBudget(budget.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetManager;

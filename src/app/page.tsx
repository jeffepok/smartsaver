"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CSVUploader from '@/components/CSVUploader';
import TransactionsList from '@/components/TransactionsList';
import Dashboard from '@/components/ExpenseSummary';
import SavingsGoals from '@/components/SavingsGoals';
import SavingsRecommendations from '@/components/SavingsRecommendations';
import BudgetManager from '@/components/BudgetManager';
import ExportOptions from '@/components/ExportOptions';
import FinanceAssistant from '@/components/FinanceAssistant';
import WhatsAppSettings from '@/components/WhatsAppSettings';
import UserAvatar from '@/components/UserAvatar';
import { Transaction, SavingsGoal, Budget, BudgetAlert } from '@/types';
import { fetchSavingsGoals, createSavingsGoal, updateSavingsGoal, deleteSavingsGoal } from '@/services/savingsGoalsService';
import { FaChartPie, FaList, FaBullseye, FaLightbulb, FaWallet, FaBell } from 'react-icons/fa';
import { generateSavingsRecommendations } from '@/utils/savingsAnalyzer';

export default function Home() {
  // State for transactions data
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // State for savings goals
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);

  // State for budgets
  const [budgets, setBudgets] = useState<Budget[]>([]);

  // State for active tab
  const [activeTab, setActiveTab] = useState<string>('summary');

  const router = useRouter();

  // Load data from API on component mount
  useEffect(() => {
    // Fetch transactions from the API
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/transactions');

        if (!response.ok) {
          // If unauthorized, don't throw error as middleware will handle redirect
          if (response.status === 401) return;
          throw new Error('Failed to fetch transactions');
        }

        const data = await response.json();
        if (data.transactions && data.transactions.length > 0) {
          setTransactions(data.transactions);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    // Fetch savings goals from the API using our service
    const loadSavingsGoals = async () => {
      try {
        const goals = await fetchSavingsGoals();
        setSavingsGoals(goals);
      } catch (error) {
        console.error('Error fetching savings goals:', error);
      }
    };

    // Fetch budgets from the API
    const fetchBudgets = async () => {
      try {
        const response = await fetch('/api/budgets');

        if (!response.ok) {
          if (response.status === 401) return;
          throw new Error('Failed to fetch budgets');
        }

        const data = await response.json();
        if (data.budgets) {
          setBudgets(data.budgets);
        }
      } catch (error) {
        console.error('Error fetching budgets:', error);
      }
    };

    fetchTransactions();
    loadSavingsGoals();
    fetchBudgets();
  }, []);

  // Function to refresh transactions from the API
  const refreshTransactions = async () => {
    try {
      // Fetch fresh transaction data from the API
      const response = await fetch('/api/transactions');
      
      if (!response.ok) {
        if (response.status === 401) return;
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      if (data.transactions && data.transactions.length > 0) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  // Handle data loaded from CSV
  const handleDataLoaded = async () => {
    await refreshTransactions();
  };

  // Handle adding a new savings goal
  const handleAddSavingsGoal = async (newGoal: SavingsGoal) => {
    try {
      const createdGoal = await createSavingsGoal(newGoal);
      setSavingsGoals([...savingsGoals, createdGoal]);
    } catch (error) {
      console.error('Error adding savings goal:', error);
    }
  };

  // Handle updating a savings goal
  const handleUpdateSavingsGoal = async (updatedGoal: SavingsGoal) => {
    try {
      await updateSavingsGoal(updatedGoal);
      setSavingsGoals(savingsGoals.map(goal =>
        goal.id === updatedGoal.id ? updatedGoal : goal
      ));
    } catch (error) {
      console.error('Error updating savings goal:', error);
    }
  };

  // Handle deleting a savings goal
  const handleDeleteSavingsGoal = async (goalId: string) => {
    try {
      await deleteSavingsGoal(goalId);
      setSavingsGoals(savingsGoals.filter(goal => goal.id !== goalId));
    } catch (error) {
      console.error('Error deleting savings goal:', error);
    }
  };

  // Handle adding a budget
  const handleAddBudget = async (budget: Budget) => {
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budget)
      });

      if (!response.ok) {
        throw new Error('Failed to add budget');
      }

      const data = await response.json();
      const savedBudget = data.budget;
      const updatedBudgets = [...budgets, savedBudget];
      setBudgets(updatedBudgets);
      return savedBudget;
    } catch (error) {
      console.error('Error adding budget:', error);
      return null;
    }
  };

  // Handle updating a budget
  const handleUpdateBudget = async (updatedBudget: Budget) => {
    try {
      const response = await fetch(`/api/budgets/${updatedBudget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBudget)
      });

      if (!response.ok) {
        throw new Error('Failed to update budget');
      }

      const updatedBudgets = budgets.map((budget) =>
        budget.id === updatedBudget.id ? updatedBudget : budget
      );
      setBudgets(updatedBudgets);
      return updatedBudget;
    } catch (error) {
      console.error('Error updating budget:', error);
      return null;
    }
  };

  // Handle deleting a budget
  const handleDeleteBudget = async (budgetId: string) => {
    try {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete budget');
      }

      const updatedBudgets = budgets.filter((budget) => budget.id !== budgetId);
      setBudgets(updatedBudgets);
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    if (transactions.length === 0) {
      return <CSVUploader onDataLoaded={handleDataLoaded} />;
    }

    switch (activeTab) {
      case 'summary':
        return <Dashboard transactions={transactions} />;
      case 'transactions':
        return <TransactionsList transactions={transactions} onRefreshTransactions={refreshTransactions} />;
      case 'charts':
        return <Dashboard transactions={transactions} />; // Show dashboard instead since charts are integrated
      case 'goals':
        return (
          <SavingsGoals
            goals={savingsGoals}
            onAddGoal={handleAddSavingsGoal}
            onUpdateGoal={handleUpdateSavingsGoal}
            onDeleteGoal={handleDeleteSavingsGoal}
          />
        );
      case 'budget':
        return (
          <BudgetManager
            transactions={transactions}
            budgets={budgets}
            onAddBudget={handleAddBudget}
            onUpdateBudget={handleUpdateBudget}
            onDeleteBudget={handleDeleteBudget}
          />
        );
      case 'recommendations':
        return <SavingsRecommendations transactions={transactions} />;
      case 'notifications':
        return (
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="text-2xl font-bold mb-4">Notification Settings</h2>
            <WhatsAppSettings />
          </div>
        );
      default:
        return <Dashboard transactions={transactions} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold mb-2 md:mb-0">
            SmartSave
            <span className="text-sm font-normal ml-2">Financial Assistant</span>
          </h1>

          <UserAvatar />

          <div className="flex items-center space-x-3">
            {transactions.length > 0 && (
              <>
                <ExportOptions
                  transactions={transactions}
                  savingsGoals={savingsGoals}
                  recommendations={generateSavingsRecommendations(transactions)}
                />

                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/reset', {
                        method: 'POST'
                      });

                      if (!response.ok) {
                        throw new Error('Failed to reset data');
                      }

                      setTransactions([]);
                      setSavingsGoals([]);
                      setBudgets([]);
                    } catch (error) {
                      console.error('Error resetting data:', error);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-800 transition-colors text-sm"
                >
                  Reset & Upload New Data
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 flex-grow">
        {transactions.length > 0 && (
          <nav className="mb-6">
            <div className="flex overflow-x-auto space-x-1 border-b border-gray-200 min-w-max">
              <button
                onClick={() => setActiveTab('summary')}
                className={`flex items-center px-4 py-3 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'summary'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FaChartPie className="mr-2" />
                Expense Summary
              </button>

              <button
                onClick={() => setActiveTab('transactions')}
                className={`flex items-center px-4 py-3 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'transactions'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FaList className="mr-2" />
                Transactions
              </button>

              <button
                onClick={() => setActiveTab('goals')}
                className={`flex items-center px-4 py-3 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'goals'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FaBullseye className="mr-2" />
                Savings Goals
              </button>

              <button
                onClick={() => setActiveTab('budget')}
                className={`flex items-center px-4 py-3 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'budget'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FaWallet className="mr-2" />
                Budget Manager
              </button>

              <button
                onClick={() => setActiveTab('recommendations')}
                className={`flex items-center px-4 py-3 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'recommendations'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FaLightbulb className="mr-2" />
                Smart Recommendations
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center px-4 py-3 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'notifications'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FaBell className="mr-2" />
                Notification Settings
              </button>
            </div>
          </nav>
        )}

        {renderTabContent()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} SmartSave Financial Assistant</p>
          <p className="mt-1">A Next.js application for financial insights and savings recommendations</p>
        </div>
      </footer>

      {/* Finance Assistant Chatbot */}
      <FinanceAssistant
        transactions={transactions}
        budgets={budgets}
        savingsGoals={savingsGoals}
      />
    </div>
  );
}

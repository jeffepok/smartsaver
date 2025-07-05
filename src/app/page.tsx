"use client";

import React, { useState, useEffect } from 'react';
import CSVUploader from '@/components/CSVUploader';
import TransactionsList from '@/components/TransactionsList';
import ExpenseSummary from '@/components/ExpenseSummary';
import SpendingCharts from '@/components/SpendingCharts';
import SavingsGoals from '@/components/SavingsGoals';
import SavingsRecommendations from '@/components/SavingsRecommendations';
import BudgetManager from '@/components/BudgetManager';
import { Transaction, SavingsGoal, Budget } from '@/types';
import { categorizeTransaction } from '@/utils/categorization';

import { saveTransactions, loadTransactions, saveSavingsGoals, loadSavingsGoals, saveBudgets, loadBudgets, clearStoredData } from '@/utils/storage';
import { FaChartPie, FaList, FaChartLine, FaBullseye, FaLightbulb, FaWallet } from 'react-icons/fa';
import ExportOptions from '@/components/ExportOptions';
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
  
  // Load stored data on component mount
  useEffect(() => {
    const storedTransactions = loadTransactions();
    const storedGoals = loadSavingsGoals();
    const storedBudgets = loadBudgets();
    
    if (storedTransactions.length > 0) {
      setTransactions(storedTransactions);
    }
    
    if (storedGoals.length > 0) {
      setSavingsGoals(storedGoals);
    }
    
    if (storedBudgets.length > 0) {
      setBudgets(storedBudgets);
    }
  }, []);
  
  // Handle data loaded from CSV
  const handleDataLoaded = (data: Transaction[]) => {
    setTransactions(data);
    saveTransactions(data);
  };
  
  // Handle adding a new savings goal
  const handleAddGoal = (goal: SavingsGoal) => {
    const updatedGoals = [...savingsGoals, goal];
    setSavingsGoals(updatedGoals);
    saveSavingsGoals(updatedGoals);
  };
  
  // Handle updating a savings goal
  const handleUpdateGoal = (updatedGoal: SavingsGoal) => {
    const updatedGoals = savingsGoals.map((goal) => 
      goal.id === updatedGoal.id ? updatedGoal : goal
    );
    setSavingsGoals(updatedGoals);
    saveSavingsGoals(updatedGoals);
  };
  
  // Handle deleting a savings goal
  const handleDeleteGoal = (goalId: string) => {
    const updatedGoals = savingsGoals.filter((goal) => goal.id !== goalId);
    setSavingsGoals(updatedGoals);
    saveSavingsGoals(updatedGoals);
  };
  
  // Render tab content based on active tab
  const renderTabContent = () => {
    if (transactions.length === 0) {
      return <CSVUploader onDataLoaded={handleDataLoaded} />;
    }
    
    switch (activeTab) {
      case 'summary':
        return <ExpenseSummary transactions={transactions} />;
      case 'transactions':
        return <TransactionsList transactions={transactions} />;
      case 'charts':
        return <SpendingCharts transactions={transactions} />;
      case 'goals':
        return (
          <SavingsGoals
            goals={savingsGoals}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
          />
        );
      case 'budget':
        return (
          <BudgetManager 
            transactions={transactions}
            budgets={budgets}
            onBudgetChange={setBudgets}
          />
        );
      case 'recommendations':
        return <SavingsRecommendations transactions={transactions} />;
      default:
        return <ExpenseSummary transactions={transactions} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold mb-2 md:mb-0">
            SmartSave
            <span className="text-sm font-normal ml-2">Financial Assistant</span>
          </h1>
          
          <div className="flex items-center space-x-3">
            {transactions.length > 0 && (
              <>
                <ExportOptions 
                  transactions={transactions}
                  savingsGoals={savingsGoals}
                  recommendations={generateSavingsRecommendations(transactions)}
                />
                
                <button
                  onClick={() => {
                    setTransactions([]);
                    setSavingsGoals([]);
                    setBudgets([]);
                    clearStoredData();
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

      <main className="container mx-auto py-6 px-4">
        {transactions.length > 0 && (
          <nav className="mb-6 overflow-x-auto">
            <div className="flex space-x-2 border-b border-gray-200 min-w-max">
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
                onClick={() => setActiveTab('charts')}
                className={`flex items-center px-4 py-3 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'charts'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FaChartLine className="mr-2" />
                Spending Charts
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
            </div>
          </nav>
        )}

        {renderTabContent()}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-4 mt-12">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} SmartSave Financial Assistant</p>
          <p className="mt-1">A Next.js application for financial insights and savings recommendations</p>
        </div>
      </footer>
    </div>
  );
}

import React, { useState } from 'react';
import { SavingsGoal } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { FaPiggyBank } from 'react-icons/fa';

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  onAddGoal: (goal: SavingsGoal) => void;
  onUpdateGoal: (updatedGoal: SavingsGoal) => void;
  onDeleteGoal: (goalId: string) => void;
}

const SavingsGoals: React.FC<SavingsGoalsProps> = ({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal
}) => {
    console.log(goals);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  // Deposit functionality
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositGoalName, setDepositGoalName] = useState('');

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const goalData = {
      id: editingGoalId || uuidv4(),
      name,
      target_amount: parseFloat(targetAmount),
      current_amount: parseFloat(currentAmount) || 0,
      targetDate,
      createdAt: editingGoalId
        ? goals.find(g => g.id === editingGoalId)?.createdAt || format(new Date(), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd')
    };

    if (editingGoalId) {
      onUpdateGoal(goalData);
    } else {
      onAddGoal(goalData);
    }

    // Reset form
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate('');
    setEditingGoalId(null);
    setShowAddForm(false);
  };

  // Start editing a goal
  const startEditing = (goal: SavingsGoal) => {
    setEditingGoalId(goal.id);
    setName(goal.name);
    setTargetAmount(goal.target_amount.toString());
    setCurrentAmount(goal.current_amount.toString());
    setTargetDate(goal.targetDate);
    setShowAddForm(true);
  };

  // Open deposit modal
  const openDepositModal = (goal: SavingsGoal) => {
    setDepositGoalId(goal.id);
    setDepositGoalName(goal.name);
    setDepositAmount('');
    setShowDepositModal(true);
  };

  // Handle deposit submission
  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!depositGoalId || !depositAmount || isNaN(parseFloat(depositAmount)) || parseFloat(depositAmount) <= 0) {
      return;
    }

    const goal = goals.find(g => g.id === depositGoalId);
    if (!goal) return;

    const updatedGoal = {
      ...goal,
      current_amount: goal.current_amount + parseFloat(depositAmount)
    };

    onUpdateGoal(updatedGoal);
    setShowDepositModal(false);
  };

  // Calculate progress percentage
  const calculateProgress = (current: number, target: number): number => {
    if (target === 0) return 0;
    const progress = (current / target) * 100;
    return Math.min(progress, 100); // Cap at 100%
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Savings Goals</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? 'Cancel' : '+ Add New Goal'}
        </button>
      </div>

      {/* Add/Edit goal form */}
      {showAddForm && (
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-medium mb-4">
            {editingGoalId ? 'Edit Savings Goal' : 'Add New Savings Goal'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="goal-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Name
                </label>
                <input
                  id="goal-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Vacation Fund, Emergency Fund"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="target-amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Target Amount (€)
                </label>
                <input
                  id="target-amount"
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  required
                  min="1"
                  step="0.01"
                  placeholder="5000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="current-amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Amount (€)
                </label>
                <input
                  id="current-amount"
                  type="number"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="target-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Target Date
                </label>
                <input
                  id="target-date"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                {editingGoalId ? 'Update Goal' : 'Add Goal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List of goals */}
      {goals && goals.length > 0 ? (
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = calculateProgress(goal.current_amount, goal.target_amount);
            const remaining = goal.target_amount - goal.current_amount;

            return (
              <div key={goal.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium">{goal.name}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openDepositModal(goal)}
                      className="text-green-600 hover:text-green-800 flex items-center"
                    >
                      <FaPiggyBank className="mr-1" /> Deposit
                    </button>
                    <button
                      onClick={() => startEditing(goal)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="flex items-center mb-2">
                  <div className="text-lg font-bold">
                    €{goal.current_amount.toFixed(2)} / €{goal.target_amount.toFixed(2)}
                  </div>
                  <div className="ml-2 text-sm text-gray-600">
                    (€{remaining.toFixed(2)} remaining)
                  </div>
                </div>

                <div className="mb-2 text-sm text-gray-600">
                  Target date: {new Date(goal.target_date).toLocaleDateString()}
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                <div className="mt-1 text-sm text-gray-600">
                  {progress.toFixed(1)}% complete
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No savings goals set yet. Click "Add New Goal" to get started.
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Deposit to {depositGoalName}</h3>
            <form onSubmit={handleDepositSubmit}>
              <div className="mb-4">
                <label htmlFor="deposit-amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount to Deposit (€)
                </label>
                <input
                  id="deposit-amount"
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter amount"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsGoals;

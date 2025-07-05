import { SavingsGoal } from '@/types';

// Fetch all savings goals
export const fetchSavingsGoals = async (): Promise<SavingsGoal[]> => {
  try {
    const response = await fetch('/api/savings-goals', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for authentication cookies
    });

    if (!response.ok) {
      throw new Error('Failed to fetch savings goals');
    }

    const data = await response.json();
    return data.savingsGoals;
  } catch (error) {
    console.error('Error fetching savings goals:', error);
    throw error;
  }
};

// Create a new savings goal
export const createSavingsGoal = async (goal: Omit<SavingsGoal, 'id' | 'createdAt'>): Promise<SavingsGoal> => {
  try {
    console.log(goal);
    const response = await fetch('/api/savings-goals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(goal),
    });

    console.log(response);

    if (!response.ok) {
      throw new Error(`Failed to create savings goal: ${response.statusText}`);
    }

    const data = await response.json();
    return data.goal;
  } catch (error) {
    console.error('Error creating savings goal:', error);
    throw error;
  }
};

// Update an existing savings goal
export const updateSavingsGoal = async (goal: SavingsGoal): Promise<SavingsGoal> => {
  try {
    const response = await fetch(`/api/savings-goals/${goal.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(goal),
    });

    if (!response.ok) {
      throw new Error('Failed to update savings goal');
    }

    const data = await response.json();
    return data.goal;
  } catch (error) {
    console.error('Error updating savings goal:', error);
    throw error;
  }
};

// Delete a savings goal
export const deleteSavingsGoal = async (goalId: string): Promise<void> => {
  try {
    const response = await fetch(`/api/savings-goals/${goalId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete savings goal');
    }
  } catch (error) {
    console.error('Error deleting savings goal:', error);
    throw error;
  }
};

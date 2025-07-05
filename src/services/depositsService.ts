import { Deposit } from '@/types';

/**
 * Fetches deposits for a specific savings goal or all user deposits
 * @param savingsGoalId Optional ID of the savings goal to filter deposits
 * @param limit Optional maximum number of deposits to return
 * @returns Promise with the deposits array
 */
export async function getDeposits(savingsGoalId?: string, limit?: number): Promise<Deposit[]> {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (savingsGoalId) {
      params.append('savings_goal_id', savingsGoalId);
    }
    if (limit) {
      params.append('limit', limit.toString());
    }

    // Make API request
    const response = await fetch(`/api/deposits?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching deposits: ${response.statusText}`);
    }

    const data = await response.json();
    return data.deposits;
  } catch (error) {
    console.error('Failed to fetch deposits:', error);
    return [];
  }
}

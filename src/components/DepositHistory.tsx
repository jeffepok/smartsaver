import React, { useEffect, useState } from 'react';
import { Deposit } from '@/types';
import { getDeposits } from '@/services/depositsService';
import { format, parseISO } from 'date-fns';
import { FaCoins, FaSpinner } from 'react-icons/fa';

interface DepositHistoryProps {
  savingsGoalId?: string;
  limit?: number;
  refreshTrigger?: number; // A value that changes to trigger a refresh
}

const DepositHistory: React.FC<DepositHistoryProps> = ({
  savingsGoalId,
  limit = 5,
  refreshTrigger = 0
}) => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDeposits() {
      setIsLoading(true);
      setError('');

      try {
        const depositsData = await getDeposits(savingsGoalId, limit);
        setDeposits(depositsData);
      } catch (err) {
        setError('Failed to load deposit history');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDeposits();
  }, [savingsGoalId, limit, refreshTrigger]); // Include refreshTrigger to refetch when it changes

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <FaSpinner className="animate-spin text-blue-600 mr-2" />
        <span>Loading deposits...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 py-2">{error}</div>;
  }

  if (deposits.length === 0) {
    return (
      <div className="text-gray-500 py-2 text-center">
        No deposit history available.
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h4 className="font-medium mb-2 text-sm text-gray-700">Recent Deposits</h4>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {deposits.map((deposit) => (
          <div
            key={deposit.id}
            className="bg-gray-50 p-3 rounded-md border-l-4 border-green-500 flex items-center justify-between"
          >
            <div className="flex items-center">
              <FaCoins className="text-green-500 mr-2" />
              <div>
                <p className="font-medium">€{deposit.amount.toFixed(2)}</p>
                <p className="text-xs text-gray-600">{deposit.description}</p>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {format(parseISO(deposit.created_at), 'MMM d, yyyy')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepositHistory;

import React, { useState } from 'react';
import { Transaction, SavingsGoal, SavingsRecommendation } from '@/types';
import { 
  exportTransactionsToCSV, 
  exportSavingsGoalsToCSV, 
  exportRecommendationsToCSV,
  exportSummaryReport 
} from '@/utils/exportUtils';
import { FaFileExport, FaFileDownload, FaFileCsv, FaFileAlt } from 'react-icons/fa';

interface ExportOptionsProps {
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  recommendations: SavingsRecommendation[];
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ 
  transactions, 
  savingsGoals, 
  recommendations 
}) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <FaFileExport className="mr-2" />
        Export Data
      </button>

      {showOptions && (
        <div className="absolute top-full left-0 mt-2 w-64 p-4 bg-white shadow-lg rounded-lg z-10">
          <h3 className="font-medium mb-3 text-gray-700">Export Options</h3>
          
          <div className="space-y-2">
            <button
              onClick={() => exportTransactionsToCSV(transactions)}
              disabled={transactions.length === 0}
              className={`flex items-center w-full px-3 py-2 text-left text-sm rounded-md ${
                transactions.length > 0
                  ? 'bg-gray-100 hover:bg-gray-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <FaFileCsv className="mr-2 text-green-600" />
              Export Transactions (CSV)
            </button>
            
            <button
              onClick={() => exportSavingsGoalsToCSV(savingsGoals)}
              disabled={savingsGoals.length === 0}
              className={`flex items-center w-full px-3 py-2 text-left text-sm rounded-md ${
                savingsGoals.length > 0
                  ? 'bg-gray-100 hover:bg-gray-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <FaFileCsv className="mr-2 text-blue-600" />
              Export Savings Goals (CSV)
            </button>
            
            <button
              onClick={() => exportRecommendationsToCSV(recommendations)}
              disabled={recommendations.length === 0}
              className={`flex items-center w-full px-3 py-2 text-left text-sm rounded-md ${
                recommendations.length > 0
                  ? 'bg-gray-100 hover:bg-gray-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <FaFileCsv className="mr-2 text-purple-600" />
              Export Recommendations (CSV)
            </button>
            
            <div className="border-t border-gray-200 my-2"></div>
            
            <button
              onClick={() => exportSummaryReport(transactions, savingsGoals, recommendations)}
              disabled={transactions.length === 0}
              className={`flex items-center w-full px-3 py-2 text-left text-sm rounded-md ${
                transactions.length > 0
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <FaFileAlt className="mr-2" />
              Generate Summary Report
            </button>
          </div>
          
          <div className="text-xs text-gray-500 mt-3">
            Files will be downloaded to your device
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportOptions;

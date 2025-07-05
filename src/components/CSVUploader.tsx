import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Transaction } from '@/types';
import { categorizeTransaction } from '@/utils/categorization';
import { v4 as uuidv4 } from 'uuid';

interface CSVUploaderProps {
  onDataLoaded: (data: Transaction[]) => void;
}

const CSVUploader: React.FC<CSVUploaderProps> = ({ onDataLoaded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const setIsLoading = (isLoading: boolean) => {
    setLoading(isLoading);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    setError('');
    const file = e.target.files?.[0];

    if (file) {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          try {
            const parsedData = processCSVData(results.data as Record<string, string>[]);
            
            // Create a FormData object for the file upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('transactions', JSON.stringify(parsedData));
            
            // Upload to the API
            const response = await fetch('/api/csv/upload', {
              method: 'POST',
              body: formData,
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to upload CSV');
            }
            
            // Still call the onDataLoaded callback for local state updates
            onDataLoaded(parsedData);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Error processing CSV data. Please check the file format.');
          } finally {
            setIsLoading(false);
          }
        },
        error: () => {
          setError('Error parsing CSV file. Please check the file format.');
          setIsLoading(false);
        }
      });
    }
  };

  const processCSVData = (data: Record<string, string>[]): Transaction[] => {
    return data
      .filter(row => {
        // Filter out rows with missing required fields
        return row.date && row.description && row.amount;
      })
      .map(row => {
        // Convert amount to number
        const amount = parseFloat(row.amount.replace(/,/g, ''));
        
        // Create transaction object with UUID
        const transaction: Transaction = {
          id: uuidv4(), // Add unique ID for database storage
          date: row.date,
          description: row.description,
          amount: isNaN(amount) ? 0 : amount,
          type: row.type || '',
          account_number: row.account_number || '',
          currency: row.currency || '€'
        };
        
        // Add category based on description
        return categorizeTransaction(transaction);
      });
  };

  // Function to load sample data from public file
  const loadSampleData = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Fetch sample data from public directory
      const response = await fetch('/sample_data.csv');
      const csvData = await response.text();
      
      Papa.parse(csvData, {
        header: true,
        complete: async (results) => {
          try {
            const parsedData = processCSVData(results.data as Record<string, string>[]);
            
            // Create a file object from the CSV data
            const file = new File([csvData], 'sample_data.csv', { type: 'text/csv' });
            
            // Create a FormData object for the file upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('transactions', JSON.stringify(parsedData));
            
            // Upload to the API
            const uploadResponse = await fetch('/api/csv/upload', {
              method: 'POST',
              body: formData,
            });
            
            if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json();
              throw new Error(errorData.error || 'Failed to upload sample CSV');
            }
            
            // Call the onDataLoaded callback for local state updates
            onDataLoaded(parsedData);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Error processing sample CSV data.');
          } finally {
            setIsLoading(false);
          }
        },
        error: () => {
          setError('Error parsing sample CSV file.');
          setIsLoading(false);
        }
      });
    } catch (err) {
      setError('Failed to load sample data file.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Upload Financial Data</h2>
      <p className="mb-4 text-gray-600">
        Upload a CSV file with your financial data in the following format:
        <code className="block bg-gray-100 p-2 mt-2 text-sm rounded">
          date,description,amount,type,account_number,currency
        </code>
      </p>
      
      <div className="flex flex-col space-y-4">
        <label className="flex flex-col items-center px-4 py-6 bg-blue-50 text-blue-700 rounded-lg border-2 border-blue-300 border-dashed cursor-pointer hover:bg-blue-100">
          <span className="text-base mb-2">Select a CSV file</span>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
            disabled={loading}
          />
          <span className="text-sm text-blue-500">Click to browse</span>
        </label>
        
        <div className="text-center">
          <span className="text-gray-500">or</span>
        </div>
        
        <button
          onClick={loadSampleData}
          disabled={loading}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Use Sample Data
        </button>
      </div>
      
      {loading && (
        <div className="mt-4 text-center text-blue-600">
          Processing data...
        </div>
      )}
      
      {error && (
        <div className="mt-4 text-center text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default CSVUploader;

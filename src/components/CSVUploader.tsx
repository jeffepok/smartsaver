import React, { useState } from 'react';
import { parseCSVData } from '@/utils/csvParser';
import { Transaction } from '@/types';

interface CSVUploaderProps {
  onDataLoaded: (data: Transaction[]) => void;
}

const CSVUploader: React.FC<CSVUploaderProps> = ({ onDataLoaded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Read file content
      const content = await readFileContent(file);
      
      // Parse CSV data
      const parsedData = await parseCSVData(content);
      
      // Pass data to parent component
      onDataLoaded(parsedData);
      
    } catch (err) {
      console.error('Error processing CSV file:', err);
      setError('Failed to process the CSV file. Please ensure it follows the correct format.');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to read file content
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to read file content'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    });
  };
  
  // Function to load sample data (for demo purposes)
  const loadSampleData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Sample CSV data in the required format
      const sampleData = `date,description,amount,type,account_number,currency
2025-06-01,Salary deposit,3500,income,1234567890,EUR
2025-06-05,Rent payment,-1200,expense,1234567890,EUR
2025-06-10,Grocery shopping,-150,expense,1234567890,EUR
2025-06-15,Restaurant dinner,-85,expense,1234567890,EUR
2025-06-20,Amazon purchase,-120,expense,1234567890,EUR
2025-06-25,Uber rides,-45,expense,1234567890,EUR
2025-05-01,Salary deposit,3500,income,1234567890,EUR
2025-05-05,Rent payment,-1200,expense,1234567890,EUR
2025-05-12,Grocery shopping,-180,expense,1234567890,EUR
2025-05-18,Netflix subscription,-15,expense,1234567890,EUR
2025-05-22,Clothing store,-95,expense,1234567890,EUR
2025-05-29,Gas station,-60,expense,1234567890,EUR
2025-04-01,Salary deposit,3500,income,1234567890,EUR
2025-04-05,Rent payment,-1200,expense,1234567890,EUR
2025-04-10,Grocery shopping,-135,expense,1234567890,EUR
2025-04-15,Movie tickets,-30,expense,1234567890,EUR
2025-04-20,Pharmacy,-65,expense,1234567890,EUR
2025-04-25,Electricity bill,-90,expense,1234567890,EUR`;
      
      // Parse sample data
      const parsedData = await parseCSVData(sampleData);
      
      // Pass data to parent component
      onDataLoaded(parsedData);
      
    } catch (err) {
      console.error('Error loading sample data:', err);
      setError('Failed to load sample data.');
    } finally {
      setLoading(false);
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

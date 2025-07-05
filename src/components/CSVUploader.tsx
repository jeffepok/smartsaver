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
  
  // Function to load sample data from public file
  const loadSampleData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch sample data from public directory
      const response = await fetch('/sample_data.csv');
      
      if (!response.ok) {
        throw new Error(`Failed to load sample data: ${response.status}`);
      }
      
      const sampleData = await response.text();
      
      // Parse sample data
      const parsedData = await parseCSVData(sampleData);
      
      // Pass data to parent component
      onDataLoaded(parsedData);
      
    } catch (err) {
      console.error('Error loading sample data:', err);
      setError('Failed to load sample data. Please try again or upload your own CSV file.');
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

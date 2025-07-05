import Papa from 'papaparse';
import { Transaction } from '../types';
import { categorizeTransaction } from './categorization';
import { subMonths, isAfter, parseISO, format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

// Parse CSV data into Transaction objects
export const parseCSVData = (csvData: string): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedTransactions: Transaction[] = results.data.map((row: any) => {
            // Convert amount to number
            const amount = parseFloat(row.amount);

            // Create Transaction object
            const transaction: Transaction = {
              id: uuidv4(), // Add unique ID
              date: row.date,
              description: row.description,
              amount: isNaN(amount) ? 0 : amount,
              type: row.type,
              account_number: row.account_number,
              currency: row.currency,
            };

            // Categorize transaction
            const categorized = categorizeTransaction(transaction);
            return categorized;
          });

          resolve(parsedTransactions);
        } catch (error) {
          reject(error);
        }
      },
      error: (error: any) => {
        reject(error);
      }
    });
  });
};

// Get transactions from the last 3 months
export const getLastThreeMonthsTransactions = (transactions: Transaction[]): Transaction[] => {
  const today = new Date();
  const threeMonthsAgo = subMonths(today, 3);

  return transactions.filter(transaction => {
    const transactionDate = parseISO(transaction.date);
    return isAfter(transactionDate, threeMonthsAgo);
  });
};

// Group transactions by month
export const groupTransactionsByMonth = (transactions: Transaction[]): Record<string, Transaction[]> => {
  const grouped: Record<string, Transaction[]> = {};

  transactions.forEach(transaction => {
    const transactionDate = parseISO(transaction.date);
    const monthKey = format(transactionDate, 'MMM yyyy');

    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }

    grouped[monthKey].push(transaction);
  });

  return grouped;
};

// Calculate total spending by month
export const calculateMonthlySpending = (groupedTransactions: Record<string, Transaction[]>): Record<string, number> => {
  const monthlyTotals: Record<string, number> = {};

  Object.entries(groupedTransactions).forEach(([month, transactions]) => {
    monthlyTotals[month] = transactions.reduce((total, transaction) => {
      // Only include expenses (negative amounts) in the total
      return transaction.amount < 0 ? total + Math.abs(transaction.amount) : total;
    }, 0);
  });

  return monthlyTotals;
};

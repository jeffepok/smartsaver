import React, { useState, useEffect } from 'react';
import { Transaction } from '@/types';
import { format, parseISO } from 'date-fns';
import { categoryColors } from '@/utils/categorization';
import { FaSearch, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

interface TransactionsListProps {
  transactions: Transaction[];
}

const TransactionsList: React.FC<TransactionsListProps> = ({ transactions }) => {
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredResults, setFilteredResults] = useState<Transaction[]>([]);
  
  // Get unique categories from transactions
  const categories = [...new Set(transactions.map(t => t.category || 'Uncategorized'))];
  
  // Apply filtering and searching logic whenever dependencies change
  useEffect(() => {
    // Step 1: Filter by category
    let results = filter === 'all'
      ? transactions
      : transactions.filter(t => t.category === filter);
    
    // Step 2: Apply search filter if there's a search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      results = results.filter(t => 
        t.description.toLowerCase().includes(query) ||
        t.category?.toLowerCase().includes(query) ||
        t.amount.toString().includes(query) ||
        format(parseISO(t.date), 'MMM dd, yyyy').toLowerCase().includes(query)
      );
    }
    
    // Step 3: Sort the filtered results
    results = [...results].sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = parseISO(a.date);
        const dateB = parseISO(b.date);
        return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      } else if (sortBy === 'amount') {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      } else if (sortBy === 'description') {
        return sortOrder === 'asc' 
          ? a.description.localeCompare(b.description)
          : b.description.localeCompare(a.description);
      }
      return 0;
    });
    
    setFilteredResults(results);
  }, [transactions, filter, searchQuery, sortBy, sortOrder]);
  
  // Toggle sort order
  const toggleSort = (field: 'date' | 'amount' | 'description') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };
  
  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6">Transactions</h2>
      
      <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
        {/* Category filter */}
        <div className="mb-4 md:mb-0 md:w-1/3">
          <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Category
          </label>
          <select
            id="category-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        {/* Search box */}
        <div className="mb-4 md:mb-0 md:w-2/3">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Transactions
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
              placeholder="Search by description, category, amount or date..."
            />
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {filteredResults.length} {filteredResults.length === 1 ? 'transaction' : 'transactions'} found
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <button 
              onClick={() => toggleSort('date')} 
              className={`text-sm px-2 py-1 rounded ${sortBy === 'date' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
            >
              Date {sortBy === 'date' && (sortOrder === 'asc' ? <FaSortAmountUp className="inline ml-1" /> : <FaSortAmountDown className="inline ml-1" />)}
            </button>
            <button 
              onClick={() => toggleSort('description')} 
              className={`text-sm px-2 py-1 rounded ${sortBy === 'description' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
            >
              Description {sortBy === 'description' && (sortOrder === 'asc' ? <FaSortAmountUp className="inline ml-1" /> : <FaSortAmountDown className="inline ml-1" />)}
            </button>
            <button 
              onClick={() => toggleSort('amount')} 
              className={`text-sm px-2 py-1 rounded ${sortBy === 'amount' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
            >
              Amount {sortBy === 'amount' && (sortOrder === 'asc' ? <FaSortAmountUp className="inline ml-1" /> : <FaSortAmountDown className="inline ml-1" />)}
            </button>
          </div>
        </div>
      </div>
      
      {/* Transactions table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredResults.map((transaction, index) => (
              <tr key={`${transaction.date}-${transaction.description}-${index}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: categoryColors[transaction.category || 'Other'] || '#95A5A6' }}
                    ></div>
                    <span>{transaction.category || 'Uncategorized'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(parseISO(transaction.date), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.description}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                  transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.currency} {transaction.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredResults.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No transactions found.
        </div>
      )}
    </div>
  );
};

export default TransactionsList;

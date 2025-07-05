import React, { useState, useEffect } from 'react';
import { Transaction } from '@/types';
import { format, parseISO } from 'date-fns';
import { categoryColors } from '@/utils/categorization';
import { FaSearch, FaSortAmountDown, FaSortAmountUp, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface TransactionsListProps {
  transactions: Transaction[];
}

const TransactionsList: React.FC<TransactionsListProps> = ({ transactions }) => {
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredResults, setFilteredResults] = useState<Transaction[]>([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [paginatedResults, setPaginatedResults] = useState<Transaction[]>([]);
  
  // Get unique categories from transactions
  const categories = [...new Set(transactions.map(t => t.category || 'Uncategorized'))];
  
  // Calculate paginated results whenever filteredResults or pagination settings change
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedResults(filteredResults.slice(startIndex, endIndex));
  }, [filteredResults, currentPage, itemsPerPage]);

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
    setCurrentPage(1); // Reset to first page when filters change
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
            {paginatedResults.map((transaction, index) => (
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
      
      {/* Pagination controls */}
      {filteredResults.length > 0 && (
        <div className="mt-4 flex justify-between items-center border-t pt-4">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredResults.length)}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredResults.length)}</span> of{' '}
            <span className="font-medium">{filteredResults.length}</span> results
          </div>
          
          <div className="flex items-center space-x-2">
            <select 
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page when changing items per page
              }}
              className="border-gray-300 rounded-md text-sm p-1"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
            
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-2 py-1 rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                <FaChevronLeft className="h-4 w-4" />
              </button>
              
              {/* Page number indicators */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.ceil(filteredResults.length / itemsPerPage) }, (_, i) => i + 1)
                  .filter(page => {
                    const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
                    // Show current page, first, last, and pages close to current
                    return page === 1 || 
                           page === totalPages || 
                           (page >= currentPage - 1 && page <= currentPage + 1);
                  })
                  .map(page => {
                    const isCurrentPage = page === currentPage;
                    const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
                    
                    // Add ellipsis for gaps
                    if (page > 1 && !Array.from({ length: Math.ceil(filteredResults.length / itemsPerPage) }, (_, i) => i + 1)
                        .filter(p => p === page - 1 || 
                                 p === 1 || 
                                 p === totalPages || 
                                 (p >= currentPage - 1 && p <= currentPage + 1))
                        .includes(page - 1)) {
                      return (
                        <React.Fragment key={`ellipsis-${page}`}>
                          <span className="px-2 py-1">...</span>
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-2 py-1 rounded ${isCurrentPage ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-2 py-1 rounded ${isCurrentPage ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                      >
                        {page}
                      </button>
                    );
                  })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredResults.length / itemsPerPage)))}
                disabled={currentPage === Math.ceil(filteredResults.length / itemsPerPage)}
                className={`px-2 py-1 rounded ${currentPage === Math.ceil(filteredResults.length / itemsPerPage) ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                <FaChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsList;

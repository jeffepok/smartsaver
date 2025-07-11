import React, { useState, useRef, useEffect } from 'react';
import { Transaction, Budget, SavingsGoal } from '@/types';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';
import { calculateCategoryTotals } from '@/utils/categorization';
import { FaRobot, FaPaperPlane, FaTimes } from 'react-icons/fa';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface FinanceAssistantProps {
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
}

const FinanceAssistant: React.FC<FinanceAssistantProps> = ({
  transactions,
  budgets,
  savingsGoals
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your SmartSave Assistant. Ask me questions about your finances."',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate a unique ID
  const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9);
  };

  // Handle user sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText.trim()) return;

    // Add user message to chat
    const newUserMessage: Message = {
      id: generateId(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Prepare financial context for the AI
      const financialContext = generateFinancialContext();

      // Send request to our OpenAI API route
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: newUserMessage.text,
          financialContext,
          transactions,  // Pass transactions for rule-based recommendations
          budgets,       // Pass budgets for rule-based recommendations
        }),
      });

      const data = await response.json();

      // Handle error responses
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get a response from the assistant');
      }

      // Add the bot's response to the chat
      const newBotMessage: Message = {
        id: generateId(),
        text: data.botMessage,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, newBotMessage]);
    } catch (error) {
      console.error('Error getting response from assistant:', error);

      // Add error message to chat
      const errorMessage: Message = {
        id: generateId(),
        text: "I'm sorry, I couldn't process your request at the moment. Please try again later.",
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate financial context for the AI
  const generateFinancialContext = (): string => {
    // Get recent transactions (last 3 months)
    const today = new Date();
    const startDate = startOfMonth(subMonths(today, 3));
    const recentTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate;
    });

    // Calculate category totals
    const categoryTotals = calculateCategoryTotals(recentTransactions);

    // Sort categories by spending amount
    const sortedCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .filter(([, amount]) => amount < 0); // Only include expense categories

    // Get top spending categories
    const topExpenseCategories = sortedCategories
      .map(([category, amount]) => `${category}: €${Math.abs(amount).toFixed(2)}`)
      .slice(0, 5);

    // Monthly breakdown of expenses
    const last3Months = Array.from({ length: 3 }, (_, i) => subMonths(today, i));
    const monthlyExpenses = last3Months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return isWithinInterval(date, { start: monthStart, end: monthEnd }) && t.amount < 0;
      });
      const totalExpense = Math.abs(monthTransactions.reduce((sum, t) => sum + t.amount, 0));
      return {
        month: format(month, 'MMMM'),
        total: totalExpense
      };
    });

    // Format transaction data
    const transactionSummary = `Recent transactions summary (past 3 months): ${recentTransactions.length} transactions.\n` +
      `Top expense categories: ${topExpenseCategories.join(', ')}.\n` +
      `Monthly expenses: ${monthlyExpenses.map(m => `${m.month}: €${m.total.toFixed(2)}`).join(', ')}.`;

    // Format budget data with progress
    const budgetSummary = budgets.length > 0 ?
      `Budgets: ${budgets.map(b => {
        // Calculate actual spending for this category
        const categorySpending = Math.abs(categoryTotals[b.category] || 0);
        const percentUsed = (categorySpending / b.amount) * 100;
        return `${b.category}: €${categorySpending.toFixed(2)}/€${b.amount.toFixed(2)} (${percentUsed.toFixed(1)}% used) ${b.period}`;
      }).join(', ')}.` :
      'No budgets set.';

    // Format savings goals data with time projections
    const goalsSummary = savingsGoals.length > 0 ?
      `Savings goals: ${savingsGoals.map(g => {
        const progress = (g.current_amount / g.target_amount) * 100;

        // Calculate monthly saving rate if there's a target date
        let timeInfo = '';
        if (g.target_date) {
          const targetDate = parseISO(g.target_date);
          const monthsLeft = Math.max(0, Math.floor((targetDate.getTime() - today.getTime()) / (30 * 24 * 60 * 60 * 1000)));
          const amountLeft = g.target_amount - g.current_amount;
          const monthlyNeed = monthsLeft > 0 ? amountLeft / monthsLeft : amountLeft;

          timeInfo = ` (${monthsLeft} months left, need €${monthlyNeed.toFixed(2)}/month)`;
        }

        return `${g.name}: €${g.current_amount.toFixed(2)}/€${g.target_amount.toFixed(2)} (${progress.toFixed(1)}%)${timeInfo}`;
      }).join('\n')}.` :
      'No savings goals set.';

    // Income analysis
    const incomeTransactions = transactions.filter(t => t.amount > 0);
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const averageMonthlyIncome = totalIncome / 3; // Last 3 months

    // Calculate total expenses
    const expenseTransactions = transactions.filter(t => t.amount < 0);
    const totalExpenses = Math.abs(expenseTransactions.reduce((sum, t) => sum + t.amount, 0));
    const averageMonthlyExpenses = totalExpenses / 3; // Last 3 months

    // Savings rate
    const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;

    const financialSummary = `Financial summary:\n` +
      `- Total income (3 months): €${totalIncome.toFixed(2)} (avg €${averageMonthlyIncome.toFixed(2)}/month)\n` +
      `- Total expenses (3 months): €${totalExpenses.toFixed(2)} (avg €${averageMonthlyExpenses.toFixed(2)}/month)\n` +
      `- Savings rate: ${savingsRate.toFixed(1)}%\n` +
      `- Current month budget utilization: ${budgets.map(b => {
        const categorySpending = Math.abs(categoryTotals[b.category] || 0);
        const percentUsed = (categorySpending / b.amount) * 100;
        return `${b.category}: ${percentUsed.toFixed(0)}%`;
      }).join(', ')}`;

    return `${financialSummary}\n\n${transactionSummary}\n\n${budgetSummary}\n\n${goalsSummary}`;
  };



  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Open finance assistant"
      >
        {isOpen ? <FaTimes size={20} /> : <FaRobot size={24} />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-96 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden border">
          {/* Chat header */}
          <div className="bg-blue-600 text-white p-3 flex items-center">
            <FaRobot className="mr-2" />
            <h3 className="font-medium">Finance Assistant</h3>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
            {messages.map(message => (
              <div
                key={message.id}
                className={`mb-3 max-w-[80%] ${
                  message.sender === 'user' ? 'ml-auto' : 'mr-auto'
                }`}
              >
                <div
                  className={`p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 shadow-sm rounded-bl-none'
                  }`}
                >
                  {message.text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i !== message.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
                <div
                  className={`text-xs mt-1 text-gray-500 ${
                    message.sender === 'user' ? 'text-right' : ''
                  }`}
                >
                  {format(message.timestamp, 'HH:mm')}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '200ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '400ms' }}></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t">
            <div className="flex items-center h-10">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask a question about your finances..."
                className="flex-1 h-full px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="h-full flex items-center justify-center bg-blue-600 text-white px-4 rounded-r-lg hover:bg-blue-700 transition-colors border border-blue-600"
                disabled={isLoading}
              >
                <FaPaperPlane />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default FinanceAssistant;

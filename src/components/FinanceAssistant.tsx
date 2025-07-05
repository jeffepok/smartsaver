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
      text: 'Hello! I\'m your SmartSave Assistant. Ask me questions about your finances, like "How much did I spend on food last month?" or "What\'s my biggest expense category?"',
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
  const handleSendMessage = (e: React.FormEvent) => {
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

    // Process the user's question and generate a response
    setTimeout(() => {
      const botResponse = processUserQuery(inputText);
      
      const newBotMessage: Message = {
        id: generateId(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, newBotMessage]);
      setIsLoading(false);
    }, 500); // Small delay to simulate processing
  };

  // Process user's query and generate a response
  const processUserQuery = (query: string): string => {
    query = query.toLowerCase();

    // Helper function to get transactions for a specific time period
    const getTransactionsForPeriod = (months: number = 1): Transaction[] => {
      const today = new Date();
      const startDate = startOfMonth(subMonths(today, months - 1));
      const endDate = endOfMonth(today);

      return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return isWithinInterval(transactionDate, { start: startDate, end: endDate });
      });
    };

    // Calculate spending by category for a given period
    const getSpendingByCategory = (transactions: Transaction[]) => {
      return calculateCategoryTotals(transactions);
    };

    // Handle different types of queries
    if (query.includes('spend') || query.includes('spent') || query.includes('spending')) {
      // Questions about spending
      
      let period = 1; // Default to last month
      if (query.includes('this month')) period = 1;
      if (query.includes('last month')) period = 2;
      if (query.includes('past 3 months') || query.includes('last 3 months')) period = 3;
      if (query.includes('past 6 months') || query.includes('last 6 months')) period = 6;
      if (query.includes('this year')) period = 12;

      const periodTransactions = getTransactionsForPeriod(period);
      const spendingByCategory = getSpendingByCategory(periodTransactions);
      
      // Spending on a specific category
      const categories = Object.keys(spendingByCategory);
      for (const category of categories) {
        if (query.includes(category.toLowerCase())) {
          const amount = spendingByCategory[category];
          const periodText = period === 1 ? 'this month' : 
                            period === 2 ? 'last month' : 
                            period === 12 ? 'this year' : 
                            `in the past ${period} months`;
          return `You've spent €${amount.toFixed(2)} on ${category} ${periodText}.`;
        }
      }

      // Total spending
      if (query.includes('total')) {
        const totalSpending = Object.entries(spendingByCategory)
          .filter(([category]) => category !== 'Income' && category !== 'Transfer')
          .reduce((sum, [_, amount]) => sum + amount, 0);
        
        const periodText = period === 1 ? 'this month' : 
                          period === 2 ? 'last month' : 
                          period === 12 ? 'this year' : 
                          `in the past ${period} months`;
        return `Your total spending ${periodText} is €${totalSpending.toFixed(2)}.`;
      }

      // Biggest expense/category
      if (query.includes('biggest') || query.includes('largest') || query.includes('top')) {
        const sortedCategories = Object.entries(spendingByCategory)
          .filter(([category]) => category !== 'Income' && category !== 'Transfer')
          .sort((a, b) => b[1] - a[1]);
        
        if (sortedCategories.length > 0) {
          const [topCategory, amount] = sortedCategories[0];
          const periodText = period === 1 ? 'this month' : 
                            period === 2 ? 'last month' : 
                            period === 12 ? 'this year' : 
                            `in the past ${period} months`;
          return `Your biggest expense category ${periodText} is ${topCategory} at €${amount.toFixed(2)}.`;
        }
      }
      
      // General spending summary if no specific question matched
      return "I can help you analyze your spending patterns. Try asking about a specific category like 'How much did I spend on food?' or 'What's my biggest expense this month?'";
    } else if (query.includes('budget')) {
      // Questions about budgets
      if (budgets.length === 0) {
        return "You don't have any budgets set up yet. Would you like to create one?";
      }
      
      // Check for category-specific budget questions
      for (const budget of budgets) {
        if (query.includes(budget.category.toLowerCase())) {
          return `Your budget for ${budget.category} is €${budget.amount.toFixed(2)} ${budget.period}.`;
        }
      }

      // List all budgets
      if (query.includes('all') || query.includes('list')) {
        const budgetList = budgets.map(b => `${b.category}: €${b.amount.toFixed(2)} ${b.period}`).join('\n');
        return `Here are your current budgets:\n${budgetList}`;
      }

      return `You have ${budgets.length} budget(s) set up. You can ask me about a specific category.`;
    } else if (query.includes('savings') || query.includes('goal')) {
      // Questions about savings goals
      if (savingsGoals.length === 0) {
        return "You don't have any savings goals set up yet. Would you like to create one?";
      }
      
      // Check for specific savings goal questions
      for (const goal of savingsGoals) {
        if (query.includes(goal.name.toLowerCase())) {
          const progress = (goal.current_amount / goal.target_amount) * 100;
          const remaining = goal.target_amount - goal.current_amount;
          return `For your "${goal.name}" goal, you've saved €${goal.current_amount.toFixed(2)} out of €${goal.target_amount.toFixed(2)} (${progress.toFixed(1)}%). You need €${remaining.toFixed(2)} more to reach your goal.`;
        }
      }

      // List all goals
      if (query.includes('all') || query.includes('list')) {
        const goalsList = savingsGoals.map(g => `${g.name}: €${g.current_amount.toFixed(2)} / €${g.target_amount.toFixed(2)}`).join('\n');
        return `Here are your current savings goals:\n${goalsList}`;
      }

      return `You have ${savingsGoals.length} savings goal(s). You can ask me about a specific goal by name.`;
    } else if (query.includes('income') || query.includes('earn')) {
      // Questions about income
      const incomeTransactions = transactions.filter(t => t.amount > 0);
      
      if (query.includes('this month') || query.includes('last month')) {
        let period = query.includes('this month') ? 1 : 2;
        const periodText = query.includes('this month') ? 'this month' : 'last month';
        
        const periodIncomeTransactions = incomeTransactions.filter(t => {
          const transactionDate = new Date(t.date);
          const startDate = startOfMonth(subMonths(new Date(), period - 1));
          const endDate = period === 1 ? new Date() : endOfMonth(subMonths(new Date(), period - 1));
          return isWithinInterval(transactionDate, { start: startDate, end: endDate });
        });
        
        const totalIncome = periodIncomeTransactions.reduce((sum, t) => sum + t.amount, 0);
        return `Your income ${periodText} is €${totalIncome.toFixed(2)}.`;
      }
      
      // Total income
      const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
      return `Your total recorded income is €${totalIncome.toFixed(2)}.`;
    } else if (query.includes('help') || query.includes('can you do')) {
      // Help request
      return `I can help you understand your finances. Here are some things you can ask me:
      
- How much did I spend on [category] this month?
- What's my biggest expense category?
- How much have I spent in the past 3 months?
- What's my budget for [category]?
- List all my budgets.
- How am I doing on my [goal name] savings goal?
- What's my income this month?

Feel free to ask me anything about your spending, budgets, or savings goals!`;
    }

    // Default response if no specific pattern matches
    return "I'm not sure how to answer that question. Try asking about your spending, budgets, or savings goals. For example, 'How much did I spend on food this month?' or 'What's my biggest expense category?'";
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

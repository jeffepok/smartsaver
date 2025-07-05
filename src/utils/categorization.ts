import { Transaction } from "../types";

// Keywords for different spending categories
const categoryKeywords: Record<string, string[]> = {
  "Food & Dining": ["restaurant", "cafe", "dining", "eat", "food", "grocery", "supermarket", "bakery", "meal", "takeaway", "takeout"],
  "Rent & Housing": ["rent", "mortgage", "housing", "apartment", "condo", "home", "property", "real estate"],
  "Transportation": ["uber", "lyft", "taxi", "car", "bus", "train", "metro", "transport", "gas", "fuel", "parking", "transit"],
  "Entertainment": ["movie", "cinema", "theater", "concert", "show", "event", "festival", "netflix", "spotify", "disney", "hulu"],
  "Shopping": ["amazon", "shop", "store", "mall", "retail", "clothing", "purchase", "buy"],
  "Utilities": ["electric", "water", "gas", "internet", "phone", "utility", "bill", "power", "energy"],
  "Subscriptions": ["subscription", "member", "monthly", "annual", "recurring", "netflix", "spotify", "apple", "amazon prime"],
  "Health & Fitness": ["gym", "fitness", "health", "medical", "doctor", "pharmacy", "medicine", "hospital", "clinic", "wellness"],
  "Travel": ["hotel", "flight", "airline", "vacation", "trip", "travel", "booking", "airbnb"],
  "Education": ["school", "college", "university", "course", "class", "tuition", "education", "learn", "book", "tutorial"],
  "Income": ["salary", "deposit", "income", "paycheck", "wage", "earnings", "revenue", "payment received"],
  "Transfer": ["transfer", "wire", "zelle", "venmo", "send", "receive"],
};

// Category colors for visualization
export const categoryColors: Record<string, string> = {
  "Food & Dining": "#FF5733",
  "Rent & Housing": "#33FF57",
  "Transportation": "#3357FF",
  "Entertainment": "#FF33F5",
  "Shopping": "#33FFF5",
  "Utilities": "#F5FF33",
  "Subscriptions": "#FF8C33",
  "Health & Fitness": "#33FFB2",
  "Travel": "#B233FF",
  "Education": "#33B2FF",
  "Income": "#2ECC71",
  "Transfer": "#F1C40F",
  "Other": "#95A5A6",
};

// Categorize a transaction based on its description
export function categorizeTransaction(transaction: Transaction): Transaction {
  const description = transaction.description.toLowerCase();
  
  // First check for income (positive amounts are usually income)
  if (transaction.amount > 0) {
    // Check if it's a transfer between accounts
    if (isTransfer(description)) {
      return { ...transaction, category: "Transfer" };
    }
    
    // Otherwise, classify as income
    return { ...transaction, category: "Income" };
  }
  
  // For expenses, match against keywords
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => description.includes(keyword.toLowerCase()))) {
      return { ...transaction, category };
    }
  }
  
  // If no category matched, classify as other
  return { ...transaction, category: "Other" };
}

// Check if transaction is likely a transfer between accounts
function isTransfer(description: string): boolean {
  const transferKeywords = ["transfer", "wire", "zelle", "venmo", "send", "receive", "move money"];
  return transferKeywords.some(keyword => description.includes(keyword));
}

// Get all spending categories from transactions
export function getSpendingCategories(transactions: Transaction[]): string[] {
  const categories = new Set<string>();
  
  transactions.forEach(transaction => {
    if (transaction.category) {
      categories.add(transaction.category);
    }
  });
  
  return Array.from(categories);
}

// Calculate total spending by category
export function calculateCategoryTotals(transactions: Transaction[]): Record<string, number> {
  const categoryTotals: Record<string, number> = {};
  
  transactions.forEach(transaction => {
    if (transaction.category && transaction.amount < 0) {
      const amount = Math.abs(transaction.amount);
      categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + amount;
    }
  });
  
  return categoryTotals;
}

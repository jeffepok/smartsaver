let lastTransactionId = null;

// API URL for polling new transactions
const API_URL = "http://localhost:3000/api/transactions/latest";

// Store the last notification time to avoid notification spam
let lastNotificationTime = 0;

/**
 * Checks for new transactions by polling the API endpoint
 */
async function checkForNewTransaction() {
  try {
    const res = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Include credentials if your API needs authentication
      // credentials: 'include',
    });
    
    // Check if the response is OK
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error(`API Error (${res.status}):`, errorData.error || 'Unknown error');
      return;
    }
    
    const transaction = await res.json();
    
    // Check if this is a new transaction we haven't seen before
    if (transaction.id && transaction.id !== lastTransactionId) {
      // Update the last transaction ID
      lastTransactionId = transaction.id;
      
      // Avoid notification spam by limiting notifications to once per 30 seconds
      const currentTime = Date.now();
      if (currentTime - lastNotificationTime < 30000) {
        console.log('Skipping notification - too soon after last one');
        return;
      }
      
      // Update last notification time
      lastNotificationTime = currentTime;
      
      // Create a notification with the transaction details
      const formattedAmount = Math.abs(transaction.amount).toFixed(2);
      const currency = transaction.currency || '€';
      const category = transaction.category || 'Uncategorized';
      const transactionType = transaction.amount < 0 ? 'Expense' : 'Income';
      
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: `${transactionType}: ${currency}${formattedAmount}`,
        message: `Category: ${category}\nDescription: ${transaction.description}`
      });
      
      console.log('New transaction notification created:', transaction.id);
    }
  } catch (err) {
    console.error("Failed to fetch transaction:", err);
  }
}

// Check for new transaction on extension startup
checkForNewTransaction();

// Poll for new transactions every 10 seconds
// In a production environment, consider using WebSockets for real-time updates
setInterval(checkForNewTransaction, 10000);

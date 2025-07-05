// background.js
// Background script for SmartSave Transaction Alert extension

// Initialize when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log("SmartSave Transaction Alert extension installed");

  // Initialize transaction storage
  chrome.storage.local.set({ transactions: [] }, () => {
    console.log("Transaction storage initialized");
  });
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "triggerNotification") {
    // Create and show notification
    createTransactionNotification(message.transaction);

    // Store the transaction
    storeTransaction(message.transaction);

    sendResponse({ success: true });
  } else if (message.action === "getTransactions") {
    // Retrieve stored transactions
    chrome.storage.local.get(["transactions"], (result) => {
      sendResponse({ success: true, transactions: result.transactions || [] });
    });
    return true; // Required for async sendResponse
  }
  return true;
});

// Store transaction in local storage
function storeTransaction(transaction) {
  chrome.storage.local.get(["transactions"], (result) => {
    const transactions = result.transactions || [];
    transactions.push({
      ...transaction,
      timestamp: Date.now()
    });

    // Keep only last 50 transactions
    const trimmedTransactions = transactions.slice(-50);

    chrome.storage.local.set({ transactions: trimmedTransactions }, () => {
      console.log("Transaction stored:", transaction);
    });
  });
}

// Create and display a notification
function createTransactionNotification(transaction) {
  const isExpense = transaction.type === "expense";
  const amountStr = isExpense ? transaction.amount : `+${transaction.amount}`;

  const options = {
    type: "basic",
    iconUrl: chrome.runtime.getURL("icons/icon128.png"),
    title: `New ${isExpense ? "Expense" : "Income"} Recorded`,
    message: `${amountStr} ${transaction.currency} - ${transaction.description}`,
    contextMessage: `Transaction date: ${transaction.date}`,
    priority: 2,
    requireInteraction: true
  };

  // Create notification
  chrome.notifications.create(`transaction-${Date.now()}`, options, (notificationId) => {
    if (chrome.runtime.lastError) {
      console.error("Notification creation failed:", chrome.runtime.lastError.message);
      return;
    }
    
    console.log("Notification created:", notificationId);

    // Automatically clear notification after 10 seconds
    setTimeout(() => {
      chrome.notifications.clear(notificationId, () => {
        if (chrome.runtime.lastError) {
          console.warn("Notification clear failed:", chrome.runtime.lastError.message);
        }
      });
    }, 10000);
  });
}

// popup.js
document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements for tabs
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  // Get DOM elements for form
  const notificationForm = document.getElementById('notification-form');
  const descriptionInput = document.getElementById('description');
  const amountInput = document.getElementById('amount');
  const currencySelect = document.getElementById('currency');
  const typeSelect = document.getElementById('type');
  const statusMessage = document.getElementById('status-message');
  const transactionList = document.getElementById('transaction-list');
  
  // Tab switching functionality
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to current button and corresponding content
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      document.getElementById(`${tabId}-tab`).classList.add('active');
      
      // If history tab selected, load transaction history
      if (tabId === 'history') {
        loadTransactionHistory();
      }
    });
  });
  
  // Handle form submission
  notificationForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Validate amount (must be positive)
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
      showStatus('Amount must be a positive number', 'error');
      return;
    }
    
    // Get values from form
    const transaction = {
      description: descriptionInput.value,
      amount: typeSelect.value === 'expense' ? 
        `-${amount.toFixed(2)}` : 
        amount.toFixed(2),
      currency: currencySelect.value,
      type: typeSelect.value,
      date: new Date().toISOString().split('T')[0]  // Current date in YYYY-MM-DD format
    };
    
    // Send transaction data to background script to trigger notification
    chrome.runtime.sendMessage(
      { action: "triggerNotification", transaction: transaction },
      function(response) {
        if (response && response.success) {
          showStatus('Notification sent successfully!', 'success');
          // Reset form
          notificationForm.reset();
        } else {
          showStatus('Failed to send notification.', 'error');
        }
      }
    );
  });
  
  // Load transaction history from storage
  function loadTransactionHistory() {
    transactionList.innerHTML = '<div class="loading">Loading transactions...</div>';
    
    chrome.runtime.sendMessage(
      { action: "getTransactions" },
      function(response) {
        if (response && response.success) {
          displayTransactions(response.transactions);
        } else {
          transactionList.innerHTML = '<div class="error">Failed to load transactions.</div>';
        }
      }
    );
  }
  
  // Display transactions in the transaction list
  function displayTransactions(transactions) {
    if (!transactions || transactions.length === 0) {
      transactionList.innerHTML = '<div class="empty-state">No transactions recorded yet.</div>';
      return;
    }
    
    // Sort transactions by timestamp (newest first)
    transactions.sort((a, b) => b.timestamp - a.timestamp);
    
    // Clear transaction list
    transactionList.innerHTML = '';
    
    // Add transactions to list
    transactions.forEach(transaction => {
      const isExpense = transaction.type === 'expense';
      const amountStr = isExpense ? transaction.amount : `+${transaction.amount}`;
      
      const transactionEl = document.createElement('div');
      transactionEl.className = 'transaction-item';
      transactionEl.innerHTML = `
        <div class="transaction-date">${formatDate(transaction.date)}</div>
        <div class="transaction-description">${transaction.description}</div>
        <div class="transaction-amount ${transaction.type}">
          ${amountStr} ${transaction.currency}
        </div>
      `;
      
      transactionList.appendChild(transactionEl);
    });
  }
  
  // Format date from YYYY-MM-DD to more readable format
  function formatDate(dateStr) {
    if (!dateStr) return 'Unknown date';
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, options);
    } catch (e) {
      return dateStr;
    }
  }
  
  // Display status message
  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = type;
    
    // Clear status message after 3 seconds
    setTimeout(() => {
      statusMessage.textContent = '';
      statusMessage.className = '';
    }, 3000);
  }
});

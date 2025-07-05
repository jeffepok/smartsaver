# SmartSave - Digital Financial Assistant

SmartSave is a Next.js application that provides tailored savings insights using financial data and smart logic. It helps users understand their spending patterns, set savings goals, and receive recommendations for improving their financial health.

## Features

### Financial Data Analysis
- **Expense Overview**: Clear view of the past three months of expenses
- **Spend Categorization**: Automatically categorizes spending into buckets (food, rent, transport, subscriptions, etc.)
- **Interactive Visualizations**: Charts and graphs to visualize spending trends over time

### Smart Savings Tools
- **Savings Goals**: Set and track progress toward multiple savings goals
- **Automatic Saving Recommendations**: Personalized suggestions based on spending patterns
- **Expense Reduction Tips**: Smart recommendations for areas to cut back on spending

## Getting Started

### Prerequisites
- Node.js 18.0.0 or later
- npm or yarn package manager

### Installation

1. Clone the repository:
extract the zip file
```bash
cd smartsave
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create Env file `.env.local` with OPENAI_API_KEY:
```bash
OPENAI_API_KEY=your-open-ai-key
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal) in your browser

## Data Format

The application expects financial data in CSV format with the following columns:

```
date,description,amount,type,account_number,currency
```

Example:
```
2025-06-01,Salary deposit,3500,income,1234567890,EUR
2025-06-05,Rent payment,-1200,expense,1234567890,EUR
```

## Chrome Extension

The Chrome extension is used to notify the user when a new transaction is added to the database.

### Installation

add the extension to chrome

1. Open chrome://extensions/
2. Enable Developer mode
3. Click on Load unpacked
4. Select the extension folder

## Usage
Click on the extension icon in the chrome toolbar to open the popup.
Fill in the form and click on the add transaction button.
Click on send notification to send a notification.

## WhatsApp Notification Integration

SmartSave includes a mock WhatsApp notification system that sends alerts when new transactions are added.

### Testing WhatsApp Integration

1. **Register a WhatsApp Number**: Use the WhatsApp API endpoint to register your number
   ```
   POST /api/whatsapp
   {
     "phone_number": "+1234567890"
   }
   ```

2. **Add a New Transaction**: Create a transaction through the UI or API
   ```
   POST /api/transactions
   {
     "date": "2025-07-05",
     "description": "Test Transaction",
     "amount": -50,
     "category": "Testing"
   }
   ```

3. **Check Console Logs**: The mock WhatsApp notification will appear in the server console logs

4. **Verify Connection Status**: Check if a WhatsApp number is registered
   ```
   GET /api/whatsapp
   ```

> Note: This is a mock implementation for demonstration purposes. In a production environment, you would integrate with the actual WhatsApp Business API.

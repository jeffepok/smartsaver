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

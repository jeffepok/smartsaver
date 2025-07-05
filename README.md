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
```bash
git clone https://github.com/your-username/smartsave.git
cd smartsave
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal) in your browser

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

## Technologies Used

- **Next.js**: React framework for the frontend application
- **TypeScript**: For type-safe code
- **Chart.js & react-chartjs-2**: For data visualization
- **TailwindCSS**: For styling
- **PapaParse**: For CSV parsing
- **React Icons**: For UI icons

## Project Structure

- `/src/components`: React components for the UI
- `/src/types`: TypeScript type definitions
- `/src/utils`: Utility functions for data processing
  - `csvParser.ts`: Functions for parsing and processing CSV data
  - `categorization.ts`: Logic for categorizing transactions
  - `savingsAnalyzer.ts`: Smart analysis for savings recommendations

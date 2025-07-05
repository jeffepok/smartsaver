import { Transaction, SavingsGoal, SavingsRecommendation } from '@/types';
import { format } from 'date-fns';

// Format a date as YYYY-MM-DD
const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    return dateStr;
  }
};

// Export transactions to CSV
export const exportTransactionsToCSV = (transactions: Transaction[]): void => {
  // CSV header
  let csvContent = 'date,description,amount,type,account_number,currency,category\n';

  // Add each transaction as a row
  transactions.forEach(transaction => {
    const row = [
      formatDate(transaction.date),
      `"${transaction.description.replace(/"/g, '""')}"`, // Escape quotes in CSV
      transaction.amount,
      transaction.type || '',
      transaction.account_number || '',
      transaction.currency || '',
      transaction.category || ''
    ].join(',');

    csvContent += row + '\n';
  });

  // Create and download the file
  downloadCSV(csvContent, `smartsave_transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
};

// Export savings goals to CSV
export const exportSavingsGoalsToCSV = (goals: SavingsGoal[]): void => {
  // CSV header
  let csvContent = 'name,targetAmount,currentAmount,targetDate,createdAt\n';

  // Add each goal as a row
  goals.forEach(goal => {
    const row = [
      `"${goal.name.replace(/"/g, '""')}"`,
      goal.target_amount,
      goal.current_amount || 0,
      goal.target_date ? formatDate(goal.target_date) : '',
      goal.created_at || ''
    ].join(',');

    csvContent += row + '\n';
  });

  // Create and download the file
  downloadCSV(csvContent, `smartsave_goals_${format(new Date(), 'yyyy-MM-dd')}.csv`);
};

// Export savings recommendations to CSV
export const exportRecommendationsToCSV = (recommendations: SavingsRecommendation[]): void => {
  // CSV header
  let csvContent = 'category,currentSpending,suggestedReduction,potentialSavings,description\n';

  // Add each recommendation as a row
  recommendations.forEach(recommendation => {
    const row = [
      `"${recommendation.category.replace(/"/g, '""')}"`,
      recommendation.currentSpending,
      recommendation.suggestedReduction,
      recommendation.potentialSavings,
      `"${recommendation.description?.replace(/"/g, '""') || ''}"`
    ].join(',');

    csvContent += row + '\n';
  });

  // Create and download the file
  downloadCSV(csvContent, `smartsave_recommendations_${format(new Date(), 'yyyy-MM-dd')}.csv`);
};

// Helper function to download CSV content
const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  // Create a URL for the blob
  const url = URL.createObjectURL(blob);

  // Set link attributes
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  // Add to document, click and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export a summary report as PDF (simplified version - would need a PDF library for real implementation)
export const exportSummaryReport = (
  transactions: Transaction[],
  goals: SavingsGoal[],
  recommendations: SavingsRecommendation[]
): void => {
  // In a real implementation, we'd use a PDF library like jsPDF
  // For this demo, we'll create a formatted text file

  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = Math.abs(transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0));

  const netSavings = totalIncome - totalExpenses;

  let reportContent = `# SmartSave Financial Summary Report
Generated on ${format(new Date(), 'yyyy-MM-dd')}

## Financial Overview
Total Income: ${totalIncome.toFixed(2)}
Total Expenses: ${totalExpenses.toFixed(2)}
Net Savings: ${netSavings.toFixed(2)}

## Savings Goals
${goals.map(g => `- ${g.name}: ${g.current_amount || 0} / ${g.target_amount} (${((g.current_amount || 0) / g.target_amount * 100).toFixed(1)}%)`).join('\n')}

## Top Saving Recommendations
${recommendations.slice(0, 5).map(r => `- ${r.category}: Potential savings of ${r.potentialSavings.toFixed(2)} by reducing ${r.suggestedReduction}%`).join('\n')}
`;

  // Create and download the file
  const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `smartsave_report_${format(new Date(), 'yyyy-MM-dd')}.txt`);

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

import React from 'react';
import { Transaction, SavingsRecommendation } from '@/types';
import { 
  generateSavingsRecommendations, 
  suggestMonthlySavingsAmount 
} from '@/utils/savingsAnalyzer';
import { FaLightbulb, FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface SavingsRecommendationsProps {
  transactions: Transaction[];
}

const SavingsRecommendations: React.FC<SavingsRecommendationsProps> = ({ transactions }) => {
  const [expandedRecommendation, setExpandedRecommendation] = React.useState<string | null>(null);
  
  // Generate recommendations based on transaction data
  const recommendations = generateSavingsRecommendations(transactions);
  
  // Calculate suggested monthly savings
  const suggestedMonthlySavings = suggestMonthlySavingsAmount(transactions);
  
  // Toggle recommendation expansion
  const toggleRecommendation = (category: string) => {
    if (expandedRecommendation === category) {
      setExpandedRecommendation(null);
    } else {
      setExpandedRecommendation(category);
    }
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6">Smart Savings Recommendations</h2>
      
      {/* Overall savings suggestion */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center mb-2">
          <FaLightbulb className="text-yellow-400 mr-2 text-xl" />
          <h3 className="text-lg font-medium">Suggested Monthly Savings</h3>
        </div>
        <p className="text-gray-700 mb-2">
          Based on your income and spending patterns, we recommend saving:
        </p>
        <p className="text-2xl font-bold text-blue-700">
          €{suggestedMonthlySavings.toFixed(2)}/month
        </p>
        <p className="text-sm text-gray-500 mt-1">
          This amount is calculated based on your average income, expenses, and potential savings opportunities.
        </p>
      </div>
      
      {/* Specific recommendations */}
      <h3 className="text-lg font-medium mb-4">Ways to Save Money</h3>
      
      {recommendations.length > 0 ? (
        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <div 
              key={recommendation.category}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Recommendation header - always visible */}
              <div 
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleRecommendation(recommendation.category)}
              >
                <div className="flex-1">
                  <h4 className="font-medium">{recommendation.category}</h4>
                  <p className="text-sm text-gray-600">
                    Reduce by {recommendation.suggestedReduction}% to save €{recommendation.potentialSavings.toFixed(2)}/month
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 font-medium mr-3">
                    €{recommendation.potentialSavings.toFixed(2)}
                  </span>
                  {expandedRecommendation === recommendation.category ? (
                    <FaChevronUp className="text-gray-400" />
                  ) : (
                    <FaChevronDown className="text-gray-400" />
                  )}
                </div>
              </div>
              
              {/* Expanded content - visible when clicked */}
              {expandedRecommendation === recommendation.category && (
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-600">Current monthly spending:</span>
                    <span className="ml-2 font-medium">€{recommendation.currentSpending.toFixed(2)}</span>
                  </div>
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-600">Suggested target:</span>
                    <span className="ml-2 font-medium">
                      €{(recommendation.currentSpending * (1 - recommendation.suggestedReduction / 100)).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-gray-700">{recommendation.description}</p>
                  
                  {/* Custom tips based on category */}
                  {recommendation.category === "Food & Dining" && (
                    <ul className="mt-2 text-sm text-gray-700 list-disc list-inside">
                      <li>Meal prep on weekends to avoid takeout during busy days</li>
                      <li>Use grocery store loyalty programs and coupons</li>
                      <li>Limit dining out to once a week instead of multiple times</li>
                    </ul>
                  )}
                  
                  {recommendation.category === "Entertainment" && (
                    <ul className="mt-2 text-sm text-gray-700 list-disc list-inside">
                      <li>Look for free local events in your community</li>
                      <li>Use library services for books, movies, and music</li>
                      <li>Share subscription costs with family or friends</li>
                    </ul>
                  )}
                  
                  {recommendation.category === "Shopping" && (
                    <ul className="mt-2 text-sm text-gray-700 list-disc list-inside">
                      <li>Create a shopping list and stick to it</li>
                      <li>Wait 24-48 hours before making non-essential purchases</li>
                      <li>Look for second-hand options for certain items</li>
                    </ul>
                  )}
                  
                  {recommendation.category === "Subscriptions" && (
                    <ul className="mt-2 text-sm text-gray-700 list-disc list-inside">
                      <li>Audit all your subscriptions and cancel unused ones</li>
                      <li>Downgrade to cheaper plans where possible</li>
                      <li>Rotate streaming services instead of having them all simultaneously</li>
                    </ul>
                  )}
                  
                  {recommendation.category === "Transportation" && (
                    <ul className="mt-2 text-sm text-gray-700 list-disc list-inside">
                      <li>Use public transportation when feasible</li>
                      <li>Consider carpooling to share fuel costs</li>
                      <li>Compare prices at different gas stations to find the best deal</li>
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No specific savings recommendations available. Please upload more transaction data.
        </div>
      )}
    </div>
  );
};

export default SavingsRecommendations;

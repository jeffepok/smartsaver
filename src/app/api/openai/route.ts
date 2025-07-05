import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSpendingRecommendations } from '@/utils/spendingRecommendations';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Type for the expected request body
interface RequestBody {
  userMessage: string;
  financialContext: string;
  transactions?: any[];
  budgets?: any[];
}

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body: RequestBody = await request.json();
    const { userMessage, financialContext, transactions = [], budgets = [] } = body;

    if (!userMessage) {
      return NextResponse.json(
        { error: 'Missing required field: userMessage' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured', botMessage: "I'm sorry, the assistant is not configured properly. Please contact support." },
        { status: 500 }
      );
    }

    // Check if the user is asking about spending reductions or cost-cutting
    const isAskingAboutSpendingReduction = userMessage.toLowerCase().includes('spend') ||
      userMessage.toLowerCase().includes('cut') ||
      userMessage.toLowerCase().includes('save') ||
      userMessage.toLowerCase().includes('budget') ||
      userMessage.toLowerCase().includes('reduce') ||
      userMessage.toLowerCase().includes('saving') ||
      userMessage.toLowerCase().includes('money');
    
    // If asking about spending reductions, use our rule-based recommendations
    let ruleBasedRecommendations: string[] = [];
    if (isAskingAboutSpendingReduction && transactions.length > 0) {
      ruleBasedRecommendations = getSpendingRecommendations(transactions, budgets);
    }

    // Create the system message that provides context about the app and financial data
    const systemMessage = `You are a helpful financial assistant in the SmartSave application.
    You help users understand their financial data and provide personalized insights and recommendations.
    Your tone is professional but friendly.
    
    Here's the detailed context of the user's financial data:
    ${financialContext}
    
    When responding to user queries:
    1. Reference specific numbers and data from the financial context when relevant
    2. Provide actionable insights and personalized recommendations based on their financial situation
    3. Be precise with calculations and percentages
    4. If analyzing trends or making comparisons, clearly explain your reasoning
    5. Offer suggestions for budget improvements or savings opportunities when appropriate
    
    Answer the user's questions based on this financial context. If you can't answer a question based on the data provided, 
    politely explain that you need more information or that the data isn't available.
    Keep responses concise and focused on financial insights.
    
    ${isAskingAboutSpendingReduction && ruleBasedRecommendations.length > 0 ? 
      `IMPORTANT: When suggesting ways to reduce spending or cut costs, ONLY use the following rule-based recommendations our system has generated based on the user's actual financial data. DO NOT make up your own recommendations for spending cuts:

${ruleBasedRecommendations.join('\n\n')}

You can explain these recommendations in your own words, but do not contradict them or add different recommendations.` : 
      ''}`;

    // Call the OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 500, // Increased token limit for more detailed responses
      // Using a lower temperature for spending reduction questions to stick closer to our rule-based recommendations
      temperature: isAskingAboutSpendingReduction ? 0.3 : 0.5,
    });

    // Extract the response text
    const botMessage = completion.choices[0].message.content || "I'm sorry, I couldn't generate a response.";

    // Return the bot's message
    return NextResponse.json({ botMessage });
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { 
        error: 'Error communicating with OpenAI API',
        details: error.message,
        botMessage: "I'm sorry, there was an error processing your request. Please try again later."
      },
      { status: 500 }
    );
  }
}

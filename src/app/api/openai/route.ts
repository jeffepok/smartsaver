import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Type for the expected request body
interface RequestBody {
  userMessage: string;
  financialContext: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body: RequestBody = await request.json();
    const { userMessage, financialContext } = body;

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

    // Create the system message that provides context about the app and financial data
    const systemMessage = `You are a helpful financial assistant in the SmartSave application.
    You help users understand their financial data and provide personalized insights.
    Your tone is professional but friendly.
    
    Here's the context of the user's financial data:
    ${financialContext}
    
    Answer the user's questions based on this financial context. If you can't answer a question based on the data provided, 
    politely explain that you need more information or that the data isn't available. 
    Keep responses concise and focused on financial insights.`;

    // Call the OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 300,
      temperature: 0.7,
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

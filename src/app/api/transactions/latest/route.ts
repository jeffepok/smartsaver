import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { Transaction } from '@/types';

// Helper function to handle CORS
function setCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
  const response = NextResponse.json({}, { status: 200 });
  return setCorsHeaders(response);
}

export async function GET(request: NextRequest) {
  try {
    // For completely open access to the latest transaction
    // We'll ignore authentication status and simply return the most recent transaction
    const query = `
      SELECT * FROM transactions 
      ORDER BY date DESC, id DESC
      LIMIT 1
    `;
    
    const stmt = db.prepare(query);
    const transaction = stmt.get();
    
    if (!transaction) {
      const response = NextResponse.json(
        { error: 'No transactions found' },
        { status: 404 }
      );
      return setCorsHeaders(response);
    }
    
    const response = NextResponse.json(transaction);
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Error fetching latest transaction:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return setCorsHeaders(response);
  }
}

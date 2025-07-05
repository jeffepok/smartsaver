import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { Transaction } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from session
    const userId = request.cookies.get('session_id')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    // Get transactions for this user
    const stmt = db.prepare(`
      SELECT * FROM transactions 
      WHERE user_id = ? 
      ORDER BY date DESC
    `);
    
    const transactions = stmt.all(userId);
    
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user ID from session
    const userId = request.cookies.get('session_id')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Parse transaction data from request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.date || !data.description || data.amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: date, description, or amount' },
        { status: 400 }
      );
    }
    
    // Create a new transaction object with UUID
    const newTransaction: Transaction = {
      id: data.id || uuidv4(),
      user_id: userId,
      date: data.date,
      description: data.description,
      amount: parseFloat(data.amount),
      type: data.type || null,
      account_number: data.account_number || null,
      currency: data.currency || 'USD',
      category: data.category || 'Other',
      csv_file_id: null
    };
    
    // Insert the transaction into the database
    const stmt = db.prepare(`
      INSERT INTO transactions (
        id, user_id, date, description, amount, type, 
        account_number, currency, category, csv_file_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      newTransaction.id,
      newTransaction.user_id,
      newTransaction.date,
      newTransaction.description,
      newTransaction.amount,
      newTransaction.type,
      newTransaction.account_number,
      newTransaction.currency,
      newTransaction.category,
      newTransaction.csv_file_id
    );
    
    return NextResponse.json({
      success: true,
      transaction: newTransaction
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserById } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from session
    const userId = request.cookies.get('session_id')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify user exists
    const userIdNum = parseInt(userId, 10);
    const user = getUserById(userIdNum);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }
    
    // Get budgets for the user
    const budgets = db.prepare(
      'SELECT * FROM budgets WHERE user_id = ?'
    ).all(userId);
    
    return NextResponse.json({ budgets });
  } catch (error) {
    console.error('Error fetching budgets:', error);
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
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify user exists
    const userIdNum = parseInt(userId, 10);
    const user = getUserById(userIdNum);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }
    
    // Get request body
    const { category, amount, period } = await request.json();
    
    // Validate required fields
    if (!category || !amount || !period) {
      return NextResponse.json(
        { error: 'Category, amount, and period are required' },
        { status: 400 }
      );
    }
    
    // Generate ID for the budget
    const budgetId = uuidv4();
    
    // Insert new budget
    db.prepare(
      'INSERT INTO budgets (id, user_id, category, amount, period) VALUES (?, ?, ?, ?, ?)'
    ).run(
      budgetId,
      userId,
      category,
      amount,
      period
    );
    
    // Return the created budget
    const savedBudget = db.prepare(
      'SELECT * FROM budgets WHERE id = ?'
    ).get(budgetId);
    
    return NextResponse.json(
      { budget: savedBudget },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

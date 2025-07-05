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
    
    // Database is already imported
    
    // Get savings goals for the user
    const savingsGoals = db.prepare(
      'SELECT * FROM savings_goals WHERE user_id = ?'
    ).all(userId);
    
    return NextResponse.json({ savingsGoals });
  } catch (error) {
    console.error('Error fetching savings goals:', error);
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
    const { name, targetAmount, currentAmount, targetDate, category } = await request.json();
    
    // Validate required fields
    if (!name || !targetAmount) {
      return NextResponse.json(
        { error: 'Name and target amount are required' },
        { status: 400 }
      );
    }
    
    // Database is already imported
    
    // Generate ID for the goal
    const goalId = uuidv4();
    
    // Insert new savings goal
    db.prepare(
      'INSERT INTO savings_goals (id, user_id, name, target_amount, current_amount, target_date, category) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      goalId,
      userId,
      name,
      targetAmount,
      currentAmount || 0,
      targetDate || null,
      category || null
    );
    
    // Return the created goal
    const savedGoal = db.prepare(
      'SELECT * FROM savings_goals WHERE id = ?'
    ).get(goalId);
    
    return NextResponse.json(
      { goal: savedGoal },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating savings goal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

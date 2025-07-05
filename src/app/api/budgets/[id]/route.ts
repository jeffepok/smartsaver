import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserById } from '@/lib/auth';

interface Budget {
  id: string;
  user_id: number;
  category: string;
  amount: number;
  period: string;
  created_at: string;
  last_updated: string;
}

interface Params {
  id: string;
}

export async function GET(request: NextRequest, { params }: { params: Params }) {
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
    
    // Get the specific budget
    const budget = db.prepare(
      'SELECT * FROM budgets WHERE id = ? AND user_id = ?'
    ).get(params.id, userIdNum) as Budget | undefined;
    
    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found or not owned by user' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ budget });
  } catch (error) {
    console.error('Error fetching budget:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Params }) {
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

    // Verify budget exists and belongs to user
    const existingBudget = db.prepare(
      'SELECT * FROM budgets WHERE id = ? AND user_id = ?'
    ).get(params.id, userIdNum) as Budget | undefined;

    if (!existingBudget) {
      return NextResponse.json(
        { error: 'Budget not found or not owned by user' },
        { status: 404 }
      );
    }

    // Get updated budget data
    const { category, amount, period } = await request.json();

    // Update the budget
    db.prepare(`
      UPDATE budgets
      SET category = ?, amount = ?, period = ?, last_updated = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(
      category || existingBudget.category,
      amount !== undefined ? amount : existingBudget.amount,
      period || existingBudget.period,
      params.id,
      userIdNum
    );

    // Get updated budget
    const updatedBudget = db.prepare(
      'SELECT * FROM budgets WHERE id = ?'
    ).get(params.id) as Budget;

    return NextResponse.json({ budget: updatedBudget });
  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Params }) {
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

    // Verify budget exists and belongs to user
    const existingBudget = db.prepare(
      'SELECT * FROM budgets WHERE id = ? AND user_id = ?'
    ).get(params.id, userIdNum);

    if (!existingBudget) {
      return NextResponse.json(
        { error: 'Budget not found or not owned by user' },
        { status: 404 }
      );
    }

    // Delete the budget
    db.prepare(
      'DELETE FROM budgets WHERE id = ? AND user_id = ?'
    ).run(params.id, userIdNum);

    return NextResponse.json(
      { success: true, message: 'Budget deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

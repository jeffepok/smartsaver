import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserById } from '@/lib/auth';

interface SavingsGoal {
  id: number;
  user_id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category: string;
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

    // Database is already imported

    // Get the specific savings goal
    const savingsGoal = db.prepare(
      'SELECT * FROM savings_goals WHERE id = ? AND user_id = ?'
    ).get(params.id, userIdNum);

    if (!savingsGoal) {
      return NextResponse.json(
        { error: 'Savings goal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ goal: savingsGoal });
  } catch (error) {
    console.error('Error fetching savings goal:', error);
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

    // Verify goal exists and belongs to user
    const existingGoal = db.prepare(
      'SELECT * FROM savings_goals WHERE id = ? AND user_id = ?'
    ).get(params.id, userIdNum) as SavingsGoal | undefined;

    if (!existingGoal) {
      return NextResponse.json(
        { error: 'Savings goal not found or not owned by user' },
        { status: 404 }
      );
    }

    // Get updated goal data
    const { name, targetAmount, currentAmount, targetDate, category } = await request.json();

    // Update the goal
    db.prepare(`
      UPDATE savings_goals
      SET name = ?, target_amount = ?, current_amount = ?, target_date = ?, category = ?
      WHERE id = ? AND user_id = ?
    `).run(
      name || existingGoal.name,
      targetAmount || existingGoal.target_amount,
      currentAmount !== undefined ? currentAmount : existingGoal.current_amount,
      targetDate || existingGoal.target_date,
      category || existingGoal.category,
      params.id,
      userIdNum
    );

    // Get updated goal
    const updatedGoal = db.prepare(
      'SELECT * FROM savings_goals WHERE id = ?'
    ).get(params.id) as SavingsGoal;

    return NextResponse.json({ goal: updatedGoal });
  } catch (error) {
    console.error('Error updating savings goal:', error);
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

    // Verify goal exists and belongs to user
    // Database is already imported
    const existingGoal = db.prepare(
      'SELECT * FROM savings_goals WHERE id = ? AND user_id = ?'
    ).get(params.id, userId);

    if (!existingGoal) {
      return NextResponse.json(
        { error: 'Savings goal not found or not owned by user' },
        { status: 404 }
      );
    }

    // Delete the goal
    db.prepare(
      'DELETE FROM savings_goals WHERE id = ? AND user_id = ?'
    ).run(params.id, userIdNum);

    return NextResponse.json(
      { success: true, message: 'Savings goal deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting savings goal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

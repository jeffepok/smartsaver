import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserById } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

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
  const { id } = await params;
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
    ).get(id, userIdNum);

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
    const { id } = await params;
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
    ).get(id, userIdNum) as SavingsGoal | undefined;

    if (!existingGoal) {
      return NextResponse.json(
        { error: 'Savings goal not found or not owned by user' },
        { status: 404 }
      );
    }

    // Get updated goal data
    const { name, target_amount, current_amount, target_date, is_deposit, deposit_amount, deposit_description } = await request.json();

    // Start a database transaction to ensure data integrity
    const transaction = db.transaction(() => {
      // Check if this is a deposit operation
      if (is_deposit && deposit_amount > 0) {
        // Calculate the new current amount after the deposit
        const newCurrentAmount = existingGoal.current_amount + deposit_amount;
        
        // Create a deposit record with timestamp
        const depositId = uuidv4();
        const depositDate = format(new Date(), 'yyyy-MM-dd');
        
        // Record the deposit in the deposits table
        db.prepare(`
          INSERT INTO deposits (id, user_id, savings_goal_id, amount, description, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          depositId,
          userIdNum,
          id,
          deposit_amount,
          deposit_description || `Deposit to ${existingGoal.name}`,
          depositDate
        );
        
        // Update the goal with the new current amount
        // Important: We're always using newCurrentAmount here, not any value from the request
        db.prepare(`
          UPDATE savings_goals
          SET name = ?, target_amount = ?, current_amount = ?, target_date = ?
          WHERE id = ? AND user_id = ?
        `).run(
          name || existingGoal.name,
          target_amount || existingGoal.target_amount,
          newCurrentAmount, // Always use calculated amount to ensure consistency
          target_date || existingGoal.target_date,
          id,
          userIdNum
        );
        
        // Log the successful deposit
        console.log(`Deposit of ${deposit_amount} recorded for goal '${existingGoal.name}' (${id}). New balance: ${newCurrentAmount}`);
      } else {
        // Regular update without deposit
        db.prepare(`
          UPDATE savings_goals
          SET name = ?, target_amount = ?, current_amount = ?, target_date = ?
          WHERE id = ? AND user_id = ?
        `).run(
          name || existingGoal.name,
          target_amount || existingGoal.target_amount,
          current_amount !== undefined ? current_amount : existingGoal.current_amount,
          target_date || existingGoal.target_date,
          id,
          userIdNum
        );
      }
    });
    
    // Execute the transaction
    transaction();

    // Get updated goal
    const updatedGoal = db.prepare(
      'SELECT * FROM savings_goals WHERE id = ?'
    ).get(id) as SavingsGoal;

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
    const { id } = await params;
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
    ).get(id, userIdNum);

    if (!existingGoal) {
      return NextResponse.json(
        { error: 'Savings goal not found or not owned by user' },
        { status: 404 }
      );
    }

    // Delete the goal
    db.prepare(
      'DELETE FROM savings_goals WHERE id = ? AND user_id = ?'
    ).run(id, userIdNum);

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

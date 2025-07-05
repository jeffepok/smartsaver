import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserById } from '@/lib/auth';

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

    // Database is already imported

    // Start a transaction
    db.prepare('BEGIN TRANSACTION').run();

    try {
      // Delete all transactions for this user
      db.prepare('DELETE FROM transactions WHERE user_id = ?').run(userId);

      // Delete all CSV files for this user
      db.prepare('DELETE FROM csv_files WHERE user_id = ?').run(userId);

      // Delete all savings goals for this user
      db.prepare('DELETE FROM savings_goals WHERE user_id = ?').run(userId);

      // Delete all budgets for this user
      db.prepare('DELETE FROM budgets WHERE user_id = ?').run(userId);

      // Commit the transaction
      db.prepare('COMMIT').run();

      return NextResponse.json(
        { success: true, message: 'All user data has been reset successfully' },
        { status: 200 }
      );
    } catch (error) {
      // Rollback the transaction if an error occurs
      db.prepare('ROLLBACK').run();
      throw error;
    }
  } catch (error) {
    console.error('Error resetting user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

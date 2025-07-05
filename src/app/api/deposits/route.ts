import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserById } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from session
    const userId = request.cookies.get('session_id')?.value;
    const searchParams = request.nextUrl.searchParams;
    const savingsGoalId = searchParams.get('savings_goal_id');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string, 10) : 10;

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

    // Get deposits based on the query parameters
    let query = `
      SELECT d.*
      FROM deposits d
      JOIN savings_goals g ON d.savings_goal_id = g.id
      WHERE d.user_id = ?
    `;
    const queryParams: any[] = [userIdNum];
    // Add savings goal filter if provided
    if (savingsGoalId) {
      query += ' AND d.savings_goal_id = ?';
      queryParams.push(savingsGoalId); // Don't parse as int - savings_goal_id is a UUID string
    }

    // Add sorting and limit
    query += ' ORDER BY d.created_at DESC LIMIT ?';
    queryParams.push(limit);

    // Execute query - we need to use explicit binding instead of spreading queryParams
    // because SQLite is strict about parameter types
    let stmt = db.prepare(query);

    let deposits;
    if (savingsGoalId && limit) {
      deposits = stmt.all(userIdNum, savingsGoalId, limit);
    } else if (savingsGoalId) {
      deposits = stmt.all(userIdNum, savingsGoalId);
    } else {
      deposits = stmt.all(userIdNum, limit);
    }

    return NextResponse.json({ deposits });
  } catch (error) {
    console.error('Error fetching deposits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

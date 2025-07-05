import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create response with cleared cookie
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );
    
    // Clear the session cookie
    response.cookies.delete('session_id');
    
    return response;
  } catch (error) {
    console.error('Error logging out:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

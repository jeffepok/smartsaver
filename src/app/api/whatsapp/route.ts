import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyWhatsAppNumber } from '@/utils/whatsappUtils';

// Define the user type for database query results
type UserRecord = {
  id?: number;
  email?: string;
  name?: string;
  whatsapp_number?: string;
  created_at?: string;
};

/**
 * GET endpoint to check if the user has a WhatsApp number registered
 */
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
    
    // Get the user's current whatsapp_number if exists
    const stmt = db.prepare(`
      SELECT whatsapp_number FROM users WHERE id = ?
    `);
    
    const user = stmt.get(userId) as UserRecord;
    
    return NextResponse.json({
      whatsapp_connected: !!user?.whatsapp_number,
      phone_number: user?.whatsapp_number || null
    });
  } catch (error) {
    console.error('Error checking WhatsApp connection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to register or update a user's WhatsApp number
 */
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

    // Parse request data
    const data = await request.json();
    
    // Validate phone number
    if (!data.phone_number) {
      return NextResponse.json(
        { error: 'Missing required field: phone_number' },
        { status: 400 }
      );
    }
    
    // Verify the WhatsApp number format (mock verification)
    const isValid = await verifyWhatsAppNumber(data.phone_number);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid WhatsApp number format' },
        { status: 400 }
      );
    }
    
    // Update the user's whatsapp_number in the database
    const updateStmt = db.prepare(`
      UPDATE users
      SET whatsapp_number = ?
      WHERE id = ?
    `);
    
    updateStmt.run(data.phone_number, userId);
    
    return NextResponse.json({
      success: true,
      message: 'WhatsApp number linked successfully'
    });
  } catch (error) {
    console.error('Error linking WhatsApp number:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

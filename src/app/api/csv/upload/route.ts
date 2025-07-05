import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { Transaction } from '@/types';

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
    
    // Parse the form data to get the CSV content
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Read the file content
    const content = await file.text();
    
    // Store the CSV file in the database
    const insertFile = db.prepare(
      'INSERT INTO csv_files (user_id, filename, content) VALUES (?, ?, ?)'
    );
    
    const result = insertFile.run(userId, file.name, content);
    const fileId = Number(result.lastInsertRowid);
    
    // Parse transactions from the request body
    const transactions = formData.get('transactions');
    
    if (transactions) {
      // Parse the JSON string to get the transactions array
      const parsedTransactions = JSON.parse(transactions as string) as Transaction[];
      
      // Store the transactions in the database
      const insertTransaction = db.prepare(`
        INSERT INTO transactions (
          id, user_id, date, description, amount, type, 
          account_number, currency, category, csv_file_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const insertMany = db.transaction((items: Transaction[]) => {
        for (const item of items) {
          insertTransaction.run(
            item.id,
            userId,
            item.date,
            item.description,
            item.amount,
            item.type || null,
            item.account_number || null,
            item.currency || null,
            item.category || null,
            fileId
          );
        }
      });
      
      insertMany(parsedTransactions);
    }
    
    return NextResponse.json({
      success: true,
      fileId,
      message: 'CSV file uploaded and processed successfully'
    });
  } catch (error) {
    console.error('Error uploading CSV file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

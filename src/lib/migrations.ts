import db from './db';

/**
 * Migration utility to safely add columns to existing tables
 */

export function runMigrations() {
  console.log('Running database migrations...');
  
  try {
    // Check if whatsapp_number column exists
    const tableInfo = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
    const hasWhatsAppColumn = tableInfo.some(column => column.name === 'whatsapp_number');
    
    if (!hasWhatsAppColumn) {
      console.log('Adding whatsapp_number column to users table...');
      db.exec(`
        ALTER TABLE users ADD COLUMN whatsapp_number TEXT;
      `);
      console.log('Successfully added whatsapp_number column');
    } else {
      console.log('whatsapp_number column already exists in users table');
    }
    
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Error running database migrations:', error);
  }
}

// Run migrations automatically when imported
runMigrations();

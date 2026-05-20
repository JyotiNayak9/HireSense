import { connectToDatabase } from './mongodb';

let dbInitialized = false;

export async function initializeDatabase() {
  if (dbInitialized) {
    return;
  }

  try {
    await connectToDatabase();
    dbInitialized = true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[DATABASE_INIT_ERROR]', message);
    throw new Error(`Failed to initialize database: ${message}`);
  }
}

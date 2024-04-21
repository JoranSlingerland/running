import { setupDatabase } from '@repo/mongodb';

setupDatabase().catch((error) => {
  console.error('Error setting up database:', error);
  process.exit(1);
});

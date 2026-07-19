require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  console.log("Starting database schema migration via direct PG client...");
  
  try {
    // 1. Create Doctor table
    console.log("Creating Doctor table if not exists...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Doctor" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE,
        "phone" TEXT,
        "isDeleted" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // 2. Add doctorId and doctorFee columns to SaleItem if they do not exist
    console.log("Adding doctorId and doctorFee columns to SaleItem...");
    await pool.query(`
      ALTER TABLE "SaleItem" ADD COLUMN IF NOT EXISTS "doctorId" INTEGER;
    `);
    await pool.query(`
      ALTER TABLE "SaleItem" ADD COLUMN IF NOT EXISTS "doctorFee" DOUBLE PRECISION NOT NULL DEFAULT 0;
    `);
    
    // 3. Add foreign key constraint if not exists
    console.log("Adding foreign key constraint from SaleItem to Doctor...");
    // To be safe, we check if the constraint already exists
    const constraintCheck = await pool.query(`
      SELECT constraint_name 
      FROM information_schema.constraint_column_usage 
      WHERE table_name = 'SaleItem' AND constraint_name = 'SaleItem_doctorId_fkey';
    `);
    
    if (constraintCheck.rows.length === 0) {
      await pool.query(`
        ALTER TABLE "SaleItem" 
        ADD CONSTRAINT "SaleItem_doctorId_fkey" 
        FOREIGN KEY ("doctorId") 
        REFERENCES "Doctor"("id") 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;
      `);
      console.log("Foreign key constraint added successfully.");
    } else {
      console.log("Foreign key constraint already exists.");
    }
    
    console.log("Database migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pool.end();
  }
}

migrate();

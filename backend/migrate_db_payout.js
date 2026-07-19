require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  console.log("Starting database schema migration (Doctor Fee Payout columns)...");
  
  try {
    console.log("Adding doctorFeePaid and doctorFeePaidAt columns to SaleItem...");
    await pool.query(`
      ALTER TABLE "SaleItem" ADD COLUMN IF NOT EXISTS "doctorFeePaid" BOOLEAN NOT NULL DEFAULT false;
    `);
    await pool.query(`
      ALTER TABLE "SaleItem" ADD COLUMN IF NOT EXISTS "doctorFeePaidAt" TIMESTAMP(3);
    `);
    
    console.log("Database migration (payout) completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pool.end();
  }
}

migrate();

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
  try {
    const users = await prisma.user.findMany();
    console.log("Users in DB:", users);
  } catch (err) {
    console.error("Error checking users:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

check();

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed() {
  const allPermissions = [
    'DASHBOARD', 'POS', 'USERS', 'ROLES', 'CUSTOMERS', 'SUPPLIERS', 
    'SALES', 'PURCHASES', 'CATEGORIES', 'PRODUCTS', 'INVENTORY', 
    'TRANSACTIONS', 'EXPENSES', 'REPORTS', 'PERFORMANCE', 
    'ENTITY_REPORT', 'PRODUCT_LEDGER', 'AGING_REPORT', 'SETTINGS',
    'DOCTORS', 'DOCTOR_REPORT',
    'DELETE_USER', 'DELETE_CUSTOMER', 'DELETE_SUPPLIER', 'DELETE_SALE', 
    'DELETE_PURCHASE', 'DELETE_CATEGORY', 'DELETE_PRODUCT', 'DELETE_EXPENSE'
  ];
  
  try {
    let adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });
    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: { name: 'Admin', permissions: allPermissions }
      });
      console.log('Created Default Admin Role');
    } else {
      // Keep Admin permissions up to date with new modules
      adminRole = await prisma.role.update({
        where: { id: adminRole.id },
        data: { permissions: allPermissions }
      });
      console.log('Updated Admin Role permissions with new modules');
    }

    const updated = await prisma.user.updateMany({
      where: { username: 'admin' },
      data: { roleId: adminRole.id }
    });
    console.log(`Updated ${updated.count} admin user(s) to use the new Admin role.`);
  } catch (error) {
    console.error("Error seeding roles:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
seed();
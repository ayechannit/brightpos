require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const productName = 'Spisav';
  
  const products = await prisma.product.findMany({
    where: {
      name: {
        contains: productName,
        mode: 'insensitive',
      },
      isDeleted: false,
    },
    include: {
      SaleItems: {
        where: {
          sale: { isDeleted: false }
        },
        include: {
          sale: true
        }
      },
      PurchaseItems: {
        where: {
          purchase: { isDeleted: false }
        },
        include: {
          purchase: true
        }
      },
    },
  });

  if (products.length === 0) {
    console.log(`Product "${productName}" not found.`);
    return;
  }

  const report = products.map(product => {
    const totalSales = product.SaleItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalPurchases = product.PurchaseItems.reduce((acc, item) => acc + item.quantity, 0);
    
    const salesDetails = product.SaleItems.map(item => ({
      date: item.sale.createdAt,
      quantity: item.quantity,
      price: item.price
    }));

    const purchaseDetails = product.PurchaseItems.map(item => ({
      date: item.purchase.createdAt,
      quantity: item.quantity,
      costPrice: item.costPrice
    }));

    return {
      name: product.name,
      currentStock: product.stock,
      totalSales,
      totalPurchases,
      salesDetails,
      purchaseDetails
    };
  });

  console.log(JSON.stringify(report, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_linyaungthit';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter }); 

const app = express();

app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
};

// --- Roles ---
app.get('/api/roles', async (req, res) => {
  try {
    const roles = await prisma.role.findMany({ 
      where: { isDeleted: false },
      orderBy: { name: 'asc' } 
    });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

app.post('/api/roles', async (req, res) => {
  const { name, permissions } = req.body;
  try {
    const role = await prisma.role.create({ data: { name, permissions } });
    res.json(role);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create role' });
  }
});

app.put('/api/roles/:id', async (req, res) => {
  const { id } = req.params;
  const { name, permissions } = req.body;
  try {
    const role = await prisma.role.update({
      where: { id: Number(id) },
      data: { name, permissions }
    });
    res.json(role);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update role' });
  }
});

app.delete('/api/roles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.role.update({ 
      where: { id: Number(id) },
      data: { isDeleted: true }
    });
    res.json({ message: 'Role deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete role' });
  }
});

// --- Users ---
app.post('/api/users/register', async (req, res) => {
  const { username, password, roleId } = req.body;
  try {
    if (!prisma.user) {
      console.error("prisma.user is undefined! Available models:", Object.keys(prisma).filter(k => !k.startsWith("_") && !k.startsWith("$")));
      return res.status(500).json({ error: 'Database configuration error: User model not found' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, roleId: roleId ? Number(roleId) : null },
      include: { role: true }
    });
    res.json({ id: user.id, username: user.username, role: user.role });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({ error: 'Username already exists or invalid data', details: error.message });
  }
});

app.post('/api/users/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ 
      where: { username },
      include: { role: true }
    });
    if (user && !user.isDeleted && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );
      res.json({ id: user.id, username: user.username, role: user.role, token });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

app.use('/api', authenticateToken);

// --- Everything else below will be protected by the middleware ---
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({ 
      where: { isDeleted: false },
      select: { id: true, username: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' } 
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.update({
      where: { id: Number(id) },
      data: { isDeleted: true }
    });
    res.json({ message: 'User deleted (Soft)' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete user' });
  }
});

// --- Categories ---
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ 
      where: { isDeleted: false },
      orderBy: { name: 'asc' } 
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', async (req, res) => {
  const { name } = req.body;
  try {
    const category = await prisma.category.create({ data: { name } });
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create category' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const category = await prisma.category.update({
      where: { id: Number(id) },
      data: { name }
    });
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update category' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.category.update({ 
      where: { id: Number(id) },
      data: { isDeleted: true }
    });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete category' });
  }
});

// --- Products ---
app.get('/api/products', async (req, res) => {
  const { categoryId } = req.query;
  try {
    let where = { isDeleted: false };
    if (categoryId) {
      where.categoryId = Number(categoryId);
    }
    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { name: 'asc' }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products', async (req, res) => {
  const { name, barcode, price, stock, categoryId } = req.body;
  try {
    const product = await prisma.product.create({
      data: { 
        name, 
        barcode: barcode === '' ? null : barcode, 
        price: Number(price), 
        stock: Number(stock),
        categoryId: categoryId ? Number(categoryId) : null
      },
      include: { category: true }
    });
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create product', details: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, barcode, price, stock, categoryId } = req.body;
  try {
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: { 
        name, 
        barcode: barcode === '' ? null : barcode, 
        price: Number(price), 
        stock: Number(stock),
        categoryId: categoryId ? Number(categoryId) : null
      },
      include: { category: true }
    });
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.product.update({ where: { id: Number(id) }, data: { isDeleted: true } });
    res.json({ message: 'Product deleted (Soft)' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete product' });
  }
});

// --- Customers ---
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({ 
      where: { isDeleted: false },
      orderBy: { name: 'asc' } 
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

app.post('/api/customers', async (req, res) => {
  const { name, phone, address } = req.body;
  try {
    const customer = await prisma.customer.create({ data: { name, phone, address } });
    res.json(customer);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create customer' });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  const { id } = req.params;
  const { name, phone, address } = req.body;
  try {
    const customer = await prisma.customer.update({
      where: { id: Number(id) },
      data: { name, phone, address }
    });
    res.json(customer);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update customer' });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.customer.update({ 
      where: { id: Number(id) },
      data: { isDeleted: true }
    });
    res.json({ message: 'Customer deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete customer' });
  }
});

// --- Suppliers ---
app.get('/api/suppliers', async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({ 
      where: { isDeleted: false },
      orderBy: { name: 'asc' } 
    });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

app.post('/api/suppliers', async (req, res) => {
  const { name, phone, address } = req.body;
  try {
    const supplier = await prisma.supplier.create({ data: { name, phone, address } });
    res.json(supplier);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create supplier' });
  }
});

app.put('/api/suppliers/:id', async (req, res) => {
  const { id } = req.params;
  const { name, phone, address } = req.body;
  try {
    const supplier = await prisma.supplier.update({
      where: { id: Number(id) },
      data: { name, phone, address }
    });
    res.json(supplier);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update supplier' });
  }
});

app.delete('/api/suppliers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.supplier.update({ 
      where: { id: Number(id) },
      data: { isDeleted: true }
    });
    res.json({ message: 'Supplier deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete supplier' });
  }
});

// --- Sales ---
app.get('/api/sales', async (req, res) => {
  const { startDate, endDate, voucherCode } = req.query;
  try {
    let where = { isDeleted: false };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const d = new Date(endDate);
        d.setHours(23, 59, 59, 999);
        where.createdAt.lte = d;
      }
    }
    if (voucherCode) {
      where.voucherCode = { contains: voucherCode, mode: 'insensitive' };
    }

    const sales = await prisma.sale.findMany({
      where,
      include: { 
        items: { include: { product: true } },
        transactions: true,
        customer: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error);
    res.status(500).json({ error: 'Failed to fetch sales', details: error.message });
  }
});

app.post('/api/sales', async (req, res) => {
  const { items, totalAmount, voucherCode, paidAmount, customerId, nonRefundableFee, refundableFee, nonRefundableClinicFee, refundableClinicFee } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'No items selected for sale.' });
  }

  const paid = Number(paidAmount) || 0;
  const nrf = Number(nonRefundableFee) || 0;
  const rf = Number(refundableFee) || 0;
  const ncf = Number(nonRefundableClinicFee) || 0;
  const rcf = Number(refundableClinicFee) || 0;
  const total = Number(totalAmount) + nrf + rf + ncf + rcf;
  const due = total - paid;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          totalAmount: total,
          paidAmount: paid,
          dueAmount: due,
          nonRefundableFee: nrf,
          refundableFee: rf,
          nonRefundableClinicFee: ncf,
          refundableClinicFee: rcf,
          voucherCode: voucherCode || `INV-${Date.now()}`,
          customerId: customerId ? Number(customerId) : null,
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        }
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      if (paid > 0) {
        await tx.transaction.create({
          data: {
            type: 'DEBIT',
            category: 'SALE',
            amount: paid,
            description: `Payment for Sale ${sale.voucherCode}`,
            saleId: sale.id
          }
        });
      }

      return sale;
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to process sale' });
  }
});

app.delete('/api/sales/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.sale.findUnique({ where: { id: Number(id) }, include: { items: true } });
    if (!existing) return res.status(404).json({ error: 'Sale not found' });
    for (const item of existing.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } }
      });
    }
    await prisma.sale.update({ where: { id: Number(id) }, data: { isDeleted: true } });
    res.json({ message: 'Sale deleted (Soft)' });
  } catch (error) {
    res.status(400).json({ error: 'Failed' });
  }
});

// --- Purchases ---
app.get('/api/purchases', async (req, res) => {
  const { startDate, endDate, supplierId } = req.query;
  try {
    let where = { isDeleted: false };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const d = new Date(endDate);
        d.setHours(23, 59, 59, 999);
        where.createdAt.lte = d;
      }
    }
    if (supplierId) {
      where.supplierId = Number(supplierId);
    }
    const purchases = await prisma.purchase.findMany({
      where,
      include: { 
        items: { include: { product: true } },
        transactions: true,
        supplier: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.post('/api/purchases', async (req, res) => {
  const { supplierId, supplierName, totalAmount, items, paidAmount } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'No items selected for purchase.' });
  }

  const paid = Number(paidAmount) || 0;
  const total = Number(totalAmount);
  const due = total - paid;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.create({
        data: {
          supplierId: supplierId ? Number(supplierId) : null,
          supplierName, 
          totalAmount: total,
          paidAmount: paid,
          dueAmount: due,
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              costPrice: item.costPrice,
              expiryDate: item.expiryDate ? new Date(item.expiryDate) : null
            }))
          }
        }
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
      }

      if (paid > 0) {
        await tx.transaction.create({
          data: {
            type: 'CREDIT',
            category: 'PURCHASE',
            amount: paid,
            description: `Payment for Purchase ${purchase.id}`,
            purchaseId: purchase.id
          }
        });
      }

      return purchase;
    });

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: 'Failed' });
  }
});

app.delete('/api/purchases/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.purchase.findUnique({ where: { id: Number(id) }, include: { items: true } });
    if (!existing) return res.status(404).json({ error: 'Purchase not found' });
    
    await prisma.$transaction(async (tx) => {
      for (const item of existing.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }
      await tx.purchase.update({ where: { id: Number(id) }, data: { isDeleted: true } });
    });
    
    res.json({ message: 'Purchase deleted (Soft)' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed' });
  }
});

// --- Expenses ---
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({ 
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' } 
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.post('/api/expenses', async (req, res) => {
  const { description, amount } = req.body;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: { description, amount: Number(amount) }
      });
      await tx.transaction.create({
        data: {
          type: 'CREDIT',
          category: 'EXPENSE',
          amount: Number(amount),
          description: `Expense: ${description}`,
          expenseId: expense.id
        }
      });
      return expense;
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: 'Failed' });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.expense.update({ where: { id: Number(id) }, data: { isDeleted: true } });
    res.json({ message: 'Expense deleted (Soft)' });
  } catch (error) {
    res.status(400).json({ error: 'Failed' });
  }
});

// --- Transactions ---
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      include: { 
        sale: { include: { customer: true } }, 
        purchase: { include: { supplier: true } }, 
        expense: true 
      }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

app.post('/api/transactions/payment', async (req, res) => {
  const { type, id, amount, description } = req.body;
  try {
    const result = await prisma.$transaction(async (tx) => {
      if (type === 'SALE') {
        const sale = await tx.sale.update({
          where: { id: Number(id) },
          data: {
            paidAmount: { increment: Number(amount) },
            dueAmount: { decrement: Number(amount) }
          }
        });
        await tx.transaction.create({
          data: {
            type: 'DEBIT',
            category: 'PAYMENT_RECEIVED',
            amount: Number(amount),
            description: description || `Payment for Sale ${sale.voucherCode}`,
            saleId: sale.id
          }
        });
        return sale;
      } else if (type === 'PURCHASE') {
        const purchase = await tx.purchase.update({
          where: { id: Number(id) },
          data: {
            paidAmount: { increment: Number(amount) },
            dueAmount: { decrement: Number(amount) }
          }
        });
        await tx.transaction.create({
          data: {
            type: 'CREDIT',
            category: 'PAYMENT_MADE',
            amount: Number(amount),
            description: description || `Payment for Purchase ${purchase.id}`,
            purchaseId: purchase.id
          }
        });
        return purchase;
      }
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: 'Failed to record payment' });
  }
});

// --- Dashboard & Reports ---
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const productCount = await prisma.product.count({ where: { isDeleted: false } });
    const salesToday = await prisma.sale.findMany({
      where: { isDeleted: false, createdAt: { gte: startOfDay } }
    });
    // totalAmount already includes both fees
    const totalRevenueToday = salesToday.reduce((sum, sale) => sum + sale.totalAmount, 0);
    res.json({ productCount, salesCountToday: salesToday.length, revenueToday: totalRevenueToday });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.get('/api/reports/financial', async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    let whereClause = { isDeleted: false };
    let transWhere = {};
    if (startDate || endDate) {
      whereClause.createdAt = {};
      transWhere.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
        transWhere.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const d = new Date(endDate);
        d.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = d;
        transWhere.createdAt.lte = d;
      }
    }

    // 1. Sales Metrics (Accrual Basis)
    const salesAgg = await prisma.sale.aggregate({
      where: whereClause,
      _sum: { 
        totalAmount: true, 
        paidAmount: true, 
        dueAmount: true, 
        nonRefundableFee: true, 
        refundableFee: true,
        nonRefundableClinicFee: true,
        refundableClinicFee: true
      }
    });

    // 2. Purchase Metrics (Accrual Basis)
    const purchaseAgg = await prisma.purchase.aggregate({
      where: whereClause,
      _sum: { totalAmount: true, paidAmount: true, dueAmount: true }
    });

    // 3. Cash Flow Metrics (Cash Basis via Transactions)
    const transAgg = await prisma.transaction.groupBy({
      by: ['type'],
      where: transWhere,
      _sum: { amount: true }
    });

    // 4. Inventory Value (Asset) - Current Snapshot
    const products = await prisma.product.findMany({ where: { isDeleted: false } });
    const inventoryValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0); // Valuation at Retail Price

    // 5. Expense Breakdown
    const expenseBreakdown = await prisma.expense.findMany({
      where: whereClause,
      orderBy: { amount: 'desc' }
    });

    // Revenue includes total sales amount (which has both fees)
    const revenue = salesAgg._sum.totalAmount || 0;
    const totalServiceFees = (salesAgg._sum.nonRefundableFee || 0) + (salesAgg._sum.refundableFee || 0);
    const totalClinicFees = (salesAgg._sum.nonRefundableClinicFee || 0) + (salesAgg._sum.refundableClinicFee || 0);
    const productRevenue = revenue - totalServiceFees - totalClinicFees;

    const costOfGoods = purchaseAgg._sum.totalAmount || 0;
    const grossProfit = revenue - costOfGoods;
    
    const cashIn = transAgg.find(a => a.type === 'DEBIT')?._sum.amount || 0;
    const cashOut = transAgg.find(a => a.type === 'CREDIT')?._sum.amount || 0;

    res.json({ 
      summary: {
        totalRevenue: revenue,
        productRevenue,
        totalServiceFees,
        nonRefundableFees: salesAgg._sum.nonRefundableFee || 0,
        refundableFees: salesAgg._sum.refundableFee || 0,
        totalClinicFees,
        nonRefundableClinicFees: salesAgg._sum.nonRefundableClinicFee || 0,
        refundableClinicFees: salesAgg._sum.refundableClinicFee || 0,
        totalPurchases: costOfGoods,
        grossProfit: grossProfit,
        totalExpenses: expenseBreakdown.reduce((sum, e) => sum + e.amount, 0),
        netProfit: grossProfit - expenseBreakdown.reduce((sum, e) => sum + e.amount, 0),
        cashIn,
        cashOut,
        netCashFlow: cashIn - cashOut
      },
      balanceSheet: {
        accountsReceivable: salesAgg._sum.dueAmount || 0,
        accountsPayable: purchaseAgg._sum.dueAmount || 0,
        inventoryValue: inventoryValue
      },
      expenseBreakdown
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate financial report' });
  }
});

app.get('/api/reports/sales-performance', async (req, res) => {
  const { startDate, endDate, categoryId } = req.query;
  try {
    let whereClause = { sale: { isDeleted: false } };
    if (startDate || endDate) {
      whereClause.sale.createdAt = {};
      if (startDate) whereClause.sale.createdAt.gte = new Date(startDate);
      if (endDate) {
        const d = new Date(endDate);
        d.setHours(23, 59, 59, 999);
        whereClause.sale.createdAt.lte = d;
      }
    }
    
    if (categoryId) {
      whereClause.product = { categoryId: Number(categoryId) };
    }

    const itemSales = await prisma.saleItem.findMany({
      where: whereClause,
      include: { product: { include: { category: true } } }
    });

    // Aggregate by Product
    const performance = itemSales.reduce((acc, item) => {
      const pId = item.productId;
      if (!acc[pId]) {
        acc[pId] = {
          name: item.product.name,
          barcode: item.product.barcode || 'N/A',
          category: item.product.category?.name || 'N/A',
          currentStock: item.product.stock,
          totalQty: 0,
          totalRevenue: 0
        };
      }
      acc[pId].totalQty += item.quantity;
      acc[pId].totalRevenue += (item.quantity * item.price);
      return acc;
    }, {});

    const result = Object.values(performance).sort((a, b) => b.totalRevenue - a.totalRevenue);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed' });
  }
});

app.get('/api/reports/customers', async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate);
      if (endDate) {
        const d = new Date(endDate);
        d.setHours(23, 59, 59, 999);
        dateFilter.createdAt.lte = d;
      }
    }
    const customers = await prisma.customer.findMany({
      include: { sales: { where: { isDeleted: false, ...dateFilter } } }
    });
    const result = customers.map(c => {
      const totalSales = c.sales.reduce((sum, s) => sum + s.totalAmount, 0);
      const totalPaid = c.sales.reduce((sum, s) => sum + s.paidAmount, 0);
      const totalDue = c.sales.reduce((sum, s) => sum + s.dueAmount, 0);
      return { id: c.id, name: c.name, phone: c.phone, totalSales, totalPaid, totalDue };
    });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed' });
  }
});

app.get('/api/reports/suppliers', async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate);
      if (endDate) {
        const d = new Date(endDate);
        d.setHours(23, 59, 59, 999);
        dateFilter.createdAt.lte = d;
      }
    }
    const suppliers = await prisma.supplier.findMany({
      include: { purchases: { where: { isDeleted: false, ...dateFilter } } }
    });
    const result = suppliers.map(s => {
      const totalPurchases = s.purchases.reduce((sum, p) => sum + p.totalAmount, 0);
      const totalPaid = s.purchases.reduce((sum, p) => sum + p.paidAmount, 0);
      const totalDue = s.purchases.reduce((sum, p) => sum + p.dueAmount, 0);
      return { id: s.id, name: s.name, phone: s.phone, totalPurchases, totalPaid, totalDue };
    });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed' });
  }
});

app.get('/api/reports/product-ledger', async (req, res) => {
  const { startDate, endDate, categoryId } = req.query;
  try {
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate);
      if (endDate) {
        const d = new Date(endDate);
        d.setHours(23, 59, 59, 999);
        dateFilter.createdAt.lte = d;
      }
    }

    let productWhere = { isDeleted: false };
    if (categoryId) {
      productWhere.categoryId = Number(categoryId);
    }

    const products = await prisma.product.findMany({ 
      where: productWhere,
      include: { category: true },
      orderBy: { name: 'asc' } 
    });
    
    // Extract filtered product IDs
    const productIds = products.map(p => p.id);

    const saleItems = await prisma.saleItem.findMany({
      where: { 
        sale: { isDeleted: false, ...dateFilter },
        productId: { in: productIds }
      }
    });
    const purchaseItems = await prisma.purchaseItem.findMany({
      where: { 
        purchase: { isDeleted: false, ...dateFilter },
        productId: { in: productIds }
      }
    });

    const saleMap = saleItems.reduce((acc, item) => {
      acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
      return acc;
    }, {});
    
    const purchMap = purchaseItems.reduce((acc, item) => {
      acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
      return acc;
    }, {});

    const result = products.map(p => ({
      id: p.id,
      name: p.name,
      barcode: p.barcode || 'N/A',
      category: p.category?.name || 'N/A',
      purchasedQty: purchMap[p.id] || 0,
      soldQty: saleMap[p.id] || 0,
      netChange: (purchMap[p.id] || 0) - (saleMap[p.id] || 0),
      currentStock: p.stock
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed' });
  }
});

app.get('/api/reports/aging', async (req, res) => {
  try {
    const unpaidSales = await prisma.sale.findMany({
      where: { isDeleted: false, dueAmount: { gt: 0 } },
      include: { customer: true }
    });

    const unpaidPurchases = await prisma.purchase.findMany({
      where: { isDeleted: false, dueAmount: { gt: 0 } },
      include: { supplier: true }
    });

    const now = new Date();

    const processAging = (records, entityKey) => {
      const aging = {};
      records.forEach(record => {
        // Group by explicitly linked ID, or fallback to 'unlinked' to sum all walk-ins together
        const entityId = record[entityKey]?.id || 'unlinked'; 
        
        let entityName = 'Unknown';
        if (entityKey === 'customer') {
           entityName = record.customer?.name || 'Walk-in Customer';
        } else if (entityKey === 'supplier') {
           entityName = record.supplier?.name || record.supplierName || 'Unknown Supplier';
        }

        const daysOld = Math.floor((now - new Date(record.createdAt)) / (1000 * 60 * 60 * 24));

        if (!aging[entityId]) {
          aging[entityId] = { name: entityName, current: 0, days30: 0, days60: 0, days90: 0, total: 0 };
        }

        const amount = record.dueAmount;
        aging[entityId].total += amount;

        if (daysOld <= 30) aging[entityId].current += amount;
        else if (daysOld <= 60) aging[entityId].days30 += amount;
        else if (daysOld <= 90) aging[entityId].days60 += amount;
        else aging[entityId].days90 += amount;
      });
      return Object.values(aging).sort((a, b) => b.total - a.total);
    };

    res.json({
      receivables: processAging(unpaidSales, 'customer'),
      payables: processAging(unpaidPurchases, 'supplier')
    });

  } catch(error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate aging report' });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    let setting = await prisma.setting.findFirst();
    if (!setting) setting = { shopName: 'Lin Yaung Thit', shopAddress: '', shopPhone: '', printerWidth: 80, printerHeight: null };
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.post('/api/settings', async (req, res) => {
  const { shopName, shopAddress, shopPhone, printerWidth, printerHeight } = req.body;
  try {
    const existing = await prisma.setting.findFirst();
    let setting;
    if (existing) {
      setting = await prisma.setting.update({
        where: { id: existing.id },
        data: { shopName, shopAddress, shopPhone, printerWidth, printerHeight }
      });
    } else {
      setting = await prisma.setting.create({
        data: { shopName, shopAddress, shopPhone, printerWidth, printerHeight }
      });
    }
    res.json(setting);
  } catch (error) {
    res.status(400).json({ error: 'Failed' });
  }
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

# BrightPOS (Lin Yaung Thit) - User Manual

## Table of Contents
1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
3. [Point of Sale (POS)](#3-point-of-sale-pos)
4. [Inventory Management](#4-inventory-management)
5. [Sales & Purchases History](#5-sales--purchases-history)
6. [People (Customers & Suppliers)](#6-people-customers--suppliers)
7. [Finances & Expenses](#7-finances--expenses)
8. [Reporting](#8-reporting)
9. [Administration & Settings](#9-administration--settings)

---

## 1. Introduction
Welcome to **BrightPOS**, the comprehensive Point of Sale and Inventory Management system designed for your business. This manual will guide you through the features and modules available in the system, ensuring you can efficiently manage your sales, stock, customers, and financial reports.

## 2. Getting Started
### Logging In
1. Navigate to the BrightPOS login page.
2. Enter your **Username** and **Password**.
3. Click **Sign In**.

### The Dashboard
Upon logging in, you will see the Dashboard, which provides a quick overview of your business for the current day:
*   **Total Products**: The number of unique products in your catalog.
*   **Sales Today**: The total number of sales transactions completed today.
*   **Revenue Today**: The total revenue generated today (including fees).

Use the sidebar navigation menu on the left to access different modules of the system.

---

## 3. Point of Sale (POS)
The POS screen is where you process daily transactions.

### Making a Sale
1. **Add Products**: Scan a barcode or search for a product using the "Search catalog..." dropdown.
2. **Adjust Quantity**: In the cart, use the **+** and **-** buttons to adjust the quantity of each item.
3. **Select Customer**: (Optional) Search for an existing customer or click the "Add Person" icon to quickly register a new walk-in customer.
4. **Apply Fees**: You can add an optional *Non-Refundable Fee* (e.g., delivery) or *Refundable Fee* (e.g., bottle deposit).
5. **Payment**: Enter the amount the customer is paying in the **Paid Amount (Ks)** field. The system will automatically calculate the change or the remaining due balance.
6. **Complete Sale**: Click the **Complete Sale & Print** button. The system will process the transaction, deduct the items from your inventory, and open a print dialog for the receipt. *(Note: You cannot complete a sale with an empty cart).*

---

## 4. Inventory Management
Keep track of what you sell and ensure you never run out of stock.

### Categories
Organize your products by grouping them into categories (e.g., Electronics, Groceries).
*   Go to **Categories** to Add, Edit, or Delete product categories.

### Products
Manage your product catalog.
*   Go to **Products** and click **New Product**.
*   Enter the Name, Barcode (optional), Retail Price, Initial Stock, and select a Category.
*   **Note**: To manually adjust stock, you should ideally use the **Purchases** module to keep financial records accurate.

---

## 5. Sales & Purchases History
### Sales
*   View all past sales vouchers under the **Sales** menu.
*   **Filters**: Filter by Date Range or Voucher Code.
*   **Payments**: If a customer bought on credit (Unpaid/Due), click the **Payment** (Credit Card) icon to record a new payment against that specific sale.
*   **Delete**: Deleting a sale will automatically return the sold items back to your inventory stock.

### Purchases (Restock)
*   Use the **Purchases** menu when buying new stock from Suppliers.
*   Click **New Purchase**, select a Supplier, and add products to the purchase cart along with their *Cost Price* and *Quantity*.
*   Completing a purchase automatically **increases** your inventory stock and logs the expense.
*   Like sales, you can track Unpaid purchases and make payments to your suppliers over time.

---

## 6. People (Customers & Suppliers)
*   **Customers**: View your customer database. See their total lifetime sales, total paid, and total due (credit).
*   **Suppliers**: Manage the vendors you buy stock from. View your total purchase history and any outstanding balances you owe them.

---

## 7. Finances & Expenses
### Expenses
*   Record business expenses that are not related to buying inventory (e.g., Utility Bills, Rent, Salaries).
*   Go to **Expenses**, click **Add Expense**, and enter a description and amount.

### Transactions
*   The **Transactions** screen provides a chronological ledger of *all* cash flows in and out of the business.
*   This includes Sales payments (Cash In), Purchase payments (Cash Out), and Manual Expenses (Cash Out).

---

## 8. Reporting
BrightPOS offers powerful reporting tools to analyze your business health.

*   **Financial Report**: View Accrual and Cash-basis summaries, Revenue, Cost of Goods Sold (COGS), Gross Profit, and Net Cash Flow. Includes a Balance Sheet snapshot.
*   **Performance Report**: See which products are your best-sellers by Revenue and Quantity.
*   **Entity Report**: Analyze sales by Customer or purchases by Supplier over a specific date range.
*   **Product Ledger**: Track the movement of individual products (Starting stock, Sold Qty, Purchased Qty, Net Change).
*   **Aging Report**: Crucial for tracking debts. Shows accounts receivable (who owes you) and accounts payable (who you owe), categorized by how old the debt is (Current, 30 days, 60 days, 90+ days).

---

## 9. Administration & Settings
### Users & Roles
Control who has access to the system.
*   **Roles**: Create roles (e.g., Manager, Cashier) and assign specific permissions. For example, a Cashier might have access to the POS but not Financial Reports or the ability to Delete Sales.
*   **Users**: Create user accounts for your staff and assign them a Role.

### Settings
*   **Shop Details**: Update your Shop Name, Address, and Phone Number. These details appear on printed receipts.
*   **Printer Settings**: Configure your receipt printer width (usually 58mm or 80mm) to ensure receipts print correctly.

---
*Generated by BrightPOS System*

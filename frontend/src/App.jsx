import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Categories from './pages/Categories';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import Inventory from './pages/Inventory';
import Expenses from './pages/Expenses';
import FinancialReport from './pages/FinancialReport';
import Settings from './pages/Settings';
import Transactions from './pages/Transactions';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import PerformanceReport from './pages/PerformanceReport';
import EntityReport from './pages/EntityReport';
import ProductLedgerReport from './pages/ProductLedgerReport';
import AgingReport from './pages/AgingReport';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="pos" element={<POS />} />
        <Route path="categories" element={<Categories />} />
        <Route path="products" element={<Products />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="purchases" element={<Purchases />} />
        <Route path="sales" element={<Sales />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="customers" element={<Customers />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="reports" element={<FinancialReport />} />
        <Route path="performance" element={<PerformanceReport />} />
        <Route path="entity-report" element={<EntityReport />} />
        <Route path="product-ledger" element={<ProductLedgerReport />} />
        <Route path="aging-report" element={<AgingReport />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;

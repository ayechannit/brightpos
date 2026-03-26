import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('user');
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// --- Auth ---
export const registerUser = async (username, password, roleId) => {
  const response = await api.post('/users/register', { username, password, roleId });
  return response.data;
};

export const loginUser = async (username, password) => {
  const response = await api.post('/users/login', { username, password });
  return response.data;
};

export const getUsers = async () => (await api.get('/users')).data;
export const deleteUser = async (id) => (await api.delete(`/users/${id}`)).data;

// --- Roles ---
export const getRoles = async () => (await api.get('/roles')).data;
export const createRole = async (data) => (await api.post('/roles', data)).data;
export const updateRole = async (id, data) => (await api.put(`/roles/${id}`, data)).data;
export const deleteRole = async (id) => (await api.delete(`/roles/${id}`)).data;

// --- Categories ---
export const getCategories = async () => (await api.get('/categories')).data;
export const createCategory = async (name) => (await api.post('/categories', { name })).data;
export const updateCategory = async (id, name) => (await api.put(`/categories/${id}`, { name })).data;
export const deleteCategory = async (id) => (await api.delete(`/categories/${id}`)).data;

// --- Products ---
export const getProducts = async (categoryId) => (await api.get('/products', { params: { categoryId } })).data;
export const createProduct = async (data) => (await api.post('/products', data)).data;
export const updateProduct = async (id, data) => (await api.put(`/products/${id}`, data)).data;
export const deleteProduct = async (id) => (await api.delete(`/products/${id}`)).data;

// --- Customers ---
export const getCustomers = async () => (await api.get('/customers')).data;
export const createCustomer = async (data) => (await api.post('/customers', data)).data;
export const updateCustomer = async (id, data) => (await api.put(`/customers/${id}`, data)).data;

// --- Suppliers ---
export const getSuppliers = async () => (await api.get('/suppliers')).data;
export const createSupplier = async (data) => (await api.post('/suppliers', data)).data;
export const updateSupplier = async (id, data) => (await api.put(`/suppliers/${id}`, data)).data;

// --- Sales ---
export const getSales = async (filters) => (await api.get('/sales', { params: filters })).data;
export const createSale = async (data) => (await api.post('/sales', data)).data;
export const deleteSale = async (id) => (await api.delete(`/sales/${id}`)).data;

// --- Purchases ---
export const getPurchases = async (filters) => (await api.get('/purchases', { params: filters })).data;
export const createPurchase = async (data) => (await api.post('/purchases', data)).data;

// --- Expenses ---
export const getExpenses = async () => (await api.get('/expenses')).data;
export const createExpense = async (data) => (await api.post('/expenses', data)).data;

// --- Transactions ---
export const getTransactions = async () => (await api.get('/transactions')).data;
export const recordPayment = async (data) => (await api.post('/transactions/payment', data)).data;

// --- Dashboard & Reports ---
export const getDashboardStats = async () => (await api.get('/dashboard/stats')).data;
export const getFinancialReport = async (filters) => (await api.get('/reports/financial', { params: filters })).data;
export const getSalesPerformanceReport = async (filters) => (await api.get('/reports/sales-performance', { params: filters })).data;
export const getCustomerReport = async (filters) => (await api.get('/reports/customers', { params: filters })).data;
export const getSupplierReport = async (filters) => (await api.get('/reports/suppliers', { params: filters })).data;
export const getProductLedgerReport = async (filters) => (await api.get('/reports/product-ledger', { params: filters })).data;
export const getAgingReport = async () => (await api.get('/reports/aging')).data;

// --- Settings ---
export const getSettings = async () => (await api.get('/settings')).data;
export const saveSettings = async (data) => (await api.post('/settings', data)).data;

export default api;

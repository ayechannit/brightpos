import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Autocomplete, IconButton, Grid, Collapse, Tabs, Tab, Chip, Divider, TableContainer } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentIcon from '@mui/icons-material/Payment';
import AddIcon from '@mui/icons-material/Add';
import { useOutletContext } from 'react-router-dom';
import api from '../api';

function Row({ purchase, onDelete, onPay, canDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{purchase.id}</TableCell>
        <TableCell>{new Date(purchase.createdAt).toLocaleString()}</TableCell>
        <TableCell>{purchase.supplier?.name || purchase.supplierName || 'N/A'}</TableCell>
        <TableCell align="right" sx={{ fontWeight: 'bold' }}>{purchase.totalAmount.toLocaleString()} Ks</TableCell>
        <TableCell align="right" sx={{ color: 'success.main' }}>{purchase.paidAmount.toLocaleString()} Ks</TableCell>
        <TableCell align="right" sx={{ color: 'error.main' }}>{purchase.dueAmount.toLocaleString()} Ks</TableCell>
        <TableCell align="center">
          <Chip 
            label={purchase.dueAmount > 0 ? 'Unpaid' : 'Paid'} 
            color={purchase.dueAmount > 0 ? 'error' : 'success'} 
            size="small" 
          />
        </TableCell>
        <TableCell align="right">
          {purchase.dueAmount > 0 && (
            <IconButton color="primary" onClick={() => onPay(purchase)} title="Make Payment">
              <PaymentIcon />
            </IconButton>
          )}
          {canDelete && (
            <IconButton color="error" onClick={() => onDelete(purchase.id)} title="Delete Purchase">
              <DeleteIcon />
            </IconButton>
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">Items</Typography>
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Cost Price</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {purchase.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product?.name}</TableCell>
                        <TableCell align="right">{item.costPrice.toLocaleString()} Ks</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{(item.costPrice * item.quantity).toLocaleString()} Ks</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {purchase.transactions && purchase.transactions.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom component="div" sx={{ mt: 2 }}>Payment History</Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell align="right">Amount Paid</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {purchase.transactions.map((t) => (
                          <TableRow key={t.id}>
                            <TableCell>{new Date(t.createdAt).toLocaleString()}</TableCell>
                            <TableCell align="right">{t.amount.toLocaleString()} Ks</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function Purchases() {
  const { user } = useOutletContext();
  const canDelete = user?.role?.permissions?.includes('DELETE_PURCHASE');
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', supplierId: '' });
  const [tabValue, setTabValue] = useState(0);
  
  // New Purchase State
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [paidAmount, setPaidAmount] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [costPrice, setCostPrice] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  // Payment Modal State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [payAmount, setPayAmount] = useState('');

  // New Supplier Modal State
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', phone: '', address: '' });

  const fetchPurchases = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.supplierId) params.append('supplierId', filters.supplierId);

      const res = await api.get(`/purchases?${params.toString()}`).catch(() => ({ data: [] }));
      setPurchases(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchData = async () => {
    try {
      fetchPurchases();
      const [prRes, supRes] = await Promise.all([
        api.get('/products').catch(() => ({ data: [] })),
        api.get('/suppliers').catch(() => ({ data: [] }))
      ]);
      setProducts(prRes.data);
      setSuppliers(supRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = () => {
    fetchPurchases();
  };

  const handleClearFilters = () => {
    setFilters({ startDate: '', endDate: '', supplierId: '' });
    api.get('/purchases').then(res => setPurchases(res.data || []));
  };

  const addToCart = () => {
    if (!selectedProduct || !costPrice || qty <= 0) return;
    setCart([...cart, { 
      product: selectedProduct, 
      quantity: Number(qty), 
      costPrice: Number(costPrice), 
      expiryDate 
    }]);
    setSelectedProduct(null);
    setQty(1);
    setCostPrice('');
    setExpiryDate('');
  };

  const removeCartItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (cart.length === 0) return;
    
    const totalAmount = cart.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
    const payload = {
      supplierId: selectedSupplier?.id || null,
      supplierName: selectedSupplier?.name || '',
      totalAmount,
      paidAmount: Number(paidAmount) || 0,
      items: cart.map(c => ({
        productId: c.product.id,
        quantity: c.quantity,
        costPrice: c.costPrice,
        expiryDate: c.expiryDate || null
      }))
    };

    try {
      await api.post('/purchases', payload);
      setOpen(false);
      setCart([]);
      setSelectedSupplier(null);
      setPaidAmount('');
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to save purchase.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this purchase? This will decrease the inventory stock automatically.")) {
      try {
        await api.delete(`/purchases/${id}`);
        fetchPurchases();
      } catch (error) {
        console.error("Failed to delete purchase", error);
      }
    }
  };

  const handleOpenPay = (purchase) => {
    setSelectedPurchase(purchase);
    setPayAmount(purchase.dueAmount);
    setPayModalOpen(true);
  };

  const handleClosePay = () => {
    setPayModalOpen(false);
    setSelectedPurchase(null);
    setPayAmount('');
  };

  const handleProcessPayment = async () => {
    if (!selectedPurchase || !payAmount) return;
    try {
      await api.post('/transactions/payment', {
        type: 'PURCHASE',
        id: selectedPurchase.id,
        amount: Number(payAmount)
      });
      handleClosePay();
      fetchPurchases(); // Refresh list
    } catch (error) {
      console.error(error);
      alert('Failed to process payment');
    }
  };

  const handleSaveSupplier = async () => {
    if (!newSupplier.name) return;
    try {
      const res = await api.post('/suppliers', newSupplier);
      const createdSupplier = res.data;
      setSuppliers([...suppliers, createdSupplier]);
      setSelectedSupplier(createdSupplier);
      setSupplierModalOpen(false);
      setNewSupplier({ name: '', phone: '', address: '' });
    } catch (error) {
      console.error("Failed to create supplier", error);
      alert("Failed to create supplier.");
    }
  };

  const totalCartAmount = cart.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);

  const filteredPurchases = purchases.filter((p) => {
    if (tabValue === 1) return p.dueAmount === 0; // Paid
    if (tabValue === 2) return p.dueAmount > 0;   // Unpaid
    return true; // All
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Purchases / Restock</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>New Purchase</Button>
      </Box>

      {/* Filter Section */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField 
          label="Start Date" type="date" name="startDate"
          InputLabelProps={{ shrink: true }} size="small"
          value={filters.startDate} onChange={handleFilterChange}
        />
        <TextField 
          label="End Date" type="date" name="endDate"
          InputLabelProps={{ shrink: true }} size="small"
          value={filters.endDate} onChange={handleFilterChange}
        />
        <Autocomplete
          size="small"
          sx={{ minWidth: 200 }}
          options={suppliers}
          getOptionLabel={(option) => option.name}
          value={suppliers.find(s => s.id === Number(filters.supplierId)) || null}
          onChange={(e, val) => setFilters({ ...filters, supplierId: val ? val.id : '' })}
          renderInput={(params) => <TextField {...params} label="Supplier" />}
        />
        <Button variant="contained" onClick={handleApplyFilters}>Filter</Button>
        <Button variant="outlined" color="secondary" onClick={handleClearFilters}>Clear</Button>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} indicatorColor="primary" textColor="primary" centered>
          <Tab label="All Purchases" />
          <Tab label="Fully Paid" />
          <Tab label="Unpaid / Credit" />
        </Tabs>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Paid</TableCell>
              <TableCell align="right">Due</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPurchases.map((purchase) => (
              <Row key={purchase.id} purchase={purchase} onDelete={handleDelete} onPay={handleOpenPay} canDelete={canDelete} />
            ))}
            {filteredPurchases.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">No purchases found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Record Purchase Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 3 }}>
          <Typography variant="h5" fontWeight="bold">Record New Purchase</Typography>
          <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Restock inventory from your suppliers</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: 'background.default' }}>
          
          {/* Supplier Section */}
          <Box sx={{ p: 3, bgcolor: 'background.paper', mb: 2 }}>
            <Typography variant="h6" fontWeight="600" color="primary.dark" gutterBottom>1. Supplier Details</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <Autocomplete
                    fullWidth
                    sx={{ 
                      flexGrow: 1,
                      '& .MuiAutocomplete-input': {
                        minWidth: '250px !important' // Force a wider minimum width for the input field
                      }
                    }}
                    options={suppliers}
                    getOptionLabel={(option) => option.name}
                    value={selectedSupplier}
                    onChange={(e, val) => setSelectedSupplier(val)}
                    renderInput={(params) => <TextField {...params} label="Select Supplier" variant="outlined" placeholder="Search suppliers..." fullWidth />}
                  />
                  <IconButton 
                    color="primary" 
                    onClick={() => setSupplierModalOpen(true)} 
                    title="Add New Supplier"
                    sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, height: 56, width: 56, flexShrink: 0 }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField 
                  fullWidth 
                  label="Initial Payment (Ks)" 
                  type="number" 
                  variant="outlined"
                  value={paidAmount} 
                  onChange={(e) => setPaidAmount(e.target.value)} 
                  InputProps={{ sx: { fontWeight: 'bold' } }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Add Item Section */}
          <Box sx={{ p: 3, bgcolor: 'background.paper', mb: 2 }}>
            <Typography variant="h6" fontWeight="600" color="primary.dark" gutterBottom>2. Add Products to Cart</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  fullWidth
                  sx={{ 
                    width: '100%',
                    '& .MuiAutocomplete-input': {
                      minWidth: '250px !important' // Force a wider minimum width for the input field
                    }
                  }}
                  options={products}
                  getOptionLabel={(option) => option.name}
                  value={selectedProduct}
                  onChange={(e, val) => setSelectedProduct(val)}
                  renderInput={(params) => <TextField {...params} label="Select Product" variant="outlined" placeholder="Search catalog..." fullWidth />}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="Expiry Date (Optional)" type="date" InputLabelProps={{ shrink: true }} value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
              </Grid>
              <Grid item xs={3} md={1.5}>
                <TextField fullWidth label="Qty" type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
              </Grid>
              <Grid item xs={5} md={2.5}>
                <TextField fullWidth label="Unit Cost (Ks)" type="number" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  fullWidth 
                  onClick={addToCart} 
                  disabled={!selectedProduct || !costPrice} 
                  sx={{ py: 1.5, fontWeight: 'bold', borderRadius: 2, mt: 1 }}
                  startIcon={<AddIcon />}
                >
                  Add Item to Purchase Cart
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Cart Section */}
          <Box sx={{ p: 3, bgcolor: 'background.paper', minHeight: 250, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight="600" color="primary.dark" gutterBottom>3. Review Purchase Cart</Typography>
            {cart.length === 0 ? (
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 4 }}>
                <Typography color="text.secondary">Cart is empty. Add products above.</Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Cost Price</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Qty</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cart.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell align="right">{item.costPrice.toLocaleString()} Ks</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{(item.costPrice * item.quantity).toLocaleString()} Ks</TableCell>
                        <TableCell align="center">
                          <IconButton size="small" color="error" onClick={() => removeCartItem(index)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {cart.length > 0 && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.dark', color: 'primary.contrastText', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.1)' }}>
                <Typography variant="h6">Grand Total</Typography>
                <Typography variant="h4" fontWeight="bold">{totalCartAmount.toLocaleString()} Ks</Typography>
              </Box>
            )}
          </Box>

        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={() => setOpen(false)} size="large" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" size="large" disabled={cart.length === 0} sx={{ px: 4, py: 1.5, fontWeight: 'bold', borderRadius: 2 }}>
            Complete & Save Purchase
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pay Modal */}
      <Dialog open={payModalOpen} onClose={handleClosePay}>
        <DialogTitle>Make Payment for Purchase #{selectedPurchase?.id}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Total Due: <strong>{selectedPurchase?.dueAmount.toLocaleString()} Ks</strong>
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Payment Amount (Ks)"
            type="number"
            fullWidth
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            InputProps={{ inputProps: { max: selectedPurchase?.dueAmount } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePay}>Cancel</Button>
          <Button onClick={handleProcessPayment} variant="contained" color="primary" disabled={!payAmount || payAmount <= 0 || payAmount > selectedPurchase?.dueAmount}>
            Confirm Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Supplier Dialog */}
      <Dialog open={supplierModalOpen} onClose={() => setSupplierModalOpen(false)}>
        <DialogTitle>Quick Add Supplier</DialogTitle>
        <DialogContent>
          <TextField 
            autoFocus fullWidth label="Name" margin="dense" 
            value={newSupplier.name} onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })} 
          />
          <TextField 
            fullWidth label="Phone" margin="dense" 
            value={newSupplier.phone} onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })} 
          />
          <TextField 
            fullWidth label="Address" margin="dense" multiline rows={2}
            value={newSupplier.address} onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSupplierModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveSupplier} variant="contained" disabled={!newSupplier.name}>Save Supplier</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

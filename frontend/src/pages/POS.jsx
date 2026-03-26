import { useState, useEffect, useRef } from 'react';
import { Box, Grid, Paper, Typography, Button, TextField, List, ListItem, ListItemText, Divider, IconButton, Autocomplete, Dialog, DialogTitle, DialogContent, DialogActions, Card, CardActionArea, InputAdornment, Checkbox, FormControlLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PrintIcon from '@mui/icons-material/Print';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import { useReactToPrint } from 'react-to-print';
import api from '../api';

export default function POS() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [settings, setSettings] = useState({ 
    shopName: 'Lin Yaung Thit', 
    shopAddress: '', 
    shopPhone: '', 
    printerWidth: 80, 
    printerHeight: null 
  });
  const printRef = useRef(null);

  const [voucherCode, setVoucherCode] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paidAmount, setPaidAmount] = useState('');
  const [serviceFee, setServiceFee] = useState('');
  const [isRefundableFee, setIsRefundableFee] = useState(false);

  // New Customer Modal State
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '' });

  const fetchData = async () => {
    try {
      const [prodRes, custRes, setRes] = await Promise.all([
        api.get('/products').catch(() => ({ data: [] })),
        api.get('/customers').catch(() => ({ data: [] })),
        api.get('/settings').catch(() => ({ data: {} }))
      ]);
      setProducts(prodRes.data);
      setCustomers(custRes.data);
      setSettings(prev => ({ ...prev, ...setRes.data }));
      setVoucherCode(`INV-${Date.now()}`); 
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalAmount = subtotal + (Number(serviceFee) || 0);
  const dueAmount = totalAmount - (Number(paidAmount) || 0);

  // react-to-print setup
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Receipt_${voucherCode}`,
    onAfterPrint: () => {
      setCart([]);
      setPaidAmount('');
      setServiceFee('');
      setIsRefundableFee(false);
      setSelectedCustomer(null);
      setVoucherCode(`INV-${Date.now()}`); 
    }
  });

  const completeSale = async () => {
    if (cart.length === 0) return;
    
    const payload = {
      totalAmount: subtotal,
      nonRefundableFee: isRefundableFee ? 0 : (Number(serviceFee) || 0),
      refundableFee: isRefundableFee ? (Number(serviceFee) || 0) : 0,
      voucherCode,
      customerId: selectedCustomer?.id || null,
      paidAmount: Number(paidAmount) || 0,
      items: cart.map(c => ({ productId: c.id, quantity: c.qty, price: c.price }))
    };

    try {
      const res = await api.post('/sales', payload);
      if (res.status === 200 || res.status === 201) {
        handlePrint();
      } else {
        alert("Failed to save sale. Please try again.");
      }
    } catch (error) {
      console.error("Sale failed", error);
      alert("Error: " + (error.response?.data?.error || "Failed to connect to server"));
    }
  };

  const handleSaveCustomer = async () => {
    if (!newCustomer.name) return;
    try {
      const res = await api.post('/customers', newCustomer);
      const createdCustomer = res.data;
      setCustomers([...customers, createdCustomer]);
      setSelectedCustomer(createdCustomer);
      setCustomerModalOpen(false);
      setNewCustomer({ name: '', phone: '', address: '' });
    } catch (error) {
      console.error("Failed to create customer", error);
      alert("Failed to create customer.");
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.barcode && p.barcode.includes(search)));

  return (
    <Box sx={{ flexGrow: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      <Grid container spacing={3} sx={{ flexGrow: 1, height: { xs: 'auto', md: 'calc(100vh - 100px)' } }}>
        
        {/* Left Side: Product List & Search */}
        <Grid item xs={12} md={7} lg={8} sx={{ height: { xs: '60vh', md: '100%' }, display: 'flex', flexDirection: 'column' }}>
          
          {/* Header & Search */}
          <Paper elevation={0} sx={{ p: 2, mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', bgcolor: 'transparent', borderBottom: '1px solid', borderColor: 'divider', borderRadius: 0, px: 0 }}>
            <TextField 
              sx={{ flexGrow: 1, bgcolor: 'background.paper', borderRadius: 2 }}
              placeholder="Search product by name or barcode..." 
              variant="outlined" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField 
              label="Voucher Code" 
              variant="outlined" 
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              sx={{ minWidth: 200, bgcolor: 'background.paper', borderRadius: 2 }}
            />
          </Paper>

          {/* Product Grid */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1, pb: 2 }}>
            <Grid container spacing={2}>
              {filteredProducts.map(product => (
                <Grid item xs={6} sm={4} md={4} lg={3} key={product.id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                        borderColor: 'primary.main'
                      }
                    }}
                  >
                    <CardActionArea 
                      onClick={() => addToCart(product)} 
                      sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Typography variant="subtitle1" fontWeight="600" align="center" sx={{ mb: 1, lineHeight: 1.3 }}>
                        {product.name}
                      </Typography>
                      <Box sx={{ mt: 'auto', width: '100%', textAlign: 'center' }}>
                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                          {product.price.toLocaleString()} Ks
                        </Typography>
                        <Typography variant="caption" sx={{ color: product.stock <= 5 ? 'error.main' : 'text.secondary', fontWeight: product.stock <= 5 ? 'bold' : 'normal' }}>
                          Stock: {product.stock}
                        </Typography>
                      </Box>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
              {filteredProducts.length === 0 && (
                <Box sx={{ width: '100%', textAlign: 'center', p: 5 }}>
                  <Typography variant="h6" color="text.secondary">No products found.</Typography>
                </Box>
              )}
            </Grid>
          </Box>
        </Grid>

        {/* Right Side: Cart / Checkout */}
        <Grid item xs={12} md={5} lg={4} sx={{ height: '100%' }}>
          <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden' }}>
            
            {/* Cart Header */}
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShoppingCartCheckoutIcon />
              <Typography variant="h6" fontWeight="bold">Current Order</Typography>
            </Box>
            
            {/* Cart Items List */}
            <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0, bgcolor: 'background.paper' }}>
              {cart.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'text.secondary', p: 3, textAlign: 'center' }}>
                  <Typography>Cart is empty. Select products to begin.</Typography>
                </Box>
              ) : (
                cart.map((item) => (
                  <ListItem 
                    key={item.id}
                    sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1.5, px: 2 }}
                  >
                    <ListItemText 
                      primary={<Typography fontWeight="600" variant="body1">{item.name}</Typography>} 
                      secondary={<Typography color="text.secondary" variant="body2">{item.price.toLocaleString()} Ks <strong style={{color: '#1e293b'}}>x {item.qty}</strong></Typography>} 
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography fontWeight="bold" color="primary.dark">{(item.price * item.qty).toLocaleString()}</Typography>
                      <IconButton 
                        edge="end" 
                        size="small" 
                        onClick={() => removeFromCart(item.id)}
                        sx={{ color: 'error.main', bgcolor: 'error.50', '&:hover': { bgcolor: 'error.main', color: 'white' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))
              )}
            </List>

            {/* Checkout Section */}
            <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderTop: '1px solid', borderColor: 'divider' }}>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Autocomplete
                  sx={{ flexGrow: 1, bgcolor: 'white' }}
                  options={customers}
                  getOptionLabel={(option) => `${option.name} (${option.phone || 'No Phone'})`}
                  value={selectedCustomer}
                  onChange={(e, val) => setSelectedCustomer(val)}
                  renderInput={(params) => <TextField {...params} label="Select Customer" variant="outlined" size="small" />}
                />
                <IconButton color="primary" sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'divider', borderRadius: 1 }} onClick={() => setCustomerModalOpen(true)} title="Add New Customer">
                  <PersonAddIcon />
                </IconButton>
              </Box>

              <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <TextField 
                  fullWidth label="Service Fee" 
                  variant="outlined" size="small" type="number"
                  value={serviceFee} onChange={(e) => setServiceFee(e.target.value)}
                  sx={{ bgcolor: 'white' }}
                />
                <FormControlLabel
                  control={<Checkbox checked={isRefundableFee} onChange={(e) => setIsRefundableFee(e.target.checked)} size="small" />}
                  label={<Typography variant="body2">Refundable Service Fee</Typography>}
                  sx={{ ml: 0, mt: -0.5 }}
                />
              </Box>

              <TextField 
                fullWidth label="Paid Amount (Ks)" 
                variant="outlined" size="medium" type="number"
                value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)}
                sx={{ mb: 3, bgcolor: 'white' }}
                InputProps={{ sx: { fontSize: '1.1rem', fontWeight: 'bold' } }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, px: 1 }}>
                <Typography variant="body1" color="text.secondary">Subtotal:</Typography>
                <Typography variant="body1" fontWeight="bold" color="text.primary">{subtotal.toLocaleString()} Ks</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, px: 1 }}>
                <Typography variant="body1" color={dueAmount > 0 ? 'error.main' : 'success.main'}>
                  {dueAmount > 0 ? 'Due:' : 'Change:'}
                </Typography>
                <Typography variant="body1" fontWeight="bold" color={dueAmount > 0 ? 'error.main' : 'success.main'}>
                  {Math.abs(dueAmount).toLocaleString()} Ks
                </Typography>
              </Box>

              <Box sx={{ p: 2, bgcolor: 'primary.dark', color: 'primary.contrastText', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, boxShadow: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.1)' }}>
                <Typography variant="h6" fontWeight="normal">TOTAL</Typography>
                <Typography variant="h4" fontWeight="bold">{totalAmount.toLocaleString()} Ks</Typography>
              </Box>

              <Button 
                variant="contained" 
                color="secondary" 
                size="large" 
                fullWidth 
                onClick={completeSale}
                disabled={cart.length === 0}
                startIcon={<PrintIcon />}
                sx={{ py: 2, fontSize: '1.2rem', borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(16 185 129 / 0.4)' }}
              >
                Complete Sale
              </Button>

            </Box>
          </Paper>
        </Grid>

      </Grid>

      {/* New Customer Dialog */}
      <Dialog open={customerModalOpen} onClose={() => setCustomerModalOpen(false)}>
        <DialogTitle>Quick Add Customer</DialogTitle>
        <DialogContent>
          <TextField 
            autoFocus fullWidth label="Name" margin="dense" 
            value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} 
          />
          <TextField 
            fullWidth label="Phone" margin="dense" 
            value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} 
          />
          <TextField 
            fullWidth label="Address" margin="dense" multiline rows={2}
            value={newCustomer.address} onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomerModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveCustomer} variant="contained" disabled={!newCustomer.name}>Save Customer</Button>
        </DialogActions>
      </Dialog>

      {/* Printable Receipt (Hidden from screen) */}
      <style>
        {`
          .print-container {
            position: absolute;
            top: -9999px;
            left: -9999px;
          }
          @media print {
            .print-container {
              position: static;
              display: block !important;
            }
          }
        `}
      </style>

      <div className="print-container">
        <div ref={printRef} style={{ 
          width: `${settings.printerWidth}mm`, 
          height: settings.printerHeight ? `${settings.printerHeight}mm` : 'auto',
          padding: '5mm', 
          fontFamily: 'monospace',
          color: '#000',
          backgroundColor: '#fff',
          margin: 0
        }}>
          <Typography variant="h6" align="center" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
            {settings.shopName}
          </Typography>
          {settings.shopAddress && (
            <Typography variant="body2" align="center" sx={{ fontSize: '10px' }}>
              {settings.shopAddress}
            </Typography>
          )}
          {settings.shopPhone && (
            <Typography variant="body2" align="center" sx={{ fontSize: '10px' }}>
              Tel: {settings.shopPhone}
            </Typography>
          )}
          
          <Divider sx={{ borderStyle: 'dashed', my: 1, borderColor: '#000' }} />
          <Typography variant="body2" align="center" sx={{ mb: 1, fontSize: '12px' }}>RECEIPT / VOUCHER</Typography>
          <Typography variant="body2" align="center" sx={{ mb: 1, fontSize: '12px', fontWeight: 'bold' }}>#{voucherCode}</Typography>
          {selectedCustomer && (
            <Typography variant="body2" sx={{ mb: 1, fontSize: '12px' }}>Customer: {selectedCustomer.name}</Typography>
          )}

          <table style={{ width: '100%', fontSize: '12px', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px dashed #000' }}>
                <th style={{ padding: '4px 0' }}>Item</th>
                <th style={{ textAlign: 'center', padding: '4px 0' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '4px 0' }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {cart.map(item => (
                <tr key={item.id} style={{ verticalAlign: 'top' }}>
                  <td style={{ padding: '4px 0' }}>
                    <div>{item.name}</div>
                    {item.barcode && <div style={{ fontSize: '10px', color: '#333' }}>{item.barcode}</div>}
                  </td>
                  <td style={{ textAlign: 'center', padding: '4px 0' }}>{item.qty}</td>
                  <td style={{ textAlign: 'right', padding: '4px 0' }}>{(item.price * item.qty).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <Divider sx={{ borderStyle: 'dashed', my: 1, borderColor: '#000' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span>Subtotal:</span>
            <span>{subtotal.toLocaleString()} Ks</span>
          </div>
          {(Number(serviceFee) > 0) && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span>{isRefundableFee ? 'Service Fee (Refund)' : 'Service Fee (N.R)'}:</span>
              <span>{(Number(serviceFee)).toLocaleString()} Ks</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', marginTop: '4px' }}>
            <span>TOTAL:</span>
            <span>{totalAmount.toLocaleString()} Ks</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span>PAID:</span>
            <span>{(Number(paidAmount) || 0).toLocaleString()} Ks</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px' }}>
            <span>DUE:</span>
            <span>{(totalAmount - (Number(paidAmount) || 0)).toLocaleString()} Ks</span>
          </div>

          <Divider sx={{ borderStyle: 'dashed', my: 1, borderColor: '#000' }} />
          
          <Typography variant="body2" align="center" sx={{ mt: 2, fontSize: '10px' }}>Thank you for your business!</Typography>
          <Typography variant="body2" align="center" sx={{ fontSize: '10px' }}>{new Date().toLocaleString()}</Typography>
        </div>
      </div>

    </Box>
  );
}

import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow, Collapse, TextField, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Chip, TableContainer } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentIcon from '@mui/icons-material/Payment';
import { useOutletContext } from 'react-router-dom';
import api from '../api';
import Button from '../components/LoadingButton';
import IconButton from '../components/LoadingIconButton';

function Row({ sale, onDelete, onPay, canDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">{sale.voucherCode}</TableCell>
        <TableCell>{new Date(sale.createdAt).toLocaleDateString()}</TableCell>
        <TableCell>{sale.customer?.name || 'Walk-in'}</TableCell>
        <TableCell>{(sale.nonRefundableFee || 0).toLocaleString()} Ks</TableCell>
        <TableCell>{(sale.refundableFee || 0).toLocaleString()} Ks</TableCell>
        <TableCell>{sale.totalAmount.toLocaleString()} Ks</TableCell>
        <TableCell>
          <Chip 
            label={sale.dueAmount === 0 ? 'Paid' : `${sale.dueAmount.toLocaleString()} Ks Due`} 
            color={sale.dueAmount === 0 ? 'success' : 'error'} 
            size="small" 
          />
        </TableCell>
        <TableCell align="right">
          {sale.dueAmount > 0 && (
            <IconButton onClick={() => onPay(sale)} color="primary" title="Pay">
              <PaymentIcon />
            </IconButton>
          )}
          {canDelete && (
            <IconButton onClick={() => onDelete(sale.id)} color="error" title="Delete">
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
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Qty</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sale.items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.product?.name}</TableCell>
                      <TableCell>{item.price.toLocaleString()}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell align="right">{(item.price * item.quantity).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {sale.transactions && sale.transactions.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom component="div" sx={{ mt: 2 }}>Payment History</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sale.transactions.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>{new Date(t.createdAt).toLocaleString()}</TableCell>
                          <TableCell align="right">{t.amount.toLocaleString()} Ks</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function Sales() {
  const { user } = useOutletContext();
  const canDelete = user?.role?.permissions?.includes('DELETE_SALE');
  const [sales, setSales] = useState([]);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', voucherCode: '' });
  const [tabValue, setTabValue] = useState(0);

  // Payment Modal State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [payAmount, setPayAmount] = useState('');

  const fetchSales = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.voucherCode) params.append('voucherCode', filters.voucherCode);

      const res = await api.get(`/sales?${params.toString()}`).catch(() => ({ data: [] }));
      setSales(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = async () => {
    await fetchSales();
  };

  const handleClearFilters = async () => {
    setFilters({ startDate: '', endDate: '', voucherCode: '' });
    const res = await api.get('/sales');
    setSales(res.data || []);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sale? This will restock the inventory automatically.")) {
      try {
        await api.delete(`/sales/${id}`);
        fetchSales();
      } catch (error) {
        console.error("Failed to delete", error);
        alert("Failed to delete sale.");
      }
    }
  };

  const handleOpenPay = (sale) => {
    setSelectedSale(sale);
    setPayAmount(sale.dueAmount);
    setPayModalOpen(true);
  };

  const handleClosePay = () => {
    setPayModalOpen(false);
    setSelectedSale(null);
    setPayAmount('');
  };

  const handleProcessPayment = async () => {
    if (!selectedSale || !payAmount) return;
    try {
      await api.post('/transactions/payment', {
        type: 'SALE',
        id: selectedSale.id,
        amount: Number(payAmount)
      });
      handleClosePay();
      fetchSales(); // Refresh list
    } catch (error) {
      console.error(error);
      alert('Failed to process payment');
    }
  };

  const filteredSales = sales.filter((s) => {
    if (tabValue === 1) return s.dueAmount === 0; // Paid
    if (tabValue === 2) return s.dueAmount > 0;   // Unpaid
    return true; // All
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Sales History & Vouchers</Typography>

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
        <TextField 
          label="Voucher Code" name="voucherCode" size="small"
          value={filters.voucherCode} onChange={handleFilterChange}
        />
        <Button variant="contained" onClick={handleApplyFilters}>Filter</Button>
        <Button variant="outlined" color="secondary" onClick={handleClearFilters}>Clear</Button>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} indicatorColor="primary" textColor="primary" centered>
          <Tab label="All Sales" />
          <Tab label="Fully Paid" />
          <Tab label="Unpaid / Credit" />
        </Tabs>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Voucher</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Fee (N.R)</TableCell>
              <TableCell>Fee (Ref)</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSales.map((sale) => (
              <Row key={sale.id} sale={sale} onDelete={handleDelete} onPay={handleOpenPay} canDelete={canDelete} />
            ))}
            {filteredSales.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">No sales found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={payModalOpen} onClose={handleClosePay}>
        <DialogTitle>Receive Payment for #{selectedSale?.voucherCode}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Total Due: <strong>{selectedSale?.dueAmount.toLocaleString()} Ks</strong>
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Payment Amount (Ks)"
            type="number"
            fullWidth
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            InputProps={{ inputProps: { max: selectedSale?.dueAmount } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePay}>Cancel</Button>
          <Button onClick={handleProcessPayment} variant="contained" color="primary" disabled={!payAmount || payAmount <= 0 || payAmount > selectedSale?.dueAmount}>
            Confirm Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

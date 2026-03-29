import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow, TextField, CircularProgress, Tabs, Tab, TableContainer } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import api from '../api';
import * as XLSX from 'xlsx';
import Button from '../components/LoadingButton';

export default function EntityReport() {
  const [tabValue, setTabValue] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [dateRange, setDateRange] = useState({ 
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], 
    endDate: new Date().toISOString().split('T')[0] 
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      const [custRes, supRes] = await Promise.all([
        api.get(`/reports/customers${q}`),
        api.get(`/reports/suppliers${q}`)
      ]);
      setCustomers(custRes.data);
      setSuppliers(supRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Customer Sheet
    const cData = [
      ["Customer Report", `Period: ${dateRange.startDate} to ${dateRange.endDate}`],
      [""],
      ["Name", "Phone", "Total Sales (Ks)", "Total Paid (Ks)", "Total Due (Ks)"],
      ...customers.map(c => [c.name, c.phone || '-', c.totalSales, c.totalPaid, c.totalDue])
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(cData), "Customers");

    // Supplier Sheet
    const sData = [
      ["Supplier Report", `Period: ${dateRange.startDate} to ${dateRange.endDate}`],
      [""],
      ["Name", "Phone", "Total Purchases (Ks)", "Total Paid (Ks)", "Total Due (Ks)"],
      ...suppliers.map(s => [s.name, s.phone || '-', s.totalPurchases, s.totalPaid, s.totalDue])
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sData), "Suppliers");

    XLSX.writeFile(wb, `Entity_Ledger_${dateRange.startDate}_to_${dateRange.endDate}.xlsx`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Customer & Supplier Ledger</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField 
            label="Start Date" type="date" size="small" InputLabelProps={{ shrink: true }}
            value={dateRange.startDate} onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
          />
          <TextField 
            label="End Date" type="date" size="small" InputLabelProps={{ shrink: true }}
            value={dateRange.endDate} onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
          />
          <Button variant="contained" onClick={fetchData}>Update</Button>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExportExcel}>Export Excel</Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} indicatorColor="primary" textColor="primary">
          <Tab label="Customer Report" />
          <Tab label="Supplier Report" />
        </Tabs>
      </Paper>

      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
        ) : tabValue === 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell align="right">Total Sales</TableCell>
                  <TableCell align="right">Total Paid</TableCell>
                  <TableCell align="right">Total Due</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((c, i) => (
                  <TableRow key={i}>
                    <TableCell fontWeight="bold">{c.name}</TableCell>
                    <TableCell>{c.phone || '-'}</TableCell>
                    <TableCell align="right">{c.totalSales.toLocaleString()} Ks</TableCell>
                    <TableCell align="right">{c.totalPaid.toLocaleString()} Ks</TableCell>
                    <TableCell align="right" sx={{ color: c.totalDue > 0 ? 'error.main' : 'inherit', fontWeight: c.totalDue > 0 ? 'bold' : 'normal' }}>
                      {c.totalDue.toLocaleString()} Ks
                    </TableCell>
                  </TableRow>
                ))}
                {customers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No customer data found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Supplier Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell align="right">Total Purchases</TableCell>
                  <TableCell align="right">Total Paid</TableCell>
                  <TableCell align="right">Total Due</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {suppliers.map((s, i) => (
                  <TableRow key={i}>
                    <TableCell fontWeight="bold">{s.name}</TableCell>
                    <TableCell>{s.phone || '-'}</TableCell>
                    <TableCell align="right">{s.totalPurchases.toLocaleString()} Ks</TableCell>
                    <TableCell align="right">{s.totalPaid.toLocaleString()} Ks</TableCell>
                    <TableCell align="right" sx={{ color: s.totalDue > 0 ? 'error.main' : 'inherit', fontWeight: s.totalDue > 0 ? 'bold' : 'normal' }}>
                      {s.totalDue.toLocaleString()} Ks
                    </TableCell>
                  </TableRow>
                ))}
                {suppliers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No supplier data found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}

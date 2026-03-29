import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow, TextField, CircularProgress, MenuItem, TableContainer } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import api from '../api';
import * as XLSX from 'xlsx';
import Button from '../components/LoadingButton';

export default function ProductLedgerReport() {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ 
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], 
    endDate: new Date().toISOString().split('T')[0] 
  });
  const [categoryId, setCategoryId] = useState('');

  const fetchLedger = async () => {
    setLoading(true);
    try {
      let url = `/reports/product-ledger?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      if (categoryId) {
        url += `&categoryId=${categoryId}`;
      }
      const res = await api.get(url);
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchLedger();
  }, []);

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
      ["Product Inventory Ledger"],
      ["Period", `${dateRange.startDate} to ${dateRange.endDate}`],
      [""],
      ["Product Name", "Category", "Barcode", "Purchased Qty (In)", "Sold Qty (Out)", "Net Change", "Current Stock"],
      ...data.map(p => [p.name, p.category, p.barcode, p.purchasedQty, p.soldQty, p.netChange, p.currentStock])
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Ledger");
    XLSX.writeFile(wb, `Product_Ledger_${dateRange.startDate}_to_${dateRange.endDate}.xlsx`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Product Ledger</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            select
            label="Category"
            size="small"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All</MenuItem>
            {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
          <TextField 
            label="Start Date" type="date" size="small" InputLabelProps={{ shrink: true }}
            value={dateRange.startDate} onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
          />
          <TextField 
            label="End Date" type="date" size="small" InputLabelProps={{ shrink: true }}
            value={dateRange.endDate} onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
          />
          <Button variant="contained" onClick={fetchLedger}>Update</Button>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExportExcel}>Export Excel</Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Purchased (In)</TableCell>
                  <TableCell align="right">Sold (Out)</TableCell>
                  <TableCell align="right">Net Change</TableCell>
                  <TableCell align="right">Current Stock</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell fontWeight="bold">{p.name}</TableCell>
                    <TableCell>{p.category || 'N/A'}</TableCell>
                    <TableCell align="right" color="success.main">+{p.purchasedQty}</TableCell>
                    <TableCell align="right" color="error.main">-{p.soldQty}</TableCell>
                    <TableCell align="right" fontWeight="bold">
                      {p.netChange > 0 ? `+${p.netChange}` : p.netChange}
                    </TableCell>
                    <TableCell align="right">{p.currentStock}</TableCell>
                  </TableRow>
                ))}
                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No ledger data found for this period.</TableCell>
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

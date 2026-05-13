import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow, TextField, CircularProgress, MenuItem, TableContainer } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import api from '../api';
import * as XLSX from 'xlsx';
import Button from '../components/LoadingButton';

export default function SaleProfitReport() {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ 
    startDate: new Date().toISOString().split('T')[0], 
    endDate: new Date().toISOString().split('T')[0] 
  });
  const [categoryId, setCategoryId] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    try {
      let url = `/reports/sale-profit?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
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
    fetchReport();
  }, []);

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
      ["Sale Profit Report"],
      ["Period", `${dateRange.startDate} to ${dateRange.endDate}`],
      [""],
      ["Product Name", "Category", "Barcode", "Total Qty Sold", "Avg Purchase Price (Ks)", "Total Revenue (Ks)", "Total Cost (Ks)", "Total Profit (Ks)"],
      ...data.map(p => [
        p.name, 
        p.category, 
        p.barcode, 
        p.totalSoldQty, 
        p.avgPurchasePrice.toFixed(2), 
        p.totalRevenue, 
        p.totalCost.toFixed(2), 
        p.totalProfit.toFixed(2)
      ])
    ];
    
    // Add totals row
    const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalCost = data.reduce((sum, item) => sum + item.totalCost, 0);
    const totalProfit = data.reduce((sum, item) => sum + item.totalProfit, 0);
    wsData.push(["", "", "", "Totals:", "", totalRevenue, totalCost.toFixed(2), totalProfit.toFixed(2)]);

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Sale Profit");
    XLSX.writeFile(wb, `Sale_Profit_Report_${dateRange.startDate}_to_${dateRange.endDate}.xlsx`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Sale Profit Report</Typography>
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
          <Button variant="contained" onClick={fetchReport}>Preview</Button>
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
                  <TableCell>Barcode</TableCell>
                  <TableCell align="right">Total Sold</TableCell>
                  <TableCell align="right">Avg Purchase Price</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                  <TableCell align="right">Cost</TableCell>
                  <TableCell align="right">Profit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell fontWeight="bold">{p.name}</TableCell>
                    <TableCell>{p.category || 'N/A'}</TableCell>
                    <TableCell>{p.barcode || '-'}</TableCell>
                    <TableCell align="right">{p.totalSoldQty} Units</TableCell>
                    <TableCell align="right">{p.avgPurchasePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Ks</TableCell>
                    <TableCell align="right">{p.totalRevenue.toLocaleString()} Ks</TableCell>
                    <TableCell align="right">{p.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Ks</TableCell>
                    <TableCell align="right" fontWeight="bold" color={p.totalProfit < 0 ? 'error.main' : 'success.main'}>
                      {p.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Ks
                    </TableCell>
                  </TableRow>
                ))}
                {data.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="right" fontWeight="bold">Totals:</TableCell>
                    <TableCell align="right" fontWeight="bold">
                      {data.reduce((sum, item) => sum + item.totalRevenue, 0).toLocaleString()} Ks
                    </TableCell>
                    <TableCell align="right" fontWeight="bold">
                      {data.reduce((sum, item) => sum + item.totalCost, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Ks
                    </TableCell>
                    <TableCell align="right" fontWeight="bold" color="success.main">
                      {data.reduce((sum, item) => sum + item.totalProfit, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Ks
                    </TableCell>
                  </TableRow>
                )}
                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">No sale profit data found for this period.</TableCell>
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

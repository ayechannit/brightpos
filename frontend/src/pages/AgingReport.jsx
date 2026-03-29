import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, Tabs, Tab, TableContainer } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import api from '../api';
import * as XLSX from 'xlsx';
import Button from '../components/LoadingButton';

export default function AgingReport() {
  const [tabValue, setTabValue] = useState(0);
  const [data, setData] = useState({ receivables: [], payables: [] });
  const [loading, setLoading] = useState(true);

  const fetchAging = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/aging');
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAging();
  }, []);

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const createSheetData = (title, headers, records) => [
      [title, `As of: ${new Date().toLocaleDateString()}`],
      [""],
      headers,
      ...records.map(r => [r.name, r.current, r.days30, r.days60, r.days90, r.total])
    ];

    const arData = createSheetData(
      "Accounts Receivable Aging (Money owed TO you)",
      ["Customer Name", "0-30 Days", "31-60 Days", "61-90 Days", "90+ Days", "Total Due"],
      data.receivables
    );
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(arData), "Accounts Receivable");

    const apData = createSheetData(
      "Accounts Payable Aging (Money YOU owe)",
      ["Supplier Name", "0-30 Days", "31-60 Days", "61-90 Days", "90+ Days", "Total Due"],
      data.payables
    );
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(apData), "Accounts Payable");

    XLSX.writeFile(wb, `AR_AP_Aging_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const renderTable = (records, isAP) => (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{isAP ? 'Supplier Name' : 'Customer Name'}</TableCell>
            <TableCell align="right">0-30 Days</TableCell>
            <TableCell align="right">31-60 Days</TableCell>
            <TableCell align="right">61-90 Days</TableCell>
            <TableCell align="right">90+ Days</TableCell>
            <TableCell align="right">Total Due</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {records.map((r, i) => (
            <TableRow key={i}>
              <TableCell fontWeight="bold">{r.name}</TableCell>
              <TableCell align="right">{(r.current || 0).toLocaleString()} Ks</TableCell>
              <TableCell align="right">{(r.days30 || 0).toLocaleString()} Ks</TableCell>
              <TableCell align="right">{(r.days60 || 0).toLocaleString()} Ks</TableCell>
              <TableCell align="right" sx={{ color: r.days90 > 0 ? 'error.main' : 'inherit', fontWeight: r.days90 > 0 ? 'bold' : 'normal' }}>
                {(r.days90 || 0).toLocaleString()} Ks
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>{(r.total || 0).toLocaleString()} Ks</TableCell>
            </TableRow>
          ))}
          {records.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">No outstanding {isAP ? 'payables' : 'receivables'} found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4">AR / AP Aging Report</Typography>
          <Typography variant="body2" color="textSecondary">
            Tracks outstanding invoices by age. Focus on debts older than 60 days to maintain healthy cash flow.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={fetchAging}>Refresh</Button>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExportExcel}>Export Excel</Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} indicatorColor="primary" textColor="primary">
          <Tab label="Accounts Receivable (Customers Owe You)" />
          <Tab label="Accounts Payable (You Owe Suppliers)" />
        </Tabs>
      </Paper>

      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
        ) : tabValue === 0 ? (
          renderTable(data.receivables, false)
        ) : (
          renderTable(data.payables, true)
        )}
      </Paper>
    </Box>
  );
}

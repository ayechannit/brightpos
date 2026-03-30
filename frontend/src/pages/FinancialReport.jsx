import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow, Divider, TextField, TableContainer } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import InventoryIcon from '@mui/icons-material/Inventory';
import api from '../api';
import * as XLSX from 'xlsx';
import Button from '../components/LoadingButton';

export default function FinancialReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ 
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], 
    endDate: new Date().toISOString().split('T')[0] 
  });

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/financial?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      setReport(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleExportExcel = () => {
    if (!report) return;

    const wb = XLSX.utils.book_new();

    // 1. Summary Sheet
    const summaryData = [
      ["Lin Yaung Thit - Financial Summary Report"],
      ["Period", `${dateRange.startDate} to ${dateRange.endDate}`],
      [""],
      ["Category", "Amount (Ks)"],
      ["Total Revenue (Sales)", report.summary.totalRevenue],
      ["- Product Revenue", report.summary.productRevenue],
      ["- Service Fees (All)", report.summary.totalServiceFees],
      ["  - Non-Refundable", report.summary.nonRefundableFees],
      ["  - Refundable", report.summary.refundableFees],
      ["- Clinic Fees (All)", report.summary.totalClinicFees],
      ["  - Non-Refundable", report.summary.nonRefundableClinicFees],
      ["  - Refundable", report.summary.refundableClinicFees],
      ["Total Cost of Goods (Purchases)", report.summary.totalPurchases],
      ["Gross Profit", report.summary.grossProfit],
      ["Total Expenses", report.summary.totalExpenses],
      ["Net Profit", report.summary.netProfit],
      [""],
      ["Cash In (Actual Money Received)", report.summary.cashIn],
      ["Cash Out (Actual Money Paid)", report.summary.cashOut],
      ["Net Cash Flow", report.summary.netCashFlow],
      [""],
      ["Assets & Liabilities"],
      ["Accounts Receivable (Due from Customers)", report.balanceSheet.accountsReceivable],
      ["Accounts Payable (Due to Suppliers)", report.balanceSheet.accountsPayable],
      ["Inventory Value (Stock Asset)", report.balanceSheet.inventoryValue],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Financial Summary");

    // 2. Expenses Sheet
    const expenseData = [
      ["Date", "Description", "Amount (Ks)"],
      ...report.expenseBreakdown.map(e => [new Date(e.createdAt).toLocaleDateString(), e.description, e.amount])
    ];
    const wsExpenses = XLSX.utils.aoa_to_sheet(expenseData);
    XLSX.utils.book_append_sheet(wb, wsExpenses, "Expense Breakdown");

    // Save File
    XLSX.writeFile(wb, `Financial_Report_${dateRange.startDate}_to_${dateRange.endDate}.xlsx`);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  if (!report) return <Typography>Error loading report.</Typography>;

  const StatCard = ({ title, amount, icon, color, isNegative }) => (
    <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
      <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}.light`, color: `${color}.main`, display: 'flex' }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="textSecondary" fontWeight="bold">{title}</Typography>
        <Typography variant="h5" fontWeight="bold" color={isNegative ? 'error.main' : 'inherit'}>
          {(amount || 0).toLocaleString()} Ks
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Detailed Financial Report</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField 
            label="Start Date" type="date" size="small" InputLabelProps={{ shrink: true }}
            value={dateRange.startDate} onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
          />
          <TextField 
            label="End Date" type="date" size="small" InputLabelProps={{ shrink: true }}
            value={dateRange.endDate} onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
          />
          <Button variant="contained" onClick={fetchReport}>Update</Button>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExportExcel}>Export Excel</Button>
        </Box>
      </Box>

      <Typography variant="h6" gutterBottom color="primary">Income Statement (Summary)</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Gross Revenue" amount={report.summary.totalRevenue} icon={<TrendingUpIcon />} color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Expenses" amount={report.summary.totalExpenses} icon={<TrendingDownIcon />} color="error" isNegative />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Net Profit" amount={report.summary.netProfit} icon={<AccountBalanceWalletIcon />} color="primary" isNegative={report.summary.netProfit < 0} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Inventory Value" amount={report.balanceSheet.inventoryValue} icon={<InventoryIcon />} color="warning" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Left Side: Detail Breakdown */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Accounting Breakdown</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Product Sales Revenue</Typography>
              <Typography fontWeight="bold">{report.summary.productRevenue.toLocaleString()} Ks</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Service Fees (Non-Refundable)</Typography>
              <Typography fontWeight="bold" color="success.main">+{report.summary.nonRefundableFees.toLocaleString()} Ks</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Service Fees (Refundable)</Typography>
              <Typography fontWeight="bold" color="info.main">+{report.summary.refundableFees.toLocaleString()} Ks</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Clinic Fees (Non-Refundable)</Typography>
              <Typography fontWeight="bold" color="success.main">+{report.summary.nonRefundableClinicFees.toLocaleString()} Ks</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Clinic Fees (Refundable)</Typography>
              <Typography fontWeight="bold" color="info.main">+{report.summary.refundableClinicFees.toLocaleString()} Ks</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Accounts Receivable (Customers owe you)</Typography>
              <Typography fontWeight="bold" color="success.main">+{report.balanceSheet.accountsReceivable.toLocaleString()} Ks</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Accounts Payable (You owe suppliers)</Typography>
              <Typography fontWeight="bold" color="error.main">-{report.balanceSheet.accountsPayable.toLocaleString()} Ks</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Total Cash Received (Cash In)</Typography>
              <Typography fontWeight="bold">{report.summary.cashIn.toLocaleString()} Ks</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Total Cash Paid (Cash Out)</Typography>
              <Typography fontWeight="bold">{report.summary.cashOut.toLocaleString()} Ks</Typography>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Expense Breakdown</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.expenseBreakdown.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>{new Date(e.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{e.description}</TableCell>
                      <TableCell align="right">{e.amount.toLocaleString()} Ks</TableCell>
                    </TableRow>
                  ))}
                  {report.expenseBreakdown.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">No expenses recorded for this period.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Right Side: Accountant's Notes */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom>Senior Accountant's Audit Note</Typography>
            <Typography variant="body2" paragraph>
              <strong>Liquidity Check:</strong> Your current net cash flow is <strong>{report.summary.netCashFlow.toLocaleString()} Ks</strong>. This represents the actual liquid cash movement in your shop.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Service & Clinic Revenue:</strong> You have collected <strong>{(report.summary.totalServiceFees + report.summary.totalClinicFees).toLocaleString()} Ks</strong> in total fees (Service: {report.summary.totalServiceFees.toLocaleString()} Ks, Clinic: {report.summary.totalClinicFees.toLocaleString()} Ks) this period.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Asset Valuation:</strong> Your inventory is currently valued at <strong>{report.balanceSheet.inventoryValue.toLocaleString()} Ks</strong>. Maintaining optimal stock levels is key to reducing holding costs.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Credit Risk:</strong> Customers currently owe a total of <strong>{report.balanceSheet.accountsReceivable.toLocaleString()} Ks</strong>. Monitor aging reports to ensure timely collections.
            </Typography>
            <Typography variant="body2">
              <strong>Profitability:</strong> Your net profit (Accrual Basis) accounts for all sales and expenses regardless of cash movement, providing a long-term view of shop performance.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

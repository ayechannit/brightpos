import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow, TextField, CircularProgress, TableContainer } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import api from '../api';
import * as XLSX from 'xlsx';
import Button from '../components/LoadingButton';

export default function DoctorReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [dateRange, setDateRange] = useState({ 
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], 
    endDate: new Date().toISOString().split('T')[0] 
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      const res = await api.get(`/reports/doctors${q}`);
      setData(res.data);
    } catch (error) {
      console.error("Failed to fetch doctor report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const reportData = [
      ["Doctor Fees Report", `Period: ${dateRange.startDate} to ${dateRange.endDate}`],
      [""],
      ["Doctor Name", "Phone", "Total Investigations Done", "Total Fees (Ks)", "Unpaid Fees (Ks)", "Paid Fees (Ks)"],
      ...data.map(d => [d.name, d.phone || '-', d.totalItems, d.totalFees, d.unpaidFees, d.paidFees])
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(reportData), "Doctor Fees");

    XLSX.writeFile(wb, `Doctor_Fees_Report_${dateRange.startDate}_to_${dateRange.endDate}.xlsx`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
        <Typography variant="h4">Doctor Fees Report</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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

      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Doctor Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Investigations Done</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Earned (Ks)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Unpaid / Pending (Ks)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Paid / Settled (Ks)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((doctor) => (
                  <TableRow key={doctor.id} hover>
                    <TableCell>{doctor.name}</TableCell>
                    <TableCell>{doctor.phone || 'N/A'}</TableCell>
                    <TableCell align="right">{doctor.totalItems.toLocaleString()}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {doctor.totalFees.toLocaleString()} Ks
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                      {doctor.unpaidFees.toLocaleString()} Ks
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      {doctor.paidFees.toLocaleString()} Ks
                    </TableCell>
                  </TableRow>
                ))}
                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      No doctor statistics found for this period.
                    </TableCell>
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

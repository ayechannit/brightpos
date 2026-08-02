import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
  CircularProgress, Grid, Card, CardActionArea, Tabs, Tab, Chip
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { getDoctors, getDoctorPayouts, payDoctorFee, payAllDoctorFees } from '../api';
import Button from '../components/LoadingButton';

export default function PayDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [tabValue, setTabValue] = useState(0); // 0 = Unpaid, 1 = Paid

  const status = tabValue === 0 ? 'unpaid' : 'paid';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [doctorsRes, itemsRes] = await Promise.all([
        getDoctors(),
        getDoctorPayouts({ status })
      ]);
      setDoctors(doctorsRes);
      setItems(itemsRes);
    } catch (error) {
      console.error("Failed to fetch doctor payout data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabValue]);

  // Summary per doctor for the current tab
  const doctorSummaries = doctors.map(doc => {
    const docItems = items.filter(i => i.doctorId === doc.id);
    return {
      ...doc,
      count: docItems.length,
      total: docItems.reduce((sum, i) => sum + i.doctorFee, 0)
    };
  }).filter(d => d.count > 0);

  const filteredItems = selectedDoctorId
    ? items.filter(i => i.doctorId === selectedDoctorId)
    : items;

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);
  const selectedTotal = filteredItems.reduce((sum, i) => sum + i.doctorFee, 0);

  const handlePayItem = async (itemId) => {
    if (window.confirm("Mark this doctor fee as paid? This will log a payout transaction in your cashbook.")) {
      try {
        await payDoctorFee(itemId);
        fetchData();
      } catch (error) {
        console.error(error);
        alert(error.response?.data?.error || "Failed to process doctor payout");
      }
    }
  };

  const handlePayAll = async () => {
    if (!selectedDoctorId) return;
    if (window.confirm(`Pay all ${filteredItems.length} outstanding fee(s) to ${selectedDoctor?.name} totaling ${selectedTotal.toLocaleString()} Ks?`)) {
      try {
        await payAllDoctorFees(selectedDoctorId);
        fetchData();
      } catch (error) {
        console.error(error);
        alert(error.response?.data?.error || "Failed to process bulk doctor payout");
      }
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Pay Doctors</Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Settle outstanding doctor fees. Select a doctor to view their fees, then pay individually or all at once.
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => { setTabValue(v); setSelectedDoctorId(null); }}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Unpaid" />
          <Tab label="Paid" />
        </Tabs>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {doctorSummaries.length === 0 && (
              <Grid item xs={12}>
                <Typography color="textSecondary" sx={{ p: 2 }}>
                  No {status} doctor fees found.
                </Typography>
              </Grid>
            )}
            {doctorSummaries.map(doc => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={doc.id}>
                <Card
                  variant={selectedDoctorId === doc.id ? 'elevation' : 'outlined'}
                  sx={{
                    borderColor: selectedDoctorId === doc.id ? 'primary.main' : 'divider',
                    borderWidth: selectedDoctorId === doc.id ? 2 : 1,
                    borderStyle: 'solid'
                  }}
                >
                  <CardActionArea
                    sx={{ p: 2 }}
                    onClick={() => setSelectedDoctorId(selectedDoctorId === doc.id ? null : doc.id)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocalHospitalIcon color="primary" fontSize="small" />
                      <Typography fontWeight="bold">{doc.name}</Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">{doc.count} item(s)</Typography>
                    <Typography variant="h6" fontWeight="bold" color={status === 'unpaid' ? 'error.main' : 'success.main'}>
                      {doc.total.toLocaleString()} Ks
                    </Typography>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <Typography variant="h6">
                {selectedDoctor ? `${selectedDoctor.name} — Fee Details` : 'All Doctors — Fee Details'}
              </Typography>
              {status === 'unpaid' && selectedDoctorId && filteredItems.length > 0 && (
                <Button variant="contained" color="success" onClick={handlePayAll}>
                  Pay All ({selectedTotal.toLocaleString()} Ks)
                </Button>
              )}
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Voucher</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Fee (Ks)</TableCell>
                    <TableCell align="right">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems.map(item => (
                    <TableRow key={item.id} hover>
                      <TableCell>{new Date(item.sale.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{item.sale.voucherCode || `#${item.sale.id}`}</TableCell>
                      <TableCell>{item.sale.customer?.name || 'Walk-in'}</TableCell>
                      <TableCell>{item.doctor?.name || '-'}</TableCell>
                      <TableCell>{item.product?.name || '-'}</TableCell>
                      <TableCell align="right">{item.doctorFee.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        {item.doctorFeePaid ? (
                          <Chip label="Paid" color="success" size="small" variant="outlined" />
                        ) : (
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handlePayItem(item.id)}
                            sx={{ py: 0.25, fontSize: '0.75rem', minWidth: '80px' }}
                          >
                            Pay Doctor
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        No {status} doctor fees found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
}

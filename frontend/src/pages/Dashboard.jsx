import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import api from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({ productCount: 0, salesCountToday: 0, revenueToday: 0 });

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats').catch(() => ({ 
        data: { productCount: 0, salesCountToday: 0, revenueToday: 0 } 
      }));
      setStats(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box 
          sx={{ 
            p: 2, 
            borderRadius: 3, 
            bgcolor: `${color}.light`, 
            color: `${color}.contrastText`, 
            display: 'flex',
            boxShadow: 'inset 0 2px 4px 0 rgb(255 255 255 / 0.3)'
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>{title}</Typography>
          <Typography variant="h4" fontWeight="bold" color="text.primary">{value}</Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>Dashboard Overview</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total Products" value={stats.productCount} icon={<InventoryIcon fontSize="large" />} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Sales Today" value={stats.salesCountToday} icon={<ShoppingCartIcon fontSize="large" />} color="secondary" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Revenue Today" value={`${stats.revenueToday.toLocaleString()} Ks`} icon={<MonetizationOnIcon fontSize="large" />} color="success" />
        </Grid>
      </Grid>

      <Paper sx={{ p: { xs: 3, md: 4 }, mt: 4, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom>Welcome back to Lin Yaung Thit POS</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 800 }}>
          Your quick overview for today's performance. Navigate to the <strong>POS</strong> module to start processing sales, or manage your catalog from the <strong>Products</strong> section.
        </Typography>
      </Paper>
    </Box>
  );
}

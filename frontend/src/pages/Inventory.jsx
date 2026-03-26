import { useState, useEffect } from 'react';
import {  Box, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow, Grid , TableContainer } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import api from '../api';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [expiringItems, setExpiringItems] = useState([]);

  const fetchData = async () => {
    try {
      const pRes = await api.get('/products').catch(() => ({ data: [] }));
      setProducts(pRes.data);

      const eRes = await api.get('/inventory/expiring').catch(() => ({ data: [] }));
      setExpiringItems(eRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Inventory Management</Typography>
      
      <Grid container spacing={3}>
        {/* Expiring Soon Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, borderLeft: '5px solid #ff9800' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WarningAmberIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6" color="warning.main">Expiring Soon (Next 30 Days)</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Expiry Date</TableCell>
                    <TableCell>Stock Left</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expiringItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{new Date(item.expiryDate).toLocaleDateString()}</TableCell>
                      <TableCell>{item.stock}</TableCell>
                    </TableRow>
                  ))}
                  {expiringItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">No items expiring soon.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Current Stock Section */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Current Stock Status</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Stock Level</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category?.name || 'None'}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      {product.stock <= 5 ? (
                        <Typography color="error" variant="body2" fontWeight="bold">Low Stock</Typography>
                      ) : (
                        <Typography color="success.main" variant="body2">Normal</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No products in inventory.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
}

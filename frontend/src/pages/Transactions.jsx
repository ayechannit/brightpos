import { useState, useEffect } from 'react';
import {  Box, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow, Chip , TableContainer } from '@mui/material';
import api from '../api';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get('/transactions').catch(() => ({ data: [] }));
        setTransactions(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTransactions();
  }, []);

  const getEntityName = (t) => {
    if (t.sale?.customer) return `Customer: ${t.sale.customer.name}`;
    if (t.purchase?.supplier) return `Supplier: ${t.purchase.supplier.name}`;
    if (t.purchase?.supplierName) return `Supplier: ${t.purchase.supplierName}`;
    return '-';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Transaction History (Debit/Credit)</Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Entity (Customer/Supplier)</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{new Date(t.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={t.type} 
                    color={t.type === 'SALE' ? 'success' : 'warning'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>{getEntityName(t)}</TableCell>
                <TableCell align="right">{t.amount.toLocaleString()} Ks</TableCell>
              </TableRow>
            ))}
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">No transactions found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

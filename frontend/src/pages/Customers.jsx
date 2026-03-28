import { useState, useEffect } from 'react';
import {  Box, Paper, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton , TableContainer } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useOutletContext } from 'react-router-dom';
import api from '../api';

export default function Customers() {
  const { user } = useOutletContext();
  const canDelete = user?.role?.permissions?.includes('DELETE_CUSTOMER');
  const [customers, setCustomers] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [editId, setEditId] = useState(null);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers').catch(() => ({ data: [] }));
      setCustomers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpen = (customer = null) => {
    if (customer) {
      setEditId(customer.id);
      setFormData({ name: customer.name, phone: customer.phone || '', address: customer.address || '' });
    } else {
      setEditId(null);
      setFormData({ name: '', phone: '', address: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditId(null);
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await api.put(`/customers/${editId}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      handleClose();
      fetchCustomers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/customers/${id}`);
        fetchCustomers();
      } catch (error) {
        console.error(error);
        alert('Failed to delete customer (it may have sales history).');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Customers</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>Add Customer</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Address</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.address}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(customer)} color="primary">
                    <EditIcon />
                  </IconButton>
                  {canDelete && (
                    <IconButton onClick={() => handleDelete(customer.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">No customers found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editId ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
        <DialogContent>
          <TextField 
            fullWidth label="Name" margin="dense" 
            value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
          />
          <TextField 
            fullWidth label="Phone" margin="dense" 
            value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
          />
          <TextField 
            fullWidth label="Address" margin="dense" multiline rows={2}
            value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!formData.name}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

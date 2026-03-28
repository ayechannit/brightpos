import { useState, useEffect } from 'react';
import {  Box, Paper, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton , TableContainer } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useOutletContext } from 'react-router-dom';
import api from '../api';

export default function Suppliers() {
  const { user } = useOutletContext();
  const canDelete = user?.role?.permissions?.includes('DELETE_SUPPLIER');
  const [suppliers, setSuppliers] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [editId, setEditId] = useState(null);

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers').catch(() => ({ data: [] }));
      setSuppliers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleOpen = (supplier = null) => {
    if (supplier) {
      setEditId(supplier.id);
      setFormData({ name: supplier.name, phone: supplier.phone || '', address: supplier.address || '' });
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
        await api.put(`/suppliers/${editId}`, formData);
      } else {
        await api.post('/suppliers', formData);
      }
      handleClose();
      fetchSuppliers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await api.delete(`/suppliers/${id}`);
        fetchSuppliers();
      } catch (error) {
        console.error(error);
        alert('Failed to delete supplier (it may have purchase history).');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Suppliers</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>Add Supplier</Button>
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
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>{supplier.name}</TableCell>
                <TableCell>{supplier.phone}</TableCell>
                <TableCell>{supplier.address}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(supplier)} color="primary">
                    <EditIcon />
                  </IconButton>
                  {canDelete && (
                    <IconButton onClick={() => handleDelete(supplier.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {suppliers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">No suppliers found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editId ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
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

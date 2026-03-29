import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, TableContainer } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useOutletContext } from 'react-router-dom';
import api from '../api';
import Button from '../components/LoadingButton';
import IconButton from '../components/LoadingIconButton';

export default function Products() {
  const { user } = useOutletContext();
  const canDelete = user?.role?.permissions?.includes('DELETE_PRODUCT');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', barcode: '', price: '', stock: '', categoryId: '' });
  const [filterCategory, setFilterCategory] = useState('');

  const fetchData = async () => {
    try {
      let url = '/products';
      if (filterCategory) {
        url += `?categoryId=${filterCategory}`;
      }
      const [prodRes, catRes] = await Promise.all([
        api.get(url).catch(() => ({ data: [] })),
        api.get('/categories').catch(() => ({ data: [] }))
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterCategory]);

  const handleOpen = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ 
        name: product.name, 
        barcode: product.barcode || '', 
        price: product.price, 
        stock: product.stock,
        categoryId: product.categoryId || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', barcode: '', price: '', stock: '', categoryId: '' });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: formData.name,
        barcode: formData.barcode,
        price: Number(formData.price),
        stock: Number(formData.stock),
        categoryId: formData.categoryId || null
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      
      setOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to save product: " + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchData();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Products</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            select
            label="Filter Category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>
          <Button variant="contained" onClick={() => handleOpen()}>Add Product</Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Barcode</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.category?.name || 'None'}</TableCell>
                <TableCell>{product.barcode}</TableCell>
                <TableCell>{product.price.toLocaleString()}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(product)} color="primary">
                    <EditIcon />
                  </IconButton>
                  {canDelete && (
                    <IconButton onClick={() => handleDelete(product.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">No products found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name" margin="dense" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          
          <TextField
            select
            fullWidth
            label="Category"
            margin="dense"
            value={formData.categoryId}
            onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
          >
            <MenuItem value="">None</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>

          <TextField fullWidth label="Barcode" margin="dense" value={formData.barcode} onChange={(e) => setFormData({...formData, barcode: e.target.value})} />
          <TextField fullWidth label="Price" type="number" margin="dense" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
          <TextField fullWidth label="Stock" type="number" margin="dense" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

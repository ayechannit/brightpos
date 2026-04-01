import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField, TableContainer } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useOutletContext } from 'react-router-dom';
import api from '../api';
import Button from '../components/LoadingButton';
import IconButton from '../components/LoadingIconButton';

export default function Expenses() {
  const { user } = useOutletContext();
  const canDelete = user?.role?.permissions?.includes('DELETE_EXPENSE');
  const [expenses, setExpenses] = useState([]);
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [editId, setEditId] = useState(null);

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses').catch(() => ({ data: [] }));
      setExpenses(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleOpenAdd = () => {
    setEditId(null);
    setDescription('');
    setAmount('');
    setOpen(true);
  };

  const handleEdit = (expense) => {
    setEditId(expense.id);
    setDescription(expense.description);
    setAmount(expense.amount);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    setDescription('');
    setAmount('');
  };

  const handleSave = async () => {
    if (!description || !amount) return;
    try {
      if (editId) {
        await api.put(`/expenses/${editId}`, { description, amount: Number(amount) }).catch(() => {});
      } else {
        await api.post('/expenses', { description, amount: Number(amount) }).catch(() => {});
      }
      handleClose();
      fetchExpenses();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await api.delete(`/expenses/${id}`);
        fetchExpenses();
      } catch (error) {
        console.error(error);
        alert(error.response?.data?.error || 'Failed to delete expense.');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Expenses</Typography>
        <Button variant="contained" color="error" onClick={handleOpenAdd}>Add Expense</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell>Amount (Ks)</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{expense.description}</TableCell>
                <TableCell>{expense.amount.toLocaleString()}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEdit(expense)} color="primary">
                    <EditIcon />
                  </IconButton>
                  {canDelete && (
                    <IconButton onClick={() => handleDelete(expense.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {expenses.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No expenses recorded.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editId ? 'Edit Expense' : 'Record New Expense'}</DialogTitle>
        <DialogContent>
          <TextField 
            fullWidth label="Description (e.g., Electric Bill, Salaries)" 
            margin="dense" value={description} onChange={(e) => setDescription(e.target.value)} 
            autoFocus
          />
          <TextField 
            fullWidth label="Amount (Ks)" type="number" 
            margin="dense" value={amount} onChange={(e) => setAmount(e.target.value)} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="error" disabled={!description || !amount}>
            {editId ? 'Update Expense' : 'Save Expense'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField, TableContainer, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useOutletContext } from 'react-router-dom';
import api from '../api';
import Button from '../components/LoadingButton';
import IconButton from '../components/LoadingIconButton';

export default function Doctors() {
  const { user } = useOutletContext();
  const hasPermission = user?.role?.permissions?.includes('DOCTORS');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [editId, setEditId] = useState(null);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/doctors').catch(() => ({ data: [] }));
      setDoctors(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleOpen = (doctor = null) => {
    if (doctor) {
      setEditId(doctor.id);
      setFormData({ name: doctor.name, phone: doctor.phone || '' });
    } else {
      setEditId(null);
      setFormData({ name: '', phone: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditId(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    try {
      if (editId) {
        await api.put(`/doctors/${editId}`, formData);
      } else {
        await api.post('/doctors', formData);
      }
      handleClose();
      fetchDoctors();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Failed to save doctor.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await api.delete(`/doctors/${id}`);
        fetchDoctors();
      } catch (error) {
        console.error(error);
        alert(error.response?.data?.error || 'Failed to delete doctor.');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Doctors</Typography>
        {hasPermission && (
          <Button variant="contained" onClick={() => handleOpen()}>Add Doctor</Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              {hasPermission && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={hasPermission ? 3 : 2} align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress size={30} />
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {doctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell>{doctor.name}</TableCell>
                    <TableCell>{doctor.phone || 'N/A'}</TableCell>
                    {hasPermission && (
                      <TableCell align="right">
                        <IconButton onClick={() => handleOpen(doctor)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(doctor.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {doctors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={hasPermission ? 3 : 2} align="center">
                      No doctors found.
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle>{editId ? 'Edit Doctor' : 'Add Doctor'}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Doctor Name"
            type="text"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Phone"
            type="text"
            fullWidth
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button onClick={handleSave} color="primary" variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

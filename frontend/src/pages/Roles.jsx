import { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, IconButton, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getRoles, createRole, deleteRole } from '../api';

const AVAILABLE_PERMISSIONS = [
  { key: 'DASHBOARD', label: 'Dashboard' },
  { key: 'POS', label: 'POS' },
  { key: 'USERS', label: 'User Management' },
  { key: 'ROLES', label: 'Role Management' },
  { key: 'CUSTOMERS', label: 'Customers' },
  { key: 'SUPPLIERS', label: 'Suppliers' },
  { key: 'SALES', label: 'Sales History' },
  { key: 'PURCHASES', label: 'Purchases' },
  { key: 'CATEGORIES', label: 'Categories' },
  { key: 'PRODUCTS', label: 'Product Catalog' },
  { key: 'INVENTORY', label: 'Inventory' },
  { key: 'TRANSACTIONS', label: 'Transactions' },
  { key: 'EXPENSES', label: 'Expenses' },
  { key: 'REPORTS', label: 'Financial Report' },
  { key: 'PERFORMANCE', label: 'Product Performance' },
  { key: 'ENTITY_REPORT', label: 'Entity Report' },
  { key: 'PRODUCT_LEDGER', label: 'Product Ledger' },
  { key: 'AGING_REPORT', label: 'Aging Report' },
  { key: 'SETTINGS', label: 'Settings' },
];

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const fetchRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (err) {
      console.error('Failed to fetch roles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handlePermissionChange = (permKey) => {
    setSelectedPermissions(prev => 
      prev.includes(permKey) 
        ? prev.filter(p => p !== permKey) 
        : [...prev, permKey]
    );
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await createRole({ name, permissions: selectedPermissions });
      setMessage('Role created successfully');
      setName('');
      setSelectedPermissions([]);
      fetchRoles();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create role');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this role? Users assigned to this role may lose access.")) {
      try {
        await deleteRole(id);
        setMessage('Role deleted successfully');
        fetchRoles();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete role');
      }
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Role Management</Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Create New Role</Typography>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleCreate}>
          <TextField
            fullWidth
            label="Role Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
            sx={{ maxWidth: 400, mb: 3 }}
          />
          
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Select Permissions (Menu Items Access)
          </Typography>
          <FormGroup sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1 }}>
            {AVAILABLE_PERMISSIONS.map(perm => (
              <FormControlLabel
                key={perm.key}
                control={
                  <Checkbox 
                    checked={selectedPermissions.includes(perm.key)}
                    onChange={() => handlePermissionChange(perm.key)}
                  />
                }
                label={perm.label}
              />
            ))}
          </FormGroup>

          <Button 
            type="submit"
            variant="contained" 
            color="primary" 
            disabled={saving || !name || selectedPermissions.length === 0}
            sx={{ mt: 3 }}
          >
            {saving ? 'Creating...' : 'Create Role'}
          </Button>
        </form>
      </Paper>

      <Typography variant="h6" gutterBottom>Existing Roles</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Role Name</TableCell>
              <TableCell>Permissions count</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((r) => (
              <TableRow key={r.id}>
                <TableCell sx={{ fontWeight: 'bold' }}>{r.name}</TableCell>
                <TableCell>{r.permissions?.length || 0} permissions allowed</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleDelete(r.id)} color="error" title="Delete Role" disabled={r.name === 'Admin'}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {roles.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">No roles found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

import { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { registerUser, getUsers, deleteUser, getRoles } from '../api';
import { useOutletContext } from 'react-router-dom';
import Button from '../components/LoadingButton';
import IconButton from '../components/LoadingIconButton';

export default function Users() {
  const { user: currentUser } = useOutletContext();
  const canDelete = currentUser?.role?.permissions?.includes('DELETE_USER');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [usersData, rolesData] = await Promise.all([
        getUsers(),
        getRoles()
      ]);
      setUsers(usersData);
      setRoles(rolesData);
      if (rolesData.length > 0 && !roleId) {
        setRoleId(rolesData[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await registerUser(username, password, roleId);
      setMessage('User created successfully');
      setUsername('');
      setPassword('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
        setMessage('User deleted successfully');
        fetchData();
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>User Management</Typography>
      
      <Paper sx={{ p: 3, mb: 4, maxWidth: 500 }}>
        <Typography variant="h6" gutterBottom>Create New User</Typography>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleRegister}>
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              value={roleId}
              label="Role"
              onChange={(e) => setRoleId(e.target.value)}
            >
              {roles.map(r => (
                <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            loading={saving}
            disabled={saving || !roleId}
            sx={{ mt: 2 }}
            fullWidth
          >
            {saving ? 'Creating...' : 'Create User'}
          </Button>        </form>
      </Paper>

      <Typography variant="h6" gutterBottom>Existing Users</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.role?.name || 'No Role'}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
                <TableCell align="right">
                  {canDelete && (
                    <IconButton onClick={() => handleDelete(user.id)} color="error" title="Delete">
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">No users found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

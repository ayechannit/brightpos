import { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert, Link, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { loginUser, registerUser, getRoles } from '../api';

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await getRoles();
        setRoles(data);
        if (data.length > 0) {
          // Default to the first role or a specific one if needed
          setRoleId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch roles', err);
      }
    };
    fetchRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (isRegister && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      if (isRegister) {
        await registerUser(username, password, roleId);
        setSuccess('Registration successful! Please sign in.');
        setIsRegister(false);
        setPassword('');
        setConfirmPassword('');
      } else {
        const user = await loginUser(username, password);
        onLogin(user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 400, mx: 2 }}>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            BrightPOS
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {isRegister ? 'Create an account' : 'Sign in to continue'}
          </Typography>
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            required
            autoFocus
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
          {isRegister && (
            <>
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                required
              />
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="role-label">Select Role</InputLabel>
                <Select
                  labelId="role-label"
                  value={roleId}
                  label="Select Role"
                  onChange={(e) => setRoleId(e.target.value)}
                >
                  {roles.map(r => (
                    <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
          <Button 
            type="submit"
            variant="contained" 
            color="primary" 
            disabled={loading}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            fullWidth
          >
            {loading ? (isRegister ? 'Creating Account...' : 'Signing in...') : (isRegister ? 'Register' : 'Sign In')}
          </Button>
          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Link component="button" variant="body2" onClick={toggleMode}>
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
            </Link>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

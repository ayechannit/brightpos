import { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Alert, CircularProgress } from '@mui/material';
import api from '../api';
import Button from '../components/LoadingButton';

export default function Settings() {
  const [settings, setSettings] = useState({ 
    shopName: 'Lin Yaung Thit', 
    shopAddress: '', 
    shopPhone: '', 
    printerWidth: 80, 
    printerHeight: '' 
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings').catch(() => ({ 
        data: { shopName: 'Lin Yaung Thit', shopAddress: '', shopPhone: '', printerWidth: 80, printerHeight: null } 
      }));
      setSettings({
        shopName: res.data?.shopName || 'Lin Yaung Thit',
        shopAddress: res.data?.shopAddress || '',
        shopPhone: res.data?.shopPhone || '',
        printerWidth: res.data?.printerWidth || 80,
        printerHeight: res.data?.printerHeight || ''
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        shopName: settings.shopName,
        shopAddress: settings.shopAddress,
        shopPhone: settings.shopPhone,
        printerWidth: Number(settings.printerWidth),
        printerHeight: settings.printerHeight ? Number(settings.printerHeight) : null
      };
      await api.post('/settings', payload).catch(() => {});
      setMessage('Settings saved successfully');
    } catch (error) {
      setMessage('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Settings</Typography>
      <Paper sx={{ p: 3, maxWidth: 600 }}>
        {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}
        
        <Typography variant="h6" gutterBottom>Shop Details</Typography>
        <TextField
          fullWidth
          label="Shop Name"
          value={settings.shopName}
          onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Address"
          multiline
          rows={2}
          value={settings.shopAddress}
          onChange={(e) => setSettings({ ...settings, shopAddress: e.target.value })}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Phone"
          value={settings.shopPhone}
          onChange={(e) => setSettings({ ...settings, shopPhone: e.target.value })}
          margin="normal"
        />

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Printer Settings</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Set the dimensions for your slip printer (in mm). Standard widths are 58mm or 80mm.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            label="Printer Width (mm)"
            type="number"
            value={settings.printerWidth}
            onChange={(e) => setSettings({ ...settings, printerWidth: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Printer Height (mm) [Optional]"
            type="number"
            value={settings.printerHeight}
            onChange={(e) => setSettings({ ...settings, printerHeight: e.target.value })}
            margin="normal"
            helperText="Leave empty for auto-height"
          />
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          loading={saving}
          disabled={saving}
          sx={{ mt: 3 }}
          fullWidth
        >
          {saving ? 'Saving...' : 'Save All Settings'}
        </Button>      </Paper>
    </Box>
  );
}

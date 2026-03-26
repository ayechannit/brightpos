import { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import SettingsIcon from '@mui/icons-material/Settings';
import CategoryIcon from '@mui/icons-material/Category';
import PaidIcon from '@mui/icons-material/Paid';
import PeopleIcon from '@mui/icons-material/People';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const drawerWidth = 260;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'POS', icon: <PointOfSaleIcon />, path: '/pos' },
  { text: 'Customers', icon: <PeopleIcon />, path: '/customers' },
  { text: 'Suppliers', icon: <LocalShippingIcon />, path: '/suppliers' },
  { text: 'Sales History', icon: <ReceiptLongIcon />, path: '/sales' },
  { text: 'Purchases (Restock)', icon: <ShoppingCartIcon />, path: '/purchases' },
  { text: 'Categories', icon: <LocalOfferIcon />, path: '/categories' },
  { text: 'Product Catalog', icon: <CategoryIcon />, path: '/products' },
  { text: 'Inventory Management', icon: <InventoryIcon />, path: '/inventory' },
  { text: 'Transactions (Debit/Credit)', icon: <PaidIcon />, path: '/transactions' },
  { text: 'Expenses', icon: <MoneyOffIcon />, path: '/expenses' },
  { text: 'Financial Report', icon: <AssessmentIcon />, path: '/reports' },
  { text: 'Product Performance', icon: <LeaderboardIcon />, path: '/performance' },
  { text: 'Customer/Supplier Report', icon: <AssignmentIndIcon />, path: '/entity-report' },
  { text: 'Product Ledger', icon: <ListAltIcon />, path: '/product-ledger' },
  { text: 'AR/AP Aging Report', icon: <AccessTimeIcon />, path: '/aging-report' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {isMobile && (
        <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '64px !important', borderBottom: '1px solid', borderColor: 'divider', mb: 1 }}>
          <LightModeIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, letterSpacing: '-0.02em', color: 'text.primary' }}>
            Bright<span style={{ color: '#4338ca' }}>POS</span>
          </Typography>
        </Toolbar>
      )}
      {!isMobile && <Box sx={{ mt: 8 }} />}
      <List sx={{ px: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton 
                selected={isSelected}
                onClick={() => handleNavigate(item.path)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.contrastText,
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    }
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isSelected ? 'inherit' : theme.palette.text.secondary }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: isSelected ? 600 : 500,
                    fontSize: '0.875rem' 
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <LightModeIcon sx={{ mr: 1.5, color: 'primary.main' }} />
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, letterSpacing: '-0.02em', color: 'text.primary' }}>
            Bright<span style={{ color: '#4338ca' }}>POS</span>
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: 0, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: 'background.default' }}>
        <Toolbar sx={{ minHeight: '64px !important' }} />
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

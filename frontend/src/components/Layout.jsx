import { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, useTheme, useMediaQuery, Menu, MenuItem } from '@mui/material';
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
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Button from './LoadingButton';
import IconButton from './LoadingIconButton';

const drawerWidth = 260;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/', permission: 'DASHBOARD' },
  { text: 'POS', icon: <PointOfSaleIcon />, path: '/pos', permission: 'POS' },
  { text: 'Users', icon: <PersonAddIcon />, path: '/users', permission: 'USERS' },
  { text: 'Roles', icon: <AdminPanelSettingsIcon />, path: '/roles', permission: 'ROLES' },
  { text: 'Customers', icon: <PeopleIcon />, path: '/customers', permission: 'CUSTOMERS' },
  { text: 'Suppliers', icon: <LocalShippingIcon />, path: '/suppliers', permission: 'SUPPLIERS' },
  { text: 'Sales History', icon: <ReceiptLongIcon />, path: '/sales', permission: 'SALES' },
  { text: 'Purchases (Restock)', icon: <ShoppingCartIcon />, path: '/purchases', permission: 'PURCHASES' },
  { text: 'Categories', icon: <LocalOfferIcon />, path: '/categories', permission: 'CATEGORIES' },
  { text: 'Product Catalog', icon: <CategoryIcon />, path: '/products', permission: 'PRODUCTS' },
  { text: 'Inventory Management', icon: <InventoryIcon />, path: '/inventory', permission: 'INVENTORY' },
  { text: 'Transactions (Debit/Credit)', icon: <PaidIcon />, path: '/transactions', permission: 'TRANSACTIONS' },
  { text: 'Expenses', icon: <MoneyOffIcon />, path: '/expenses', permission: 'EXPENSES' },
  { text: 'Financial Report', icon: <AssessmentIcon />, path: '/reports', permission: 'REPORTS' },
  { text: 'Product Performance', icon: <LeaderboardIcon />, path: '/performance', permission: 'PERFORMANCE' },
  { text: 'Customer/Supplier Report', icon: <AssignmentIndIcon />, path: '/entity-report', permission: 'ENTITY_REPORT' },
  { text: 'Product Ledger', icon: <ListAltIcon />, path: '/product-ledger', permission: 'PRODUCT_LEDGER' },
  { text: 'AR/AP Aging Report', icon: <AccessTimeIcon />, path: '/aging-report', permission: 'AGING_REPORT' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings', permission: 'SETTINGS' },
];

export default function Layout({ onLogout, user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const userPermissions = user?.role?.permissions || [];
  const visibleMenuItems = menuItems.filter(item => userPermissions.includes(item.permission));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleCloseMenu();
    if (onLogout) onLogout();
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
        {visibleMenuItems.map((item) => {
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
          <LightModeIcon sx={{ mr: 1.5, color: 'primary.main', display: { xs: 'none', md: 'flex' } }} />
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, letterSpacing: '-0.02em', color: 'text.primary', flexGrow: 1 }}>
            {isMobile ? '' : <>Bright<span style={{ color: '#4338ca' }}>POS</span></>}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {user && (
              <Typography variant="subtitle2" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
                {user.username}
              </Typography>
            )}
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="primary"
            >
              <AccountCircleIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
            >
              <MenuItem disabled>{user?.username}</MenuItem>
              <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
            </Menu>
          </Box>
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
          <Outlet context={{ user }} />
        </Box>
      </Box>
    </Box>
  );
}

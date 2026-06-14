import React, { useState } from 'react';
import {
  Box, Drawer, AppBar, Toolbar, Typography, IconButton,
  List, ListItemButton, ListItemIcon, ListItemText,
  Avatar, Divider, Badge, Tooltip, useTheme, useMediaQuery,
  Menu, MenuItem,
} from '@mui/material';
import {
  Dashboard, People, CalendarMonth, LocalPharmacy, Biotech, Receipt,
  AdminPanelSettings, Menu as MenuIcon, Notifications, DarkMode, LightMode,
  LocalHospital, ExitToApp, AccountCircle, ChevronLeft, MedicalServices,
  BarChart, SwapHoriz,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, ROLE_PERMISSIONS } from '../contexts/AuthContext';
import { useColorMode } from '../contexts/ColorModeContext';
import SyncIndicator from './SyncIndicator';

const DRAWER_WIDTH = 260;
const DRAWER_COLLAPSED = 72;

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { key: 'patients', label: 'Patients', icon: <People />, path: '/patients' },
  { key: 'doctors', label: 'Doctors', icon: <MedicalServices />, path: '/doctors' },
  { key: 'appointments', label: 'Appointments', icon: <CalendarMonth />, path: '/appointments' },
  { key: 'pharmacy', label: 'Pharmacy POS', icon: <LocalPharmacy />, path: '/pharmacy' },
  { key: 'lab', label: 'Lab Tests', icon: <Biotech />, path: '/lab' },
  { key: 'billing', label: 'Billing', icon: <Receipt />, path: '/billing' },
  { key: 'hospitals', label: 'Hospitals', icon: <LocalHospital />, path: '/hospitals' },
  { key: 'transfers', label: 'Transfers', icon: <SwapHoriz />, path: '/transfers' },
  { key: 'reports', label: 'Reports', icon: <BarChart />, path: '/reports' },
  { key: 'admin', label: 'Admin Panel', icon: <AdminPanelSettings />, path: '/admin' },
];

const ROLE_COLORS: Record<string, string> = {
  admin: '#1565C0', doctor: '#00897B', receptionist: '#F57C00',
  pharmacist: '#C62828', lab_tech: '#6A1B9A', cashier: '#1B5E20',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useColorMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const permissions = user ? ROLE_PERMISSIONS[user.role] : [];
  const visibleNav = NAV_ITEMS.filter(item => permissions.includes(item.key));
  const drawerWidth = collapsed && !isMobile ? DRAWER_COLLAPSED : DRAWER_WIDTH;
  const roleColor = user ? (ROLE_COLORS[user.role] || '#1565C0') : '#1565C0';

  const DrawerContent = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{
        p: collapsed && !isMobile ? 1.5 : 2, display: 'flex', alignItems: 'center', gap: 1.5,
        background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)', minHeight: 64,
      }}>
        <Box sx={{
          width: 40, height: 40, borderRadius: '10px', background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <LocalHospital sx={{ color: '#fff', fontSize: 24 }} />
        </Box>
        {(!collapsed || isMobile) && (
          <Box>
            <Typography variant="subtitle2" fontWeight={700} color="#fff" lineHeight={1.2}>SehatConnect</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem' }}>POS & Clinic Management</Typography>
          </Box>
        )}
        {!isMobile && (
          <IconButton onClick={() => setCollapsed(!collapsed)} sx={{ ml: 'auto', color: '#fff', flexShrink: 0 }} size="small">
            <ChevronLeft sx={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
          </IconButton>
        )}
      </Box>

      {(!collapsed || isMobile) && (
        <Box sx={{
          p: 2, mx: 1, my: 1, borderRadius: 2,
          background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(21,101,192,0.06)',
          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(21,101,192,0.1)'}`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: roleColor, width: 38, height: 38, fontSize: '0.9rem', fontWeight: 700 }}>
              {user?.name?.charAt(0)}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="body2" fontWeight={600} noWrap>{user?.name}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ textTransform: 'capitalize' }}>
                {user?.role?.replace('_', ' ')}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
      {collapsed && !isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
          <Avatar sx={{ bgcolor: roleColor, width: 38, height: 38 }}>{user?.name?.charAt(0)}</Avatar>
        </Box>
      )}

      <Divider sx={{ mx: 1 }} />

      <List sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        {visibleNav.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.div key={item.key} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}>
              <Tooltip title={collapsed && !isMobile ? item.label : ''} placement="right">
                <ListItemButton
                  selected={isActive}
                  onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                  sx={{
                    mx: 1, mb: 0.5, borderRadius: 2,
                    justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                    px: collapsed && !isMobile ? 1 : 2,
                    '&.Mui-selected': {
                      background: 'linear-gradient(135deg, #1565C0 0%, #1E88E5 100%)',
                      '& .MuiListItemIcon-root': { color: '#fff' },
                      '& .MuiListItemText-primary': { color: '#fff', fontWeight: 700 },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: collapsed && !isMobile ? 0 : 36, color: isActive ? '#fff' : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  {(!collapsed || isMobile) && (
                    <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isActive ? 700 : 500 }} />
                  )}
                </ListItemButton>
              </Tooltip>
            </motion.div>
          );
        })}
      </List>

      <Divider sx={{ mx: 1 }} />
      <Box sx={{ p: 1 }}>
        <Tooltip title={collapsed && !isMobile ? 'Logout' : ''} placement="right">
          <ListItemButton onClick={logout} sx={{ borderRadius: 2, color: 'error.main', justifyContent: collapsed && !isMobile ? 'center' : 'flex-start' }}>
            <ListItemIcon sx={{ minWidth: collapsed && !isMobile ? 0 : 36, color: 'error.main' }}><ExitToApp /></ListItemIcon>
            {(!collapsed || isMobile) && <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.875rem', color: 'error.main', fontWeight: 600 }} />}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {!isMobile && (
        <Drawer variant="permanent" sx={{
          width: drawerWidth, flexShrink: 0, transition: 'width 0.3s ease',
          '& .MuiDrawer-paper': {
            width: drawerWidth, overflow: 'hidden', transition: 'width 0.3s ease',
            borderRight: 'none', boxShadow: '4px 0 20px rgba(0,0,0,0.08)',
            background: theme.palette.background.paper,
          },
        }}>
          <DrawerContent />
        </Drawer>
      )}
      {isMobile && (
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, background: theme.palette.background.paper } }}>
          <DrawerContent />
        </Drawer>
      )}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <AppBar position="sticky" elevation={0} sx={{
          background: theme.palette.mode === 'dark' ? 'rgba(13,30,61,0.95)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)', borderBottom: `1px solid ${theme.palette.divider}`, color: 'text.primary',
        }}>
          <Toolbar>
            {isMobile && <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}><MenuIcon /></IconButton>}
            <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }} noWrap>
              {visibleNav.find(n => location.pathname.startsWith(n.path))?.label || 'Dashboard'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SyncIndicator />
              <IconButton onClick={toggleMode} size="small">{mode === 'dark' ? <LightMode /> : <DarkMode />}</IconButton>
              <IconButton size="small">
                <Badge badgeContent={3} color="error"><Notifications /></Badge>
              </IconButton>
              <IconButton size="small" onClick={e => setAnchorEl(e.currentTarget)}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: roleColor, fontSize: '0.8rem', fontWeight: 700 }}>{user?.name?.charAt(0)}</Avatar>
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={() => setAnchorEl(null)}><AccountCircle sx={{ mr: 1 }} />Profile</MenuItem>
                <Divider />
                <MenuItem onClick={() => { logout(); setAnchorEl(null); }} sx={{ color: 'error.main' }}><ExitToApp sx={{ mr: 1 }} />Logout</MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {children}
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
}

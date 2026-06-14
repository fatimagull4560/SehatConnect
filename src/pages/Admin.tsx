import { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Switch,
  FormControlLabel, Divider, Paper, Alert, LinearProgress,
} from '@mui/material';
import {
  Add, AdminPanelSettings, People, Sync, Security, Backup,
  CheckCircle, CloudDone, Warning, Settings, Notifications,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSyncContext } from '../contexts/SyncContext';

const ROLES = ['Admin', 'Doctor', 'Receptionist', 'Pharmacist', 'Lab Technician', 'Cashier'] as const;

interface StaffMember {
  id: string; name: string; role: typeof ROLES[number]; email: string;
  phone: string; active: boolean; lastLogin: string; pin: string;
}

const INIT_STAFF: StaffMember[] = [
  { id: '1', name: 'Dr. Ahmed Hassan', role: 'Doctor', email: 'ahmed@sehat.pk', phone: '0300-1234567', active: true, lastLogin: '2026-05-29 09:15', pin: '1111' },
  { id: '2', name: 'Fatima Noor', role: 'Receptionist', email: 'fatima.r@sehat.pk', phone: '0311-9876543', active: true, lastLogin: '2026-05-29 08:45', pin: '2222' },
  { id: '3', name: 'Bilal Pharmacy', role: 'Pharmacist', email: 'bilal.ph@sehat.pk', phone: '0321-5555555', active: true, lastLogin: '2026-05-29 09:00', pin: '3333' },
  { id: '4', name: 'Sara Lab', role: 'Lab Technician', email: 'sara.lab@sehat.pk', phone: '0333-7777777', active: false, lastLogin: '2026-05-28 17:30', pin: '4444' },
  { id: '5', name: 'Khalid Admin', role: 'Admin', email: 'khalid@sehat.pk', phone: '0344-2222222', active: true, lastLogin: '2026-05-29 10:00', pin: '9999' },
];

const activityLog = [
  { time: '10:42 AM', user: 'Fatima Noor', action: 'Registered new patient: Ahmed Baloch', type: 'create' },
  { time: '10:35 AM', user: 'Bilal Pharmacy', action: 'Completed pharmacy sale — INV-G7H8I9', type: 'sale' },
  { time: '10:21 AM', user: 'Dr. Ahmed Hassan', action: 'Marked appointment #03 as completed', type: 'update' },
  { time: '10:10 AM', user: 'Sara Lab', action: 'Updated lab test LAB-002 to processing', type: 'update' },
  { time: '09:55 AM', user: 'Khalid Admin', action: 'Added Dr. Zainab Baloch to staff', type: 'create' },
  { time: '09:30 AM', user: 'Fatima Noor', action: 'Booked appointment for Khalid Mengal', type: 'create' },
  { time: '09:15 AM', user: 'System', action: 'Auto-sync completed — 12 records uploaded', type: 'sync' },
  { time: '09:00 AM', user: 'System', action: 'Daily backup started', type: 'system' },
];

const LOG_COLORS: Record<string, string> = {
  create: '#2E7D32', update: '#E65100', sale: '#1565C0', sync: '#00897B', system: '#78909C',
};

export default function Admin() {
  const { syncStatus, pendingCount, isOnline, triggerSync } = useSyncContext();
  const [tab, setTab] = useState<'staff' | 'activity' | 'settings' | 'backup'>('staff');
  const [staff, setStaff] = useState<StaffMember[]>(INIT_STAFF);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: '', role: 'Receptionist' as typeof ROLES[number], email: '', phone: '', pin: '' });
  const [syncing, setSyncing] = useState(false);

  const handleAddStaff = () => {
    const newS: StaffMember = {
      id: String(Date.now()), ...form, active: true,
      lastLogin: 'Never',
    };
    setStaff(prev => [...prev, newS]);
    setAddOpen(false);
    setForm({ name: '', role: 'Receptionist', email: '', phone: '', pin: '' });
  };

  const toggleActive = (id: string) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleSync = async () => {
    setSyncing(true);
    await triggerSync();
    setTimeout(() => setSyncing(false), 2000);
  };

  const TABS = [
    { key: 'staff', label: 'Staff Management', icon: <People /> },
    { key: 'activity', label: 'Activity Log', icon: <Security /> },
    { key: 'settings', label: 'Settings', icon: <Settings /> },
    { key: 'backup', label: 'Sync & Backup', icon: <Backup /> },
  ] as const;

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Admin Panel</Typography>
            <Typography variant="body2" color="text.secondary">Staff management • System settings • Sync control</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={isOnline ? 'Online' : 'Offline'}
              color={isOnline ? 'success' : 'error'}
              icon={isOnline ? <CloudDone /> : <Warning />}
              size="small"
            />
          </Box>
        </Box>
      </motion.div>

      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <Button key={t.key} variant={tab === t.key ? 'contained' : 'outlined'} startIcon={t.icon} size="small" onClick={() => setTab(t.key)} sx={{ minWidth: 160 }}>
            {t.label}
          </Button>
        ))}
      </Box>

      {tab === 'staff' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" startIcon={<Add />} onClick={() => setAddOpen(true)}>Add Staff</Button>
          </Box>
          <Card>
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Staff Member</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>PIN</TableCell>
                      <TableCell>Last Login</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {staff.map((s, i) => (
                      <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} style={{ display: 'table-row' }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', color: 'primary.dark', fontSize: '0.8rem', fontWeight: 700 }}>
                              {s.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>{s.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{s.email}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={s.role} size="small" color={s.role === 'Admin' ? 'error' : s.role === 'Doctor' ? 'primary' : 'default'} sx={{ fontSize: '0.65rem' }} />
                        </TableCell>
                        <TableCell><Typography variant="caption">{s.phone}</Typography></TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: 'action.hover', px: 1, py: 0.25, borderRadius: 1 }}>••••</Typography>
                        </TableCell>
                        <TableCell><Typography variant="caption">{s.lastLogin}</Typography></TableCell>
                        <TableCell>
                          <Chip label={s.active ? 'Active' : 'Inactive'} size="small" color={s.active ? 'success' : 'default'} sx={{ fontSize: '0.65rem' }} />
                        </TableCell>
                        <TableCell align="right">
                          <Switch size="small" checked={s.active} onChange={() => toggleActive(s.id)} color="success" />
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {tab === 'activity' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={700}>Recent Activity</Typography>
                <Typography variant="caption" color="text.secondary">Today's actions across all staff</Typography>
              </Box>
              {activityLog.map((log, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, p: 2, borderBottom: i < activityLog.length - 1 ? '1px solid' : 'none', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: LOG_COLORS[log.type] ?? '#78909C', mt: 0.75, flexShrink: 0 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600}>{log.action}</Typography>
                    <Typography variant="caption" color="text.secondary">{log.user}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>{log.time}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {tab === 'settings' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <AdminPanelSettings color="primary" />
                    <Typography variant="h6" fontWeight={700}>Clinic Settings</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField label="Clinic Name" defaultValue="SehatConnect Clinic" size="small" fullWidth />
                    <TextField label="NHSRC Registration" defaultValue="PKB-2024-001" size="small" fullWidth />
                    <TextField label="City" defaultValue="Quetta, Balochistan" size="small" fullWidth />
                    <TextField label="Phone" defaultValue="081-1234567" size="small" fullWidth />
                    <TextField label="Invoice Prefix" defaultValue="INV" size="small" fullWidth />
                    <Button variant="contained" size="small" startIcon={<CheckCircle />} sx={{ alignSelf: 'flex-start' }}>Save Settings</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Notifications color="primary" />
                    <Typography variant="h6" fontWeight={700}>Feature Toggles</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {[
                      { label: 'Auto-sync when online', defaultChecked: true },
                      { label: 'Low stock alerts', defaultChecked: true },
                      { label: 'Print receipts automatically', defaultChecked: false },
                      { label: 'PIN login enabled', defaultChecked: true },
                      { label: 'Offline mode', defaultChecked: true },
                      { label: 'Dark mode by default', defaultChecked: false },
                    ].map(opt => (
                      <FormControlLabel
                        key={opt.label}
                        control={<Switch defaultChecked={opt.defaultChecked} size="small" />}
                        label={<Typography variant="body2">{opt.label}</Typography>}
                        sx={{ m: 0 }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      )}

      {tab === 'backup' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Sync color="primary" />
                    <Typography variant="h6" fontWeight={700}>Sync Status</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Paper sx={{ p: 2, bgcolor: isOnline ? 'success.50' : 'error.50', border: '1px solid', borderColor: isOnline ? 'success.light' : 'error.light', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {isOnline ? <CloudDone color="success" /> : <Warning color="error" />}
                        <Typography variant="subtitle2" fontWeight={700} color={isOnline ? 'success.main' : 'error.main'}>
                          {isOnline ? 'Connected to Internet' : 'Offline Mode Active'}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {isOnline ? 'Data will sync automatically' : 'Changes stored locally, will sync when online'}
                      </Typography>
                    </Paper>

                    {pendingCount > 0 && (
                      <Alert severity="warning" icon={<Sync />}>
                        {pendingCount} records pending sync to Supabase
                      </Alert>
                    )}

                    {syncing && <LinearProgress sx={{ borderRadius: 2 }} />}

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button variant="contained" startIcon={<Sync />} onClick={handleSync} disabled={syncing || !isOnline} fullWidth>
                        {syncing ? 'Syncing...' : 'Sync Now'}
                      </Button>
                    </Box>

                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Sync Status: <strong>{syncStatus}</strong></Typography>
                      <Typography variant="caption" color="text.secondary">Last sync: 2026-05-29 10:42 AM</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Backup color="primary" />
                    <Typography variant="h6" fontWeight={700}>Backup & Export</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      { label: 'Patients Data', count: '6 records', color: '#1565C0' },
                      { label: 'Appointments', count: '43 records', color: '#00897B' },
                      { label: 'Pharmacy Transactions', count: '128 records', color: '#E65100' },
                      { label: 'Lab Test Orders', count: '89 records', color: '#2E7D32' },
                      { label: 'Billing & Invoices', count: '215 records', color: '#C62828' },
                    ].map(item => (
                      <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                          <Typography variant="body2" fontWeight={600}>{item.label}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" color="text.secondary">{item.count}</Typography>
                          <Chip label="Export" size="small" variant="outlined" sx={{ fontSize: '0.6rem', height: 20, cursor: 'pointer' }} />
                        </Box>
                      </Box>
                    ))}
                    <Button variant="outlined" startIcon={<Backup />} fullWidth>Export All Data (JSON)</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      )}

      {/* Add Staff Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle><Typography variant="h6" fontWeight={700}>Add Staff Member</Typography></DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} fullWidth required size="small" />
            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select value={form.role} label="Role" onChange={e => setForm(f => ({ ...f, role: e.target.value as typeof ROLES[number] }))}>
                {ROLES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} fullWidth size="small" type="email" />
            <TextField label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} fullWidth size="small" />
            <TextField label="PIN (4 digits)" value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value.slice(0, 4) }))} fullWidth size="small" inputProps={{ maxLength: 4, pattern: '[0-9]*' }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setAddOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleAddStaff} variant="contained" disabled={!form.name || !form.role} startIcon={<Add />}>Add Staff</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

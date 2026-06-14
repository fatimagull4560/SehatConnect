import { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Avatar, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, InputAdornment, Tooltip,
} from '@mui/material';
import { Add, Search, FilterList, People, Male, Female, QrCode2, Edit, Visibility } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { generateId, generateMRN } from '../lib/db';

interface Patient {
  id: string; mrn: string; name: string; phone: string; dob: string;
  gender: 'male' | 'female' | 'other'; address: string; bloodGroup: string;
  createdAt: string; synced: boolean;
}

const SAMPLE_PATIENTS: Patient[] = [
  { id: '1', mrn: 'MRN-A1B2C3', name: 'Muhammad Ali Khan', phone: '0300-1234567', dob: '1983-05-15', gender: 'male', address: 'Quetta, Balochistan', bloodGroup: 'B+', createdAt: new Date().toISOString(), synced: true },
  { id: '2', mrn: 'MRN-D4E5F6', name: 'Fatima Noor Baloch', phone: '0311-9876543', dob: '1991-08-22', gender: 'female', address: 'Mastung, Balochistan', bloodGroup: 'A+', createdAt: new Date().toISOString(), synced: true },
  { id: '3', mrn: 'MRN-G7H8I9', name: 'Ahmed Hassan Mengal', phone: '0321-5555555', dob: '1977-12-03', gender: 'male', address: 'Turbat, Balochistan', bloodGroup: 'O+', createdAt: new Date().toISOString(), synced: false },
  { id: '4', mrn: 'MRN-J1K2L3', name: 'Ayesha Siddiqui', phone: '0333-7777777', dob: '1993-03-18', gender: 'female', address: 'Gwadar, Balochistan', bloodGroup: 'AB+', createdAt: new Date().toISOString(), synced: true },
  { id: '5', mrn: 'MRN-M4N5O6', name: 'Khalid Hussain Bugti', phone: '0344-2222222', dob: '1968-09-30', gender: 'male', address: 'Dera Bugti, Balochistan', bloodGroup: 'A-', createdAt: new Date().toISOString(), synced: true },
  { id: '6', mrn: 'MRN-P7Q8R9', name: 'Sara Zahra Rind', phone: '0315-3333333', dob: '2000-07-11', gender: 'female', address: 'Khuzdar, Balochistan', bloodGroup: 'B-', createdAt: new Date().toISOString(), synced: false },
];

function calcAge(dob: string) {
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000));
}

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>(SAMPLE_PATIENTS);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [viewPatient, setViewPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', dob: '', gender: 'male' as const, address: '', bloodGroup: '' });

  const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search) || p.mrn.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = () => {
    const newP: Patient = {
      id: generateId(), mrn: generateMRN(), ...form, gender: form.gender as Patient['gender'],
      createdAt: new Date().toISOString(), synced: false,
    };
    setPatients(prev => [newP, ...prev]);
    setAddOpen(false);
    setForm({ name: '', phone: '', dob: '', gender: 'male', address: '', bloodGroup: '' });
  };

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Patient Management</Typography>
            <Typography variant="body2" color="text.secondary">{patients.length} registered patients • {patients.filter(p => !p.synced).length} pending sync</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<Add />} size="small">Export</Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => setAddOpen(true)}>Add Patient</Button>
          </Box>
        </Box>
      </motion.div>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Patients', value: patients.length, icon: <People />, color: '#1565C0' },
          { label: 'New Today', value: 7, icon: <Add />, color: '#00897B' },
          { label: 'Male', value: patients.filter(p => p.gender === 'male').length, icon: <Male />, color: '#0277BD' },
          { label: 'Female', value: patients.filter(p => p.gender === 'female').length, icon: <Female />, color: '#C62828' },
        ].map((s, i) => (
          <Grid key={s.label} size={{ xs: 6, sm: 3 }}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card sx={{ textAlign: 'center', p: 1.5, border: `1px solid ${s.color}20`, bgcolor: `${s.color}05` }}>
                <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: `${s.color}20`, color: s.color, width: 44, height: 44 }}>{s.icon}</Avatar>
                <Typography variant="h5" fontWeight={700} sx={{ color: s.color }}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, display: 'flex', gap: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <TextField
              placeholder="Search by name, phone, or MRN..." value={search} onChange={e => setSearch(e.target.value)}
              size="small" sx={{ flex: 1 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
            />
            <Button variant="outlined" startIcon={<FilterList />} size="small">Filter</Button>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Patient</TableCell>
                  <TableCell>MRN</TableCell>
                  <TableCell>Age/Gender</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Blood Group</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Sync</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: p.gender === 'female' ? '#C6282820' : '#1565C020', color: p.gender === 'female' ? '#C62828' : '#1565C0', fontSize: '0.8rem', fontWeight: 700 }}>
                          {p.name.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: 'action.hover', px: 1, py: 0.5, borderRadius: 1 }}>{p.mrn}</Typography></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                        <Typography variant="body2">{calcAge(p.dob)}y</Typography>
                        <Chip label={p.gender.charAt(0).toUpperCase() + p.gender.slice(1)} size="small" color={p.gender === 'female' ? 'error' : 'primary'} sx={{ fontSize: '0.65rem', height: 20 }} />
                      </Box>
                    </TableCell>
                    <TableCell><Typography variant="body2">{p.phone}</Typography></TableCell>
                    <TableCell><Chip label={p.bloodGroup || '—'} size="small" color="warning" sx={{ fontSize: '0.7rem', fontWeight: 700 }} /></TableCell>
                    <TableCell><Typography variant="caption" color="text.secondary">{p.address}</Typography></TableCell>
                    <TableCell>
                      <Chip label={p.synced ? 'Synced' : 'Offline'} size="small" color={p.synced ? 'success' : 'default'} sx={{ fontSize: '0.65rem' }} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View"><IconButton size="small" onClick={() => setViewPatient(p)}><Visibility fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="QR Code"><IconButton size="small"><QrCode2 fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Edit"><IconButton size="small"><Edit fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add Patient Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle><Typography variant="h6" fontWeight={700}>Add New Patient</Typography></DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} fullWidth required />
            <TextField label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} fullWidth required />
            <TextField label="Date of Birth" type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
            <FormControl fullWidth size="small">
              <InputLabel>Gender</InputLabel>
              <Select value={form.gender} label="Gender" onChange={e => setForm(f => ({ ...f, gender: e.target.value as 'male' }))}>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} fullWidth />
            <TextField label="Blood Group" value={form.bloodGroup} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))} fullWidth placeholder="e.g. A+, B-, O+" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setAddOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleAdd} variant="contained" disabled={!form.name || !form.phone}>Add Patient</Button>
        </DialogActions>
      </Dialog>

      {/* View Patient Dialog */}
      <Dialog open={!!viewPatient} onClose={() => setViewPatient(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {viewPatient && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 52, height: 52, bgcolor: 'primary.light', color: 'primary.dark', fontSize: '1.2rem', fontWeight: 700 }}>{viewPatient.name.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>{viewPatient.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{viewPatient.mrn}</Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                {[
                  { label: 'Age', value: `${calcAge(viewPatient.dob)} years` },
                  { label: 'Gender', value: viewPatient.gender },
                  { label: 'Phone', value: viewPatient.phone },
                  { label: 'Blood Group', value: viewPatient.bloodGroup || '—' },
                  { label: 'Address', value: viewPatient.address },
                  { label: 'Registered', value: new Date(viewPatient.createdAt).toLocaleDateString() },
                ].map(row => (
                  <Grid key={row.label} size={6}>
                    <Typography variant="caption" color="text.secondary">{row.label}</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>{row.value}</Typography>
                  </Grid>
                ))}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button startIcon={<QrCode2 />} variant="outlined">QR Code</Button>
              <Button onClick={() => setViewPatient(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

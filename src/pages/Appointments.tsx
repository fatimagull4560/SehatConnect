import { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Paper,
} from '@mui/material';
import { Add, CalendarToday, AccessTime, Person, NavigateNext } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface Appointment {
  id: string; token: number; patient: string; doctor: string;
  time: string; date: string; fee: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  type: string;
}

const INIT_APPTS: Appointment[] = [
  { id: '1', token: 1, patient: 'Muhammad Ali', doctor: 'Dr. Ahmed Hassan', time: '09:00', date: '2026-05-29', fee: 800, status: 'completed', type: 'General' },
  { id: '2', token: 2, patient: 'Fatima Noor', doctor: 'Dr. Fatima Malik', time: '09:30', date: '2026-05-29', fee: 1200, status: 'in-progress', type: 'Gynecology' },
  { id: '3', token: 3, patient: 'Ahmed Baloch', doctor: 'Dr. Ahmed Hassan', time: '10:00', date: '2026-05-29', fee: 800, status: 'scheduled', type: 'General' },
  { id: '4', token: 4, patient: 'Sara Hassan', doctor: 'Dr. Sara Rind', time: '10:30', date: '2026-05-29', fee: 1500, status: 'scheduled', type: 'Dermatology' },
  { id: '5', token: 5, patient: 'Khalid Mengal', doctor: 'Dr. Bilal Mengal', time: '11:00', date: '2026-05-29', fee: 700, status: 'scheduled', type: 'Pediatrics' },
];

const STATUS_COLORS: Record<Appointment['status'], 'success' | 'warning' | 'default' | 'error'> = {
  completed: 'success', 'in-progress': 'warning', scheduled: 'default', cancelled: 'error',
};

const NEXT_STATUS: Record<Appointment['status'], Appointment['status'] | null> = {
  scheduled: 'in-progress', 'in-progress': 'completed', completed: null, cancelled: null,
};

export default function Appointments() {
  const [appts, setAppts] = useState<Appointment[]>(INIT_APPTS);
  const [bookOpen, setBookOpen] = useState(false);
  const [form, setForm] = useState({ patient: '', doctor: 'Dr. Ahmed Hassan', date: '', time: '', type: 'General' });

  const current = appts.find(a => a.status === 'in-progress');
  const waiting = appts.filter(a => a.status === 'scheduled');

  const advance = (id: string) => {
    setAppts(prev => prev.map(a => {
      if (a.id !== id) return a;
      const next = NEXT_STATUS[a.status];
      return next ? { ...a, status: next } : a;
    }));
  };

  const handleBook = () => {
    const newA: Appointment = {
      id: String(Date.now()), token: Math.max(...appts.map(a => a.token)) + 1,
      patient: form.patient, doctor: form.doctor, time: form.time, date: form.date,
      fee: 800, status: 'scheduled', type: form.type,
    };
    setAppts(prev => [...prev, newA]);
    setBookOpen(false);
    setForm({ patient: '', doctor: 'Dr. Ahmed Hassan', date: '', time: '', type: 'General' });
  };

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Appointment Management</Typography>
            <Typography variant="body2" color="text.secondary">Token queue • Calendar booking • Patient flow</Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => setBookOpen(true)}>Book Appointment</Button>
        </Box>
      </motion.div>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #1565C0, #1E88E5)', color: '#fff', height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>NOW SERVING</Typography>
                {current ? (
                  <>
                    <Typography variant="h2" fontWeight={900} sx={{ my: 1 }}>#{String(current.token).padStart(2, '0')}</Typography>
                    <Typography variant="subtitle1" fontWeight={600}>{current.patient}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>{current.doctor}</Typography>
                    <Chip label={current.time} icon={<AccessTime />} size="small" sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }} />
                  </>
                ) : (
                  <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>No patient</Typography>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={2}>
            {[
              { label: 'Total Today', value: appts.filter(a => a.date === '2026-05-29').length, color: '#1565C0' },
              { label: 'Completed', value: appts.filter(a => a.status === 'completed').length, color: '#2E7D32' },
              { label: 'In Queue', value: waiting.length, color: '#E65100' },
              { label: 'Avg Wait', value: '18 min', color: '#00897B' },
            ].map((s, i) => (
              <Grid key={s.label} size={{ xs: 6, sm: 3 }}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.07 }}>
                  <Card sx={{ textAlign: 'center', border: `1px solid ${s.color}20`, bgcolor: `${s.color}06`, p: 1 }}>
                    <Typography variant="h4" fontWeight={700} sx={{ color: s.color }}>{s.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {waiting.length > 0 && (
            <Card sx={{ mt: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Waiting Queue</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {waiting.slice(0, 5).map((a) => (
                    <Paper key={a.id} sx={{ px: 2, py: 1, textAlign: 'center', border: '1px solid', borderColor: 'divider', minWidth: 80 }}>
                      <Typography variant="caption" color="text.secondary">Token</Typography>
                      <Typography variant="h6" fontWeight={700} color="primary">#{String(a.token).padStart(2, '0')}</Typography>
                      <Typography variant="caption" noWrap sx={{ display: 'block', maxWidth: 80 }}>{a.patient.split(' ')[0]}</Typography>
                    </Paper>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={700}>Today's Appointments</Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Token</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Fee</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appts.map((a) => (
                  <TableRow key={a.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                    <TableCell>
                      <Paper sx={{ px: 1.5, py: 0.25, bgcolor: 'primary.main', display: 'inline-block', borderRadius: 1 }}>
                        <Typography variant="caption" fontWeight={700} color="#fff">#{String(a.token).padStart(2,'0')}</Typography>
                      </Paper>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.light', fontSize: '0.75rem' }}><Person /></Avatar>
                        <Typography variant="body2" fontWeight={600}>{a.patient}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><Typography variant="body2">{a.doctor}</Typography></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="body2">{a.time}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><Chip label={a.type} size="small" sx={{ fontSize: '0.65rem' }} /></TableCell>
                    <TableCell><Typography variant="body2" fontWeight={600}>Rs {a.fee.toLocaleString()}</Typography></TableCell>
                    <TableCell><Chip label={a.status.replace('-', ' ')} size="small" color={STATUS_COLORS[a.status]} sx={{ fontSize: '0.65rem', textTransform: 'capitalize' }} /></TableCell>
                    <TableCell align="right">
                      {NEXT_STATUS[a.status] && (
                        <Button size="small" variant="outlined" endIcon={<NavigateNext />} onClick={() => advance(a.id)} sx={{ fontSize: '0.7rem', py: 0.25 }}>
                          {a.status === 'scheduled' ? 'Start' : 'Complete'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={bookOpen} onClose={() => setBookOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle><Typography variant="h6" fontWeight={700}>Book Appointment</Typography></DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Patient Name" value={form.patient} onChange={e => setForm(f => ({ ...f, patient: e.target.value }))} fullWidth required />
            <FormControl fullWidth size="small">
              <InputLabel>Doctor</InputLabel>
              <Select value={form.doctor} label="Doctor" onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))}>
                {['Dr. Ahmed Hassan', 'Dr. Fatima Malik', 'Dr. Bilal Mengal', 'Dr. Sara Rind'].map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Time" type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select value={form.type} label="Type" onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {['General', 'Gynecology', 'Pediatrics', 'Dermatology', 'Orthopedics', 'ENT'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setBookOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleBook} variant="contained" disabled={!form.patient || !form.date} startIcon={<CalendarToday />}>Book</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

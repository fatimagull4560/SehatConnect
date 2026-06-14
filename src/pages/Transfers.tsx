import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Grid, Chip, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, Alert, Skeleton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, Tab, Tabs, Stack, Divider, InputAdornment,
} from '@mui/material';
import {
  SwapHoriz, Add, Search, Visibility, CheckCircle, LocalShipping,
  Cancel, HourglassEmpty, TaskAlt, LocalHospital, Person, MedicalServices,
  Phone, Warning, Refresh, ArrowForward,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Hospital { id: string; name: string; city: string; }

interface Transfer {
  id: string; transfer_ref: string;
  patient_name: string; patient_phone: string | null;
  patient_age: number | null; patient_gender: string | null; blood_group: string | null;
  diagnosis: string; medications: string | null; allergies: string | null;
  medical_summary: string | null; transfer_notes: string | null;
  from_hospital_id: string | null; from_hospital_name: string;
  to_hospital_id: string | null; to_hospital_name: string;
  requesting_doctor: string; contact_phone: string | null;
  urgency: 'routine' | 'urgent' | 'critical';
  reason: string;
  status: 'pending' | 'accepted' | 'in_transit' | 'completed' | 'rejected';
  rejection_reason: string | null;
  requested_at: string; accepted_at: string | null;
  in_transit_at: string | null; completed_at: string | null;
  created_at: string;
}

const URGENCY_CONFIG = {
  routine:  { label: 'Routine',  color: '#2E7D32', bg: '#E8F5E9' },
  urgent:   { label: 'Urgent',   color: '#E65100', bg: '#FFF3E0' },
  critical: { label: 'Critical', color: '#C62828', bg: '#FFEBEE' },
};

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: '#E65100', bg: '#FFF3E0', icon: <HourglassEmpty sx={{ fontSize: 14 }} /> },
  accepted:   { label: 'Accepted',   color: '#1565C0', bg: '#E3F2FD', icon: <CheckCircle    sx={{ fontSize: 14 }} /> },
  in_transit: { label: 'In Transit', color: '#6A1B9A', bg: '#F3E5F5', icon: <LocalShipping  sx={{ fontSize: 14 }} /> },
  completed:  { label: 'Completed',  color: '#2E7D32', bg: '#E8F5E9', icon: <TaskAlt        sx={{ fontSize: 14 }} /> },
  rejected:   { label: 'Rejected',   color: '#C62828', bg: '#FFEBEE', icon: <Cancel         sx={{ fontSize: 14 }} /> },
};

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const TAB_FILTERS = ['all', 'pending', 'accepted', 'in_transit', 'completed', 'rejected'] as const;

function StatusChip({ status }: { status: Transfer['status'] }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <Chip size="small" icon={cfg.icon} label={cfg.label}
      sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: '0.7rem',
        '& .MuiChip-icon': { color: cfg.color } }} />
  );
}

function UrgencyChip({ urgency }: { urgency: Transfer['urgency'] }) {
  const cfg = URGENCY_CONFIG[urgency];
  return (
    <Chip size="small" label={cfg.label.toUpperCase()}
      sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 800, fontSize: '0.65rem', letterSpacing: 0.5 }} />
  );
}

const EMPTY_FORM = {
  patient_name: '', patient_phone: '', patient_age: '', patient_gender: '',
  blood_group: '', diagnosis: '', medications: '', allergies: '',
  medical_summary: '', transfer_notes: '',
  from_hospital_id: '', to_hospital_id: '',
  requesting_doctor: '', contact_phone: '',
  urgency: 'routine' as Transfer['urgency'], reason: '',
};

function fmt(ts: string | null) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-PK', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Transfers() {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [detailTransfer, setDetailTransfer] = useState<Transfer | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadData = useCallback(async () => {
    const [tRes, hRes] = await Promise.all([
      supabase.from('patient_transfers').select('*').order('created_at', { ascending: false }),
      supabase.from('hospitals').select('id,name,city').order('name'),
    ]);
    if (tRes.data) setTransfers(tRes.data as Transfer[]);
    if (hRes.data) setHospitals(hRes.data as Hospital[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const counts = {
    all: transfers.length,
    pending: transfers.filter(t => t.status === 'pending').length,
    accepted: transfers.filter(t => t.status === 'accepted').length,
    in_transit: transfers.filter(t => t.status === 'in_transit').length,
    completed: transfers.filter(t => t.status === 'completed').length,
    rejected: transfers.filter(t => t.status === 'rejected').length,
  };

  const criticalCount = transfers.filter(t => t.urgency === 'critical' && t.status !== 'completed' && t.status !== 'rejected').length;

  const filtered = transfers.filter(t => {
    const matchTab = tab === 0 || t.status === TAB_FILTERS[tab];
    const q = search.toLowerCase();
    const matchSearch = !q || t.patient_name.toLowerCase().includes(q) ||
      t.transfer_ref.toLowerCase().includes(q) ||
      t.from_hospital_name.toLowerCase().includes(q) ||
      t.to_hospital_name.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const handleCreate = async () => {
    if (!form.patient_name || !form.from_hospital_id || !form.to_hospital_id ||
        !form.requesting_doctor || !form.reason || !form.diagnosis) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    const fromH = hospitals.find(h => h.id === form.from_hospital_id);
    const toH   = hospitals.find(h => h.id === form.to_hospital_id);
    const { error } = await supabase.from('patient_transfers').insert({
      patient_name: form.patient_name, patient_phone: form.patient_phone || null,
      patient_age: form.patient_age ? Number(form.patient_age) : null,
      patient_gender: form.patient_gender || null, blood_group: form.blood_group || null,
      diagnosis: form.diagnosis, medications: form.medications || null,
      allergies: form.allergies || null, medical_summary: form.medical_summary || null,
      transfer_notes: form.transfer_notes || null,
      from_hospital_id: form.from_hospital_id, from_hospital_name: fromH?.name ?? '',
      to_hospital_id: form.to_hospital_id, to_hospital_name: toH?.name ?? '',
      requesting_doctor: form.requesting_doctor, contact_phone: form.contact_phone || null,
      urgency: form.urgency, reason: form.reason,
      requested_by: user?.id,
    });
    setSubmitting(false);
    if (error) { setFormError(error.message); return; }
    setNewOpen(false);
    setForm(EMPTY_FORM);
    loadData();
  };

  const updateStatus = async (id: string, status: Transfer['status'], extra: Record<string, string> = {}) => {
    const updates: Record<string, unknown> = { status, ...extra };
    if (status === 'accepted')   updates.accepted_at   = new Date().toISOString();
    if (status === 'in_transit') updates.in_transit_at = new Date().toISOString();
    if (status === 'completed')  updates.completed_at  = new Date().toISOString();
    await supabase.from('patient_transfers').update(updates).eq('id', id);
    await loadData();
    setDetailTransfer(prev => prev?.id === id ? { ...prev, ...updates as Partial<Transfer>, status } : prev);
  };

  const handleReject = async () => {
    if (!detailTransfer || !rejectReason.trim()) return;
    await updateStatus(detailTransfer.id, 'rejected', { rejection_reason: rejectReason });
    setRejectOpen(false);
    setRejectReason('');
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Patient Transfers</Typography>
          <Typography variant="body2" color="text.secondary">Inter-hospital patient exchange & medical record handover</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh">
            <IconButton onClick={loadData} size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button variant="contained" disableElevation startIcon={<Add />} onClick={() => setNewOpen(true)}
            sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, px: 2.5 }}>
            New Transfer
          </Button>
        </Stack>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Transfers', value: counts.all,        color: '#1565C0', icon: <SwapHoriz /> },
          { label: 'Pending',         value: counts.pending,    color: '#E65100', icon: <HourglassEmpty /> },
          { label: 'In Transit',      value: counts.in_transit, color: '#6A1B9A', icon: <LocalShipping /> },
          { label: 'Completed',       value: counts.completed,  color: '#2E7D32', icon: <TaskAlt /> },
          { label: 'Critical Active', value: criticalCount,     color: '#C62828', icon: <Warning /> },
        ].map((s, i) => (
          <Grid key={i} size={{ xs: 6, md: 2.4 }}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, borderLeft: `4px solid ${s.color}` }}>
                <CardContent sx={{ p: '12px 16px !important', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: `${s.color}15`, color: s.color, width: 38, height: 38 }}>{s.icon}</Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={800} lineHeight={1}>{loading ? '–' : s.value}</Typography>
                    <Typography variant="caption" color="text.secondary" lineHeight={1.2}>{s.label}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Filter bar */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 2 }}>
        <Box sx={{ px: 2, pt: 1, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ flex: 1 }}>
            {['All', 'Pending', 'Accepted', 'In Transit', 'Completed', 'Rejected'].map((label, i) => (
              <Tab key={i} label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  {label}
                  {(counts as Record<string, number>)[TAB_FILTERS[i]] > 0 && (
                    <Chip size="small" label={(counts as Record<string, number>)[TAB_FILTERS[i]]}
                      sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700,
                        bgcolor: i === 1 && counts.pending ? '#C62828' : 'action.selected',
                        color: i === 1 && counts.pending ? '#fff' : 'text.primary' }} />
                  )}
                </Box>
              } sx={{ textTransform: 'none', fontWeight: 600, minHeight: 44 }} />
            ))}
          </Tabs>
          <TextField size="small" placeholder="Search patient, ref, hospital…"
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18 }} /></InputAdornment> }}
            sx={{ width: 240, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Box>
      </Card>

      {/* Table */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <TableContainer component={Paper} elevation={0}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5, bgcolor: 'action.hover' } }}>
                <TableCell>Ref</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>From → To</TableCell>
                <TableCell>Diagnosis</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Urgency</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((_, j) => <TableCell key={j}><Skeleton variant="text" /></TableCell>)}
                </TableRow>
              )) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                      <SwapHoriz sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                      <Typography variant="body2">No transfers found</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : filtered.map((t, i) => (
                <TableRow key={t.id} sx={{
                  '&:last-child td': { border: 0 },
                  animation: `fadeIn 0.3s ease ${i * 0.03}s both`,
                  '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } },
                }}>
                  <TableCell>
                    <Typography variant="caption" fontWeight={700} sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
                      {t.transfer_ref}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={700}>{t.patient_name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {[t.patient_age && `${t.patient_age}y`, t.patient_gender, t.blood_group].filter(Boolean).join(' · ')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="caption" fontWeight={600}>{t.from_hospital_name}</Typography>
                      <ArrowForward sx={{ fontSize: 12, color: 'text.secondary' }} />
                      <Typography variant="caption" fontWeight={600} color="primary.main">{t.to_hospital_name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ maxWidth: 160, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.diagnosis}
                    </Typography>
                  </TableCell>
                  <TableCell><Typography variant="caption">{t.requesting_doctor}</Typography></TableCell>
                  <TableCell><UrgencyChip urgency={t.urgency} /></TableCell>
                  <TableCell><StatusChip status={t.status} /></TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(t.created_at).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' })}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => setDetailTransfer(t)}>
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ── NEW TRANSFER DIALOG ── */}
      <Dialog open={newOpen} onClose={() => setNewOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}><SwapHoriz /></Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>New Patient Transfer</Typography>
            <Typography variant="caption" color="text.secondary">Complete all required fields for medical handover</Typography>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

          <Typography variant="overline" color="primary" fontWeight={700} sx={{ display: 'block', mb: 1.5 }}>Patient Information</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Patient Name *" value={form.patient_name} onChange={e => setForm(f => ({ ...f, patient_name: e.target.value }))} fullWidth size="small" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Phone Number" value={form.patient_phone} onChange={e => setForm(f => ({ ...f, patient_phone: e.target.value }))} fullWidth size="small"
                InputProps={{ startAdornment: <InputAdornment position="start"><Phone sx={{ fontSize: 16 }} /></InputAdornment> }} />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <TextField label="Age" type="number" value={form.patient_age} onChange={e => setForm(f => ({ ...f, patient_age: e.target.value }))} fullWidth size="small" inputProps={{ min: 0, max: 120 }} />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Gender</InputLabel>
                <Select label="Gender" value={form.patient_gender} onChange={e => setForm(f => ({ ...f, patient_gender: e.target.value }))}>
                  <MenuItem value="">—</MenuItem>
                  {['Male', 'Female', 'Other'].map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Blood Group</InputLabel>
                <Select label="Blood Group" value={form.blood_group} onChange={e => setForm(f => ({ ...f, blood_group: e.target.value }))}>
                  <MenuItem value="">—</MenuItem>
                  {BLOOD_GROUPS.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Typography variant="overline" color="primary" fontWeight={700} sx={{ display: 'block', mb: 1.5 }}>Transfer Details</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small" required>
                <InputLabel>From Hospital *</InputLabel>
                <Select label="From Hospital *" value={form.from_hospital_id} onChange={e => setForm(f => ({ ...f, from_hospital_id: e.target.value }))}>
                  {hospitals.map(h => <MenuItem key={h.id} value={h.id}>{h.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small" required>
                <InputLabel>To Hospital *</InputLabel>
                <Select label="To Hospital *" value={form.to_hospital_id} onChange={e => setForm(f => ({ ...f, to_hospital_id: e.target.value }))}>
                  {hospitals.filter(h => h.id !== form.from_hospital_id).map(h => <MenuItem key={h.id} value={h.id}>{h.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Requesting Doctor *" value={form.requesting_doctor}
                onChange={e => setForm(f => ({ ...f, requesting_doctor: e.target.value }))} fullWidth size="small"
                InputProps={{ startAdornment: <InputAdornment position="start"><MedicalServices sx={{ fontSize: 16 }} /></InputAdornment> }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField label="Contact Phone" value={form.contact_phone} onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))} fullWidth size="small" />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Urgency *</InputLabel>
                <Select label="Urgency *" value={form.urgency} onChange={e => setForm(f => ({ ...f, urgency: e.target.value as Transfer['urgency'] }))}>
                  <MenuItem value="routine">Routine</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Reason for Transfer *" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} fullWidth size="small" multiline rows={2} />
            </Grid>
          </Grid>

          <Typography variant="overline" color="primary" fontWeight={700} sx={{ display: 'block', mb: 1.5 }}>Medical Summary</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField label="Primary Diagnosis *" value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} fullWidth size="small" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Current Medications" value={form.medications} onChange={e => setForm(f => ({ ...f, medications: e.target.value }))} fullWidth size="small" multiline rows={3} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Known Allergies" value={form.allergies} onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))} fullWidth size="small" multiline rows={3} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Clinical Summary" value={form.medical_summary} onChange={e => setForm(f => ({ ...f, medical_summary: e.target.value }))} fullWidth size="small" multiline rows={3} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Transfer Notes" value={form.transfer_notes} onChange={e => setForm(f => ({ ...f, transfer_notes: e.target.value }))} fullWidth size="small" multiline rows={2} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setNewOpen(false)} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={submitting} startIcon={<SwapHoriz />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 3 }}>
            {submitting ? 'Submitting…' : 'Submit Transfer Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── DETAIL DIALOG ── */}
      {detailTransfer && (
        <Dialog open onClose={() => setDetailTransfer(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Avatar sx={{ bgcolor: 'primary.dark' }}><SwapHoriz /></Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={700}>{detailTransfer.transfer_ref}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <StatusChip status={detailTransfer.status} />
                  <UrgencyChip urgency={detailTransfer.urgency} />
                </Box>
              </Box>
            </Box>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 2 }}>
            {/* Patient */}
            <Card elevation={0} sx={{ bgcolor: 'action.hover', borderRadius: 2, mb: 2 }}>
              <CardContent sx={{ p: '12px 16px !important' }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>Patient</Typography>
                </Stack>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">Name</Typography>
                    <Typography variant="body2" fontWeight={700}>{detailTransfer.patient_name}</Typography>
                  </Grid>
                  {detailTransfer.patient_phone && (
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">Phone</Typography>
                      <Typography variant="body2" fontWeight={600}>{detailTransfer.patient_phone}</Typography>
                    </Grid>
                  )}
                  {detailTransfer.patient_age && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body2" color="text.secondary">
                        {[detailTransfer.patient_age && `${detailTransfer.patient_age} yrs`, detailTransfer.patient_gender, detailTransfer.blood_group].filter(Boolean).join(' · ')}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* Route */}
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 2 }}>
              <CardContent sx={{ p: '12px 16px !important' }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                  <LocalHospital sx={{ fontSize: 16, color: 'primary.main' }} />
                  <Typography variant="caption" fontWeight={700} color="primary.main" textTransform="uppercase" letterSpacing={0.5}>Transfer Route</Typography>
                </Stack>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ flex: 1, p: 1.5, bgcolor: 'action.hover', borderRadius: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">FROM</Typography>
                    <Typography variant="body2" fontWeight={700}>{detailTransfer.from_hospital_name}</Typography>
                  </Box>
                  <ArrowForward sx={{ color: 'text.secondary', flexShrink: 0 }} />
                  <Box sx={{ flex: 1, p: 1.5, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200', borderRadius: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">TO</Typography>
                    <Typography variant="body2" fontWeight={700} color="primary.main">{detailTransfer.to_hospital_name}</Typography>
                  </Box>
                </Box>
                <Stack direction="row" spacing={2} mt={1.5}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <MedicalServices sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" fontWeight={600}>{detailTransfer.requesting_doctor}</Typography>
                  </Stack>
                  {detailTransfer.contact_phone && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption">{detailTransfer.contact_phone}</Typography>
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Medical Info */}
            <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.5} sx={{ display: 'block', mb: 1 }}>Medical Information</Typography>
            <Stack spacing={1.5} mb={2}>
              {[
                { label: 'DIAGNOSIS', value: detailTransfer.diagnosis },
                { label: 'REASON', value: detailTransfer.reason },
                detailTransfer.medications && { label: 'MEDICATIONS', value: detailTransfer.medications },
                detailTransfer.allergies && { label: 'ALLERGIES', value: detailTransfer.allergies },
                detailTransfer.medical_summary && { label: 'CLINICAL SUMMARY', value: detailTransfer.medical_summary },
                detailTransfer.transfer_notes && { label: 'TRANSFER NOTES', value: detailTransfer.transfer_notes },
                detailTransfer.rejection_reason && { label: 'REJECTION REASON', value: detailTransfer.rejection_reason },
              ].filter(Boolean).map((item, i) => item && (
                <Box key={i}>
                  <Typography variant="caption" fontWeight={700} color="text.disabled" sx={{ letterSpacing: 0.5 }}>{item.label}</Typography>
                  <Typography variant="body2">{item.value}</Typography>
                </Box>
              ))}
            </Stack>

            {/* Timeline */}
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.5} sx={{ display: 'block', mb: 1.5 }}>Timeline</Typography>
            <Stack spacing={1}>
              {[
                { label: 'Requested',   ts: detailTransfer.requested_at,  color: '#E65100' },
                { label: 'Accepted',    ts: detailTransfer.accepted_at,   color: '#1565C0' },
                { label: 'In Transit',  ts: detailTransfer.in_transit_at, color: '#6A1B9A' },
                { label: 'Completed',   ts: detailTransfer.completed_at,  color: '#2E7D32' },
              ].filter(e => e.ts).map((e, i) => (
                <Stack key={i} direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: e.color, flexShrink: 0 }} />
                  <Typography variant="body2" fontWeight={600} sx={{ minWidth: 90 }}>{e.label}</Typography>
                  <Typography variant="caption" color="text.secondary">{fmt(e.ts)}</Typography>
                </Stack>
              ))}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, flexWrap: 'wrap' }}>
            <Button onClick={() => setDetailTransfer(null)} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>Close</Button>
            <Box sx={{ flex: 1 }} />
            {detailTransfer.status === 'pending' && (
              <Button onClick={() => setRejectOpen(true)} variant="outlined" color="error" startIcon={<Cancel />}
                sx={{ borderRadius: 2, textTransform: 'none' }}>Reject</Button>
            )}
            {detailTransfer.status === 'pending' && (
              <Button onClick={() => updateStatus(detailTransfer.id, 'accepted')} variant="contained" color="primary" startIcon={<CheckCircle />}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>Accept Transfer</Button>
            )}
            {detailTransfer.status === 'accepted' && (
              <Button onClick={() => updateStatus(detailTransfer.id, 'in_transit')} variant="contained" color="secondary" startIcon={<LocalShipping />}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>Mark In Transit</Button>
            )}
            {detailTransfer.status === 'in_transit' && (
              <Button onClick={() => updateStatus(detailTransfer.id, 'completed')} variant="contained" color="success" startIcon={<TaskAlt />}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>Mark Completed</Button>
            )}
          </DialogActions>
        </Dialog>
      )}

      {/* ── REJECT DIALOG ── */}
      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={700}>Reject Transfer</DialogTitle>
        <DialogContent>
          <TextField label="Reason for Rejection *" value={rejectReason} onChange={e => setRejectReason(e.target.value)}
            fullWidth multiline rows={3} size="small" sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setRejectOpen(false)} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleReject} variant="contained" color="error" disabled={!rejectReason.trim()}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>Confirm Rejection</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

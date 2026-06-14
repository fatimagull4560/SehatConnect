import { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Paper,
  Stepper, Step, StepLabel, IconButton, Tooltip,
} from '@mui/material';
import { Add, Biotech, Science, Print, Visibility, CheckCircle, AccessTime } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface LabTest {
  id: string; testNo: string; patient: string; phone: string;
  tests: string[]; totalFee: number; status: 'pending' | 'processing' | 'completed' | 'delivered';
  orderDate: string; completionDate?: string; doctor: string;
}

const TEST_CATALOG = [
  { name: 'Complete Blood Count (CBC)', fee: 350, turnaround: '2h', category: 'Hematology' },
  { name: 'Blood Sugar (Fasting)', fee: 150, turnaround: '1h', category: 'Biochemistry' },
  { name: 'Lipid Profile', fee: 600, turnaround: '3h', category: 'Biochemistry' },
  { name: 'Liver Function Test (LFT)', fee: 800, turnaround: '4h', category: 'Biochemistry' },
  { name: 'Kidney Function Test (KFT)', fee: 750, turnaround: '4h', category: 'Biochemistry' },
  { name: 'Thyroid Function Test (TFT)', fee: 900, turnaround: '6h', category: 'Endocrinology' },
  { name: 'Urine R/E', fee: 200, turnaround: '1h', category: 'Urinalysis' },
  { name: 'HbA1c', fee: 700, turnaround: '3h', category: 'Endocrinology' },
  { name: 'Hepatitis B (HBsAg)', fee: 450, turnaround: '2h', category: 'Serology' },
  { name: 'Hepatitis C (Anti-HCV)', fee: 500, turnaround: '2h', category: 'Serology' },
  { name: 'Chest X-Ray', fee: 800, turnaround: '30min', category: 'Radiology' },
  { name: 'Ultrasound Abdomen', fee: 1500, turnaround: '1h', category: 'Radiology' },
];

const INIT_TESTS: LabTest[] = [
  { id: '1', testNo: 'LAB-001', patient: 'Muhammad Ali Khan', phone: '0300-1234567', tests: ['Complete Blood Count (CBC)', 'Blood Sugar (Fasting)'], totalFee: 500, status: 'completed', orderDate: '2026-05-29', completionDate: '2026-05-29', doctor: 'Dr. Ahmed Hassan' },
  { id: '2', testNo: 'LAB-002', patient: 'Fatima Noor Baloch', phone: '0311-9876543', tests: ['Liver Function Test (LFT)', 'Lipid Profile'], totalFee: 1400, status: 'processing', orderDate: '2026-05-29', doctor: 'Dr. Fatima Malik' },
  { id: '3', testNo: 'LAB-003', patient: 'Ahmed Hassan Mengal', phone: '0321-5555555', tests: ['Thyroid Function Test (TFT)'], totalFee: 900, status: 'pending', orderDate: '2026-05-29', doctor: 'Dr. Ahmed Hassan' },
  { id: '4', testNo: 'LAB-004', patient: 'Sara Zahra Rind', phone: '0315-3333333', tests: ['HbA1c', 'Kidney Function Test (KFT)'], totalFee: 1450, status: 'delivered', orderDate: '2026-05-28', completionDate: '2026-05-29', doctor: 'Dr. Sara Rind' },
];

const STATUS_STEPS = ['pending', 'processing', 'completed', 'delivered'];
const STATUS_COLORS: Record<LabTest['status'], 'default' | 'warning' | 'success' | 'info'> = {
  pending: 'default', processing: 'warning', completed: 'success', delivered: 'info',
};

export default function Lab() {
  const [tests, setTests] = useState<LabTest[]>(INIT_TESTS);
  const [addOpen, setAddOpen] = useState(false);
  const [viewTest, setViewTest] = useState<LabTest | null>(null);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [form, setForm] = useState({ patient: '', phone: '', doctor: 'Dr. Ahmed Hassan' });

  const stats = [
    { label: 'Total Today', value: tests.filter(t => t.orderDate === '2026-05-29').length, color: '#1565C0' },
    { label: 'Pending', value: tests.filter(t => t.status === 'pending').length, color: '#E65100' },
    { label: 'Processing', value: tests.filter(t => t.status === 'processing').length, color: '#F9A825' },
    { label: 'Completed', value: tests.filter(t => t.status === 'completed').length, color: '#2E7D32' },
  ];

  const totalFee = selectedTests.reduce((s, name) => {
    const t = TEST_CATALOG.find(c => c.name === name);
    return s + (t?.fee ?? 0);
  }, 0);

  const advanceStatus = (id: string) => {
    setTests(prev => prev.map(t => {
      if (t.id !== id) return t;
      const idx = STATUS_STEPS.indexOf(t.status);
      if (idx >= STATUS_STEPS.length - 1) return t;
      return { ...t, status: STATUS_STEPS[idx + 1] as LabTest['status'], ...(STATUS_STEPS[idx + 1] === 'completed' ? { completionDate: new Date().toISOString().split('T')[0] } : {}) };
    }));
  };

  const handleAdd = () => {
    const newT: LabTest = {
      id: String(Date.now()),
      testNo: `LAB-${String(tests.length + 1).padStart(3, '0')}`,
      patient: form.patient, phone: form.phone, doctor: form.doctor,
      tests: selectedTests, totalFee, status: 'pending',
      orderDate: new Date().toISOString().split('T')[0],
    };
    setTests(prev => [newT, ...prev]);
    setAddOpen(false);
    setForm({ patient: '', phone: '', doctor: 'Dr. Ahmed Hassan' });
    setSelectedTests([]);
  };

  const toggleTest = (name: string) => {
    setSelectedTests(prev => prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]);
  };

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Laboratory Management</Typography>
            <Typography variant="body2" color="text.secondary">Test orders • Sample tracking • Report management</Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => setAddOpen(true)}>New Test Order</Button>
        </Box>
      </motion.div>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((s, i) => (
          <Grid key={s.label} size={{ xs: 6, sm: 3 }}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card sx={{ textAlign: 'center', p: 1.5, border: `1px solid ${s.color}20`, bgcolor: `${s.color}05` }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: s.color }}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Test No.</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Tests Ordered</TableCell>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Fee</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tests.map((t, i) => (
                  <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} style={{ display: 'table-row' }}>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: 'primary.main', color: '#fff', px: 1, py: 0.5, borderRadius: 1 }}>{t.testNo}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.light', fontSize: '0.75rem', fontWeight: 700 }}>{t.patient.charAt(0)}</Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{t.patient}</Typography>
                          <Typography variant="caption" color="text.secondary">{t.phone}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', maxWidth: 200 }}>
                        {t.tests.slice(0, 2).map(name => (
                          <Chip key={name} label={name.split('(')[0].trim()} size="small" sx={{ fontSize: '0.6rem', height: 18 }} />
                        ))}
                        {t.tests.length > 2 && <Chip label={`+${t.tests.length - 2}`} size="small" color="primary" sx={{ fontSize: '0.6rem', height: 18 }} />}
                      </Box>
                    </TableCell>
                    <TableCell><Typography variant="body2">{t.doctor}</Typography></TableCell>
                    <TableCell><Typography variant="body2" fontWeight={600} color="primary">Rs {t.totalFee.toLocaleString()}</Typography></TableCell>
                    <TableCell><Typography variant="caption">{t.orderDate}</Typography></TableCell>
                    <TableCell><Chip label={t.status} size="small" color={STATUS_COLORS[t.status]} sx={{ fontSize: '0.65rem', textTransform: 'capitalize' }} /></TableCell>
                    <TableCell align="right">
                      <Tooltip title="View"><IconButton size="small" onClick={() => setViewTest(t)}><Visibility fontSize="small" /></IconButton></Tooltip>
                      {t.status !== 'delivered' && (
                        <Tooltip title="Advance Status"><IconButton size="small" color="primary" onClick={() => advanceStatus(t.id)}><CheckCircle fontSize="small" /></IconButton></Tooltip>
                      )}
                      <Tooltip title="Print Report"><IconButton size="small"><Print fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* New Test Order Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle><Typography variant="h6" fontWeight={700}>New Lab Test Order</Typography></DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Patient Name" value={form.patient} onChange={e => setForm(f => ({ ...f, patient: e.target.value }))} fullWidth required size="small" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} fullWidth size="small" />
            </Grid>
            <Grid size={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Referring Doctor</InputLabel>
                <Select value={form.doctor} label="Referring Doctor" onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))}>
                  {['Dr. Ahmed Hassan', 'Dr. Fatima Malik', 'Dr. Bilal Mengal', 'Dr. Sara Rind', 'Dr. Khalid Bugti'].map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Select Tests</Typography>
              <Grid container spacing={1}>
                {TEST_CATALOG.map(test => (
                  <Grid key={test.name} size={{ xs: 12, sm: 6 }}>
                    <Paper
                      onClick={() => toggleTest(test.name)}
                      sx={{
                        p: 1.5, cursor: 'pointer', border: '1px solid',
                        borderColor: selectedTests.includes(test.name) ? 'primary.main' : 'divider',
                        bgcolor: selectedTests.includes(test.name) ? 'primary.50' : 'background.paper',
                        transition: 'all 0.15s', borderRadius: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="caption" fontWeight={700}>{test.name}</Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.25 }}>
                            <Chip label={test.category} size="small" sx={{ fontSize: '0.55rem', height: 16 }} />
                            <Chip label={test.turnaround} size="small" icon={<AccessTime sx={{ fontSize: '10px !important' }} />} sx={{ fontSize: '0.55rem', height: 16 }} />
                          </Box>
                        </Box>
                        <Typography variant="body2" fontWeight={700} color="primary">Rs {test.fee}</Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            {selectedTests.length > 0 && (
              <Grid size={12}>
                <Paper sx={{ p: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.light', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2">{selectedTests.length} test(s) selected</Typography>
                    <Typography variant="subtitle2" fontWeight={700} color="success.main">Total: Rs {totalFee.toLocaleString()}</Typography>
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setAddOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleAdd} variant="contained" disabled={!form.patient || selectedTests.length === 0} startIcon={<Science />}>Create Order</Button>
        </DialogActions>
      </Dialog>

      {/* View Test Dialog */}
      <Dialog open={!!viewTest} onClose={() => setViewTest(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {viewTest && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}><Biotech /></Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>{viewTest.testNo}</Typography>
                  <Typography variant="caption" color="text.secondary">{viewTest.patient}</Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Stepper activeStep={STATUS_STEPS.indexOf(viewTest.status)} alternativeLabel>
                  {STATUS_STEPS.map(s => (
                    <Step key={s}><StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: '0.65rem', textTransform: 'capitalize' } }}>{s}</StepLabel></Step>
                  ))}
                </Stepper>
              </Box>
              <Grid container spacing={2}>
                {[
                  { label: 'Patient', value: viewTest.patient },
                  { label: 'Phone', value: viewTest.phone },
                  { label: 'Referring Doctor', value: viewTest.doctor },
                  { label: 'Order Date', value: viewTest.orderDate },
                  { label: 'Total Fee', value: `Rs ${viewTest.totalFee.toLocaleString()}` },
                  { label: 'Completion', value: viewTest.completionDate ?? 'Pending' },
                ].map(row => (
                  <Grid key={row.label} size={6}>
                    <Typography variant="caption" color="text.secondary">{row.label}</Typography>
                    <Typography variant="body2" fontWeight={600}>{row.value}</Typography>
                  </Grid>
                ))}
                <Grid size={12}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Tests Ordered</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {viewTest.tests.map(t => <Chip key={t} label={t} size="small" sx={{ fontSize: '0.65rem' }} />)}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button startIcon={<Print />} variant="outlined">Print Report</Button>
              {viewTest.status !== 'delivered' && (
                <Button variant="contained" startIcon={<CheckCircle />} onClick={() => { advanceStatus(viewTest.id); setViewTest(null); }}>Advance Status</Button>
              )}
              <Button onClick={() => setViewTest(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

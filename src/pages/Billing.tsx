import { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Paper,
  Divider, IconButton, Tooltip, InputAdornment,
} from '@mui/material';
import { Add, Receipt, Search, Print, CheckCircle, Pending, Cancel, AttachMoney, TrendingUp } from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import { generateInvoiceNo } from '../lib/db';
import { printHtml, buildInvoiceHtml } from '../lib/print';

interface Bill {
  id: string; invoiceNo: string; patient: string; phone: string;
  services: { name: string; amount: number }[];
  totalAmount: number; paidAmount: number;
  status: 'paid' | 'partial' | 'unpaid' | 'cancelled';
  date: string; paymentMethod: string;
}

const weeklyRevenue = [
  { day: 'Mon', consultation: 32000, pharmacy: 18000, lab: 12000 },
  { day: 'Tue', consultation: 45000, pharmacy: 22000, lab: 15000 },
  { day: 'Wed', consultation: 28000, pharmacy: 16000, lab: 9000 },
  { day: 'Thu', consultation: 52000, pharmacy: 28000, lab: 18000 },
  { day: 'Fri', consultation: 61000, pharmacy: 31000, lab: 22000 },
  { day: 'Sat', consultation: 68000, pharmacy: 35000, lab: 25000 },
  { day: 'Sun', consultation: 41000, pharmacy: 21000, lab: 14000 },
];

const INIT_BILLS: Bill[] = [
  { id: '1', invoiceNo: 'INV-A1B2C3', patient: 'Muhammad Ali Khan', phone: '0300-1234567', services: [{ name: 'Consultation (Dr. Ahmed)', amount: 800 }, { name: 'CBC Test', amount: 350 }], totalAmount: 1150, paidAmount: 1150, status: 'paid', date: '2026-05-29', paymentMethod: 'Cash' },
  { id: '2', invoiceNo: 'INV-D4E5F6', patient: 'Fatima Noor Baloch', phone: '0311-9876543', services: [{ name: 'Consultation (Dr. Fatima)', amount: 1200 }, { name: 'Ultrasound', amount: 1500 }, { name: 'Medicines', amount: 850 }], totalAmount: 3550, paidAmount: 2000, status: 'partial', date: '2026-05-29', paymentMethod: 'Cash' },
  { id: '3', invoiceNo: 'INV-G7H8I9', patient: 'Ahmed Hassan Mengal', phone: '0321-5555555', services: [{ name: 'Thyroid Function Test', amount: 900 }], totalAmount: 900, paidAmount: 0, status: 'unpaid', date: '2026-05-29', paymentMethod: '' },
  { id: '4', invoiceNo: 'INV-J1K2L3', patient: 'Sara Zahra Rind', phone: '0315-3333333', services: [{ name: 'Dermatology Consultation', amount: 1500 }, { name: 'Medicines', amount: 420 }], totalAmount: 1920, paidAmount: 1920, status: 'paid', date: '2026-05-28', paymentMethod: 'Card' },
  { id: '5', invoiceNo: 'INV-M4N5O6', patient: 'Khalid Hussain Bugti', phone: '0344-2222222', services: [{ name: 'Orthopedics Consultation', amount: 2000 }, { name: 'X-Ray', amount: 800 }], totalAmount: 2800, paidAmount: 2800, status: 'paid', date: '2026-05-28', paymentMethod: 'Cash' },
];

const STATUS_COLORS: Record<Bill['status'], 'success' | 'warning' | 'error' | 'default'> = {
  paid: 'success', partial: 'warning', unpaid: 'error', cancelled: 'default',
};
const STATUS_ICONS: Record<Bill['status'], React.ReactNode> = {
  paid: <CheckCircle sx={{ fontSize: 14 }} />,
  partial: <Pending sx={{ fontSize: 14 }} />,
  unpaid: <Receipt sx={{ fontSize: 14 }} />,
  cancelled: <Cancel sx={{ fontSize: 14 }} />,
};

export default function Billing() {
  const theme = useTheme();
  const [bills, setBills] = useState<Bill[]>(INIT_BILLS);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [viewBill, setViewBill] = useState<Bill | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [form, setForm] = useState({ patient: '', phone: '', paymentMethod: 'Cash' });
  const [services, setServices] = useState<{ name: string; amount: string }[]>([{ name: '', amount: '' }]);

  const filtered = bills.filter(b =>
    b.patient.toLowerCase().includes(search.toLowerCase()) ||
    b.invoiceNo.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = bills.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.paidAmount, 0);
  const pendingAmount = bills.filter(b => b.status !== 'paid' && b.status !== 'cancelled').reduce((s, b) => s + (b.totalAmount - b.paidAmount), 0);
  const paidToday = bills.filter(b => b.date === '2026-05-29' && b.status === 'paid').length;

  const handleCollect = () => {
    if (!viewBill) return;
    const amount = parseFloat(payAmount) || 0;
    setBills(prev => prev.map(b => {
      if (b.id !== viewBill.id) return b;
      const newPaid = Math.min(b.paidAmount + amount, b.totalAmount);
      return { ...b, paidAmount: newPaid, status: newPaid >= b.totalAmount ? 'paid' : 'partial', paymentMethod: form.paymentMethod || 'Cash' };
    }));
    setPayOpen(false);
    setPayAmount('');
    setViewBill(null);
  };

  const handlePrint = (bill: Bill) => {
    printHtml(buildInvoiceHtml(bill), `Invoice ${bill.invoiceNo}`);
  };

  const handleAddBill = () => {
    const validServices = services.filter(s => s.name && s.amount);
    const total = validServices.reduce((s, sv) => s + parseFloat(sv.amount), 0);
    const newBill: Bill = {
      id: String(Date.now()),
      invoiceNo: generateInvoiceNo(),
      patient: form.patient, phone: form.phone,
      services: validServices.map(s => ({ name: s.name, amount: parseFloat(s.amount) })),
      totalAmount: total, paidAmount: 0, status: 'unpaid',
      date: new Date().toISOString().split('T')[0], paymentMethod: '',
    };
    setBills(prev => [newBill, ...prev]);
    setAddOpen(false);
    setForm({ patient: '', phone: '', paymentMethod: 'Cash' });
    setServices([{ name: '', amount: '' }]);
  };

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Billing & Invoicing</Typography>
            <Typography variant="body2" color="text.secondary">Invoice management • Payment collection • Revenue tracking</Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => setAddOpen(true)}>New Invoice</Button>
        </Box>
      </motion.div>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Today's Revenue", value: `Rs ${totalRevenue.toLocaleString()}`, color: '#1565C0', icon: <AttachMoney /> },
          { label: 'Pending Collection', value: `Rs ${pendingAmount.toLocaleString()}`, color: '#E65100', icon: <Pending /> },
          { label: 'Bills Paid Today', value: paidToday, color: '#2E7D32', icon: <CheckCircle /> },
          { label: 'Total Invoices', value: bills.length, color: '#00897B', icon: <Receipt /> },
        ].map((s, i) => (
          <Grid key={s.label} size={{ xs: 6, sm: 3 }}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card sx={{ p: 2, border: `1px solid ${s.color}20`, bgcolor: `${s.color}06` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: `${s.color}20`, color: s.color, width: 40, height: 40 }}>{s.icon}</Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: s.color }}>{s.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                  </Box>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={12}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>Weekly Revenue Breakdown</Typography>
                    <Typography variant="caption" color="text.secondary">By department</Typography>
                  </Box>
                  <Chip label="This Week" color="primary" size="small" icon={<TrendingUp />} />
                </Box>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={weeklyRevenue} barSize={18}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                    <YAxis tick={{ fontSize: 11, fill: theme.palette.text.secondary }} />
                    <ReTooltip
                      contentStyle={{ background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8 }}
                      formatter={(v: number) => [`Rs ${v.toLocaleString()}`, '']}
                    />
                    <Legend />
                    <Bar dataKey="consultation" name="Consultation" fill="#1565C0" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="pharmacy" name="Pharmacy" fill="#00897B" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="lab" name="Lab" fill="#E65100" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <TextField
              placeholder="Search by patient name or invoice number..." value={search}
              onChange={e => setSearch(e.target.value)} size="small" sx={{ width: { xs: '100%', sm: 360 } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
            />
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Invoice</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Services</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Paid</TableCell>
                  <TableCell>Balance</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((b, i) => (
                  <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} style={{ display: 'table-row' }}>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: 'action.hover', px: 1, py: 0.5, borderRadius: 1 }}>{b.invoiceNo}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{b.patient}</Typography>
                      <Typography variant="caption" color="text.secondary">{b.phone}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">{b.services.map(s => s.name).slice(0, 2).join(', ')}{b.services.length > 2 ? ` +${b.services.length - 2}` : ''}</Typography>
                    </TableCell>
                    <TableCell><Typography variant="body2" fontWeight={600}>Rs {b.totalAmount.toLocaleString()}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="success.main" fontWeight={600}>Rs {b.paidAmount.toLocaleString()}</Typography></TableCell>
                    <TableCell>
                      {b.totalAmount - b.paidAmount > 0
                        ? <Typography variant="body2" color="error.main" fontWeight={600}>Rs {(b.totalAmount - b.paidAmount).toLocaleString()}</Typography>
                        : <Typography variant="body2" color="text.disabled">—</Typography>
                      }
                    </TableCell>
                    <TableCell><Typography variant="caption">{b.date}</Typography></TableCell>
                    <TableCell>
                      <Chip label={b.status} size="small" color={STATUS_COLORS[b.status]} icon={STATUS_ICONS[b.status] as React.ReactElement} sx={{ fontSize: '0.65rem', textTransform: 'capitalize' }} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View"><IconButton size="small" onClick={() => setViewBill(b)}><Receipt fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Print"><IconButton size="small" onClick={() => handlePrint(b)}><Print fontSize="small" /></IconButton></Tooltip>
                      {(b.status === 'unpaid' || b.status === 'partial') && (
                        <Tooltip title="Collect Payment">
                          <IconButton size="small" color="success" onClick={() => { setViewBill(b); setPayOpen(true); }}>
                            <AttachMoney fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* View Bill Dialog */}
      <Dialog open={!!viewBill && !payOpen} onClose={() => setViewBill(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {viewBill && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}><Receipt /></Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>{viewBill.invoiceNo}</Typography>
                  <Typography variant="caption" color="text.secondary">{viewBill.patient}</Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Paper sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                  {viewBill.services.map(s => (
                    <Box key={s.name} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography variant="body2">{s.name}</Typography>
                      <Typography variant="body2" fontWeight={600}>Rs {s.amount.toLocaleString()}</Typography>
                    </Box>
                  ))}
                  <Divider sx={{ my: 1.5 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight={700}>Total</Typography>
                    <Typography variant="subtitle2" fontWeight={700} color="primary">Rs {viewBill.totalAmount.toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">Paid</Typography>
                    <Typography variant="caption" color="success.main" fontWeight={600}>Rs {viewBill.paidAmount.toLocaleString()}</Typography>
                  </Box>
                  {viewBill.totalAmount - viewBill.paidAmount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">Balance</Typography>
                      <Typography variant="caption" color="error.main" fontWeight={600}>Rs {(viewBill.totalAmount - viewBill.paidAmount).toLocaleString()}</Typography>
                    </Box>
                  )}
                </Paper>
                <Chip label={viewBill.status} color={STATUS_COLORS[viewBill.status]} sx={{ alignSelf: 'flex-start', textTransform: 'capitalize' }} />
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
              <Button startIcon={<Print />} variant="outlined" onClick={() => handlePrint(viewBill)}>Print</Button>
              {(viewBill.status === 'unpaid' || viewBill.status === 'partial') && (
                <Button variant="contained" startIcon={<AttachMoney />} onClick={() => setPayOpen(true)}>Collect Payment</Button>
              )}
              <Button onClick={() => setViewBill(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Payment Collection Dialog */}
      <Dialog open={payOpen} onClose={() => setPayOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle><Typography variant="h6" fontWeight={700}>Collect Payment</Typography></DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {viewBill && (
              <Paper sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="body2" fontWeight={600}>{viewBill.patient}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">Balance Due</Typography>
                  <Typography variant="subtitle2" fontWeight={700} color="error.main">Rs {(viewBill.totalAmount - viewBill.paidAmount).toLocaleString()}</Typography>
                </Box>
              </Paper>
            )}
            <TextField label="Amount to Collect (Rs)" type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} fullWidth autoFocus />
            <FormControl fullWidth size="small">
              <InputLabel>Payment Method</InputLabel>
              <Select value={form.paymentMethod} label="Payment Method" onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}>
                {['Cash', 'Card', 'Bank Transfer', 'JazzCash', 'Easypaisa'].map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setPayOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleCollect} variant="contained" disabled={!payAmount || parseFloat(payAmount) <= 0} startIcon={<CheckCircle />}>Confirm</Button>
        </DialogActions>
      </Dialog>

      {/* Add Invoice Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle><Typography variant="h6" fontWeight={700}>New Invoice</Typography></DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Patient Name" value={form.patient} onChange={e => setForm(f => ({ ...f, patient: e.target.value }))} fullWidth required size="small" />
            <TextField label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} fullWidth size="small" />
            <Typography variant="subtitle2" fontWeight={700}>Services</Typography>
            {services.map((s, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1 }}>
                <TextField placeholder="Service name" value={s.name} onChange={e => setServices(prev => prev.map((sv, j) => j === i ? { ...sv, name: e.target.value } : sv))} sx={{ flex: 2 }} size="small" />
                <TextField placeholder="Rs" value={s.amount} onChange={e => setServices(prev => prev.map((sv, j) => j === i ? { ...sv, amount: e.target.value } : sv))} type="number" sx={{ flex: 1 }} size="small" />
              </Box>
            ))}
            <Button size="small" onClick={() => setServices(prev => [...prev, { name: '', amount: '' }])} startIcon={<Add />}>Add Line</Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setAddOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleAddBill} variant="contained" disabled={!form.patient || services.every(s => !s.name)} startIcon={<Receipt />}>Create Invoice</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

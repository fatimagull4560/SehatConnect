import { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { TrendingUp, TrendingDown, People, AttachMoney, LocalPharmacy, Biotech, FileDownload, CalendarToday } from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import { printHtml, buildReportHtml } from '../lib/print';

const TABS = ['Revenue', 'Patients', 'Pharmacy', 'Lab'] as const;
type Tab = typeof TABS[number];

const monthlyRevenue = [
  { month: 'Dec', revenue: 980000, patients: 420 },
  { month: 'Jan', revenue: 1120000, patients: 510 },
  { month: 'Feb', revenue: 890000, patients: 380 },
  { month: 'Mar', revenue: 1350000, patients: 620 },
  { month: 'Apr', revenue: 1180000, patients: 540 },
  { month: 'May', revenue: 1520000, patients: 690 },
];

const deptRevenue = [
  { dept: 'Consultation', revenue: 580000, share: 38 },
  { dept: 'Pharmacy', revenue: 420000, share: 28 },
  { dept: 'Lab Tests', revenue: 280000, share: 18 },
  { dept: 'Radiology', revenue: 150000, share: 10 },
  { dept: 'Other', revenue: 90000, share: 6 },
];

const patientsByGender = [
  { name: 'Male', value: 58 },
  { name: 'Female', value: 42 },
];

const patientsByAge = [
  { range: '0-12', count: 85 },
  { range: '13-25', count: 142 },
  { range: '26-40', count: 210 },
  { range: '41-60', count: 185 },
  { range: '60+', count: 68 },
];

const topMedicines = [
  { name: 'Panadol 500mg', sold: 240, revenue: 20400 },
  { name: 'Augmentin 625mg', sold: 45, revenue: 54000 },
  { name: 'Brufen 400mg', sold: 180, revenue: 17100 },
  { name: 'Amlodipine 5mg', sold: 95, revenue: 19950 },
  { name: 'Ventolin Inhaler', sold: 22, revenue: 9900 },
  { name: 'ORS Sachets', sold: 350, revenue: 15750 },
];

const topLabTests = [
  { name: 'Complete Blood Count', ordered: 128, revenue: 44800 },
  { name: 'Blood Sugar (Fasting)', ordered: 95, revenue: 14250 },
  { name: 'Lipid Profile', ordered: 72, revenue: 43200 },
  { name: 'HbA1c', ordered: 65, revenue: 45500 },
  { name: 'Urine R/E', ordered: 110, revenue: 22000 },
];

const COLORS = ['#1565C0', '#C62828', '#00897B', '#E65100', '#2E7D32'];

export default function Reports() {
  const [tab, setTab] = useState<Tab>('Revenue');
  const theme = useTheme();

  const handleExport = () => {
    const kpiRows = kpis.map(k => `
      <div class="summary-box">
        <div class="s-label">${k.label}</div>
        <div class="s-value" style="color:${k.color}">${k.value}</div>
        <div style="font-size:11px;color:${k.up ? '#065f46' : '#991b1b'};margin-top:4px;">${k.change} vs last month</div>
      </div>
    `).join('');

    let tabContent = '';
    if (tab === 'Revenue') {
      tabContent = `
        <h3 style="margin:20px 0 12px;">Monthly Revenue (Last 6 Months)</h3>
        <table>
          <thead><tr><th>Month</th><th style="text-align:right;">Revenue</th><th style="text-align:right;">Patients</th></tr></thead>
          <tbody>${monthlyRevenue.map(r => `<tr><td>${r.month}</td><td style="text-align:right;font-weight:600;">Rs ${r.revenue.toLocaleString()}</td><td style="text-align:right;">${r.patients}</td></tr>`).join('')}</tbody>
        </table>
        <h3 style="margin:20px 0 12px;">Department Revenue Breakdown</h3>
        <table>
          <thead><tr><th>Department</th><th style="text-align:right;">Revenue</th><th style="text-align:right;">Share</th></tr></thead>
          <tbody>${deptRevenue.map(d => `<tr><td>${d.dept}</td><td style="text-align:right;font-weight:600;">Rs ${d.revenue.toLocaleString()}</td><td style="text-align:right;">${d.share}%</td></tr>`).join('')}</tbody>
        </table>
      `;
    } else if (tab === 'Patients') {
      tabContent = `
        <h3 style="margin:20px 0 12px;">Patients by Age Group</h3>
        <table>
          <thead><tr><th>Age Range</th><th style="text-align:right;">Count</th></tr></thead>
          <tbody>${patientsByAge.map(r => `<tr><td>${r.range}</td><td style="text-align:right;font-weight:600;">${r.count}</td></tr>`).join('')}</tbody>
        </table>
        <h3 style="margin:20px 0 12px;">Gender Distribution</h3>
        <table>
          <thead><tr><th>Gender</th><th style="text-align:right;">Share</th></tr></thead>
          <tbody>${patientsByGender.map(r => `<tr><td>${r.name}</td><td style="text-align:right;font-weight:600;">${r.value}%</td></tr>`).join('')}</tbody>
        </table>
      `;
    } else if (tab === 'Pharmacy') {
      tabContent = `
        <h3 style="margin:20px 0 12px;">Top Selling Medicines</h3>
        <table>
          <thead><tr><th>#</th><th>Medicine</th><th style="text-align:right;">Units Sold</th><th style="text-align:right;">Revenue</th></tr></thead>
          <tbody>${topMedicines.map((m, i) => `<tr><td>${i + 1}</td><td>${m.name}</td><td style="text-align:right;">${m.sold}</td><td style="text-align:right;font-weight:600;">Rs ${m.revenue.toLocaleString()}</td></tr>`).join('')}</tbody>
        </table>
      `;
    } else if (tab === 'Lab') {
      tabContent = `
        <h3 style="margin:20px 0 12px;">Top Lab Tests Ordered</h3>
        <table>
          <thead><tr><th>#</th><th>Test</th><th style="text-align:right;">Orders</th><th style="text-align:right;">Revenue</th></tr></thead>
          <tbody>${topLabTests.map((t, i) => `<tr><td>${i + 1}</td><td>${t.name}</td><td style="text-align:right;">${t.ordered}</td><td style="text-align:right;font-weight:600;">Rs ${t.revenue.toLocaleString()}</td></tr>`).join('')}</tbody>
        </table>
      `;
    }

    const content = `
      <div class="summary">${kpiRows}</div>
      ${tabContent}
    `;
    printHtml(buildReportHtml(`${tab} Report — May 2026`, new Date().toLocaleDateString('en-PK', { dateStyle: 'long' }), content), `SehatConnect — ${tab} Report`);
  };

  const kpis = [
    { label: 'Monthly Revenue', value: 'Rs 15.2L', change: '+14.8%', up: true, color: '#1565C0', icon: <AttachMoney /> },
    { label: 'Total Patients', value: '690', change: '+8.2%', up: true, color: '#00897B', icon: <People /> },
    { label: 'Pharmacy Sales', value: 'Rs 4.2L', change: '+18.3%', up: true, color: '#E65100', icon: <LocalPharmacy /> },
    { label: 'Lab Revenue', value: 'Rs 2.8L', change: '+11.4%', up: true, color: '#2E7D32', icon: <Biotech /> },
  ];

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Analytics & Reports</Typography>
            <Typography variant="body2" color="text.secondary">Business intelligence • Performance metrics • Trends</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<CalendarToday />} size="small">May 2026</Button>
            <Button variant="contained" startIcon={<FileDownload />} size="small" onClick={handleExport}>Export PDF</Button>
          </Box>
        </Box>
      </motion.div>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpis.map((k, i) => (
          <Grid key={k.label} size={{ xs: 6, sm: 3 }}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card sx={{ p: 2, border: `1px solid ${k.color}25`, bgcolor: `${k.color}07` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: 0.5 }}>{k.label}</Typography>
                  <Box sx={{ color: k.color }}>{k.icon}</Box>
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ color: k.color }}>{k.value}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  {k.up ? <TrendingUp sx={{ fontSize: 12, color: 'success.main' }} /> : <TrendingDown sx={{ fontSize: 12, color: 'error.main' }} />}
                  <Typography variant="caption" color={k.up ? 'success.main' : 'error.main'} fontWeight={600}>{k.change}</Typography>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <Button key={t} variant={tab === t ? 'contained' : 'outlined'} size="small" onClick={() => setTab(t)} sx={{ minWidth: 110 }}>{t}</Button>
        ))}
      </Box>

      {tab === 'Revenue' && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Monthly Revenue Trend</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>Last 6 months</Typography>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={monthlyRevenue}>
                      <defs>
                        <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1565C0" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#1565C0" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                      <YAxis tick={{ fontSize: 11, fill: theme.palette.text.secondary }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                      <Tooltip contentStyle={{ background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8 }} formatter={(v: number) => [`Rs ${v.toLocaleString()}`, 'Revenue']} />
                      <Area type="monotone" dataKey="revenue" stroke="#1565C0" fill="url(#rev)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Department Revenue</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>This month</Typography>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={deptRevenue} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="revenue" paddingAngle={3}>
                        {deptRevenue.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`Rs ${v.toLocaleString()}`, 'Revenue']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ mt: 1 }}>
                    {deptRevenue.map((d, i) => (
                      <Box key={d.dept} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS[i] }} />
                          <Typography variant="caption">{d.dept}</Typography>
                        </Box>
                        <Typography variant="caption" fontWeight={700}>{d.share}%</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      )}

      {tab === 'Patients' && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Patients by Age Group</Typography>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={patientsByAge}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis dataKey="range" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                      <YAxis tick={{ fontSize: 11, fill: theme.palette.text.secondary }} />
                      <Tooltip contentStyle={{ background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8 }} />
                      <Bar dataKey="count" name="Patients" fill="#1565C0" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Gender Distribution</Typography>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={patientsByGender} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                        <Cell fill="#1565C0" />
                        <Cell fill="#C62828" />
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid size={12}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Monthly Patient Flow</Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={monthlyRevenue}>
                      <defs>
                        <linearGradient id="pat" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00897B" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#00897B" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                      <YAxis tick={{ fontSize: 11, fill: theme.palette.text.secondary }} />
                      <Tooltip contentStyle={{ background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8 }} formatter={(v: number) => [v, 'Patients']} />
                      <Area type="monotone" dataKey="patients" stroke="#00897B" fill="url(#pat)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      )}

      {tab === 'Pharmacy' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={700}>Top Selling Medicines</Typography>
                <Typography variant="caption" color="text.secondary">This month</Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Medicine</TableCell>
                      <TableCell>Units Sold</TableCell>
                      <TableCell>Revenue</TableCell>
                      <TableCell>Share</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topMedicines.map((m, i) => {
                      const total = topMedicines.reduce((s, med) => s + med.revenue, 0);
                      return (
                        <TableRow key={m.name} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                          <TableCell>
                            <Paper sx={{ px: 1, py: 0.25, bgcolor: i < 3 ? 'warning.main' : 'action.hover', display: 'inline-block', borderRadius: 1 }}>
                              <Typography variant="caption" fontWeight={700} color={i < 3 ? '#fff' : 'text.primary'}>#{i + 1}</Typography>
                            </Paper>
                          </TableCell>
                          <TableCell><Typography variant="body2" fontWeight={600}>{m.name}</Typography></TableCell>
                          <TableCell><Chip label={m.sold} size="small" color="primary" sx={{ fontSize: '0.65rem' }} /></TableCell>
                          <TableCell><Typography variant="body2" fontWeight={600} color="success.main">Rs {m.revenue.toLocaleString()}</Typography></TableCell>
                          <TableCell><Typography variant="body2">{((m.revenue / total) * 100).toFixed(1)}%</Typography></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {tab === 'Lab' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={700}>Top Lab Tests Ordered</Typography>
                <Typography variant="caption" color="text.secondary">This month</Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Test Name</TableCell>
                      <TableCell>Orders</TableCell>
                      <TableCell>Revenue</TableCell>
                      <TableCell>Share</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topLabTests.map((t, i) => {
                      const total = topLabTests.reduce((s, lt) => s + lt.revenue, 0);
                      return (
                        <TableRow key={t.name} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                          <TableCell>
                            <Paper sx={{ px: 1, py: 0.25, bgcolor: i < 3 ? 'info.main' : 'action.hover', display: 'inline-block', borderRadius: 1 }}>
                              <Typography variant="caption" fontWeight={700} color={i < 3 ? '#fff' : 'text.primary'}>#{i + 1}</Typography>
                            </Paper>
                          </TableCell>
                          <TableCell><Typography variant="body2" fontWeight={600}>{t.name}</Typography></TableCell>
                          <TableCell><Chip label={t.ordered} size="small" color="success" sx={{ fontSize: '0.65rem' }} /></TableCell>
                          <TableCell><Typography variant="body2" fontWeight={600} color="success.main">Rs {t.revenue.toLocaleString()}</Typography></TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ flex: 1, height: 4, bgcolor: 'action.hover', borderRadius: 2, overflow: 'hidden' }}>
                                <Box sx={{ height: '100%', width: `${(t.revenue / total) * 100}%`, bgcolor: '#1565C0', borderRadius: 2 }} />
                              </Box>
                              <Typography variant="caption" fontWeight={700}>{((t.revenue / total) * 100).toFixed(1)}%</Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </Box>
  );
}

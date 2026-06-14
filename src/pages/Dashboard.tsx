import { Box, Grid, Card, CardContent, Typography, Avatar, Chip, Button, Paper, LinearProgress } from '@mui/material';
import {
  AttachMoney, People, CalendarToday, LocalPharmacy, Biotech, Receipt,
  TrendingUp, TrendingDown, Schedule, ArrowForward,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';

const weeklyData = [
  { day: 'Mon', revenue: 52000, patients: 38 }, { day: 'Tue', revenue: 68000, patients: 52 },
  { day: 'Wed', revenue: 45000, patients: 34 }, { day: 'Thu', revenue: 73000, patients: 58 },
  { day: 'Fri', revenue: 89000, patients: 67 }, { day: 'Sat', revenue: 95000, patients: 72 },
  { day: 'Sun', revenue: 61000, patients: 48 },
];

const revenueBreakdown = [
  { name: 'Consultation', value: 42 }, { name: 'Pharmacy', value: 31 },
  { name: 'Lab Tests', value: 18 }, { name: 'Other', value: 9 },
];

const COLORS = ['#1565C0', '#00897B', '#E65100', '#78909C'];

const recentPatients = [
  { name: 'Muhammad Ali', type: 'Consultation', time: '10 min ago', status: 'Completed', color: '#2E7D32' },
  { name: 'Fatima Noor', type: 'Lab Test', time: '25 min ago', status: 'Processing', color: '#E65100' },
  { name: 'Ahmed Baloch', type: 'Pharmacy', time: '42 min ago', status: 'Completed', color: '#2E7D32' },
  { name: 'Sara Hassan', type: 'Consultation', time: '1h ago', status: 'Completed', color: '#2E7D32' },
];

const todayAppts = [
  { token: '#A01', patient: 'Muhammad Tariq', doctor: 'Dr. Ahmed Hassan', time: '09:00 AM', status: 'Completed' },
  { token: '#A02', patient: 'Zainab Rind', doctor: 'Dr. Fatima Malik', time: '09:30 AM', status: 'In Progress' },
  { token: '#A03', patient: 'Khalid Mengal', doctor: 'Dr. Ahmed Hassan', time: '10:00 AM', status: 'Waiting' },
  { token: '#A04', patient: 'Ayesha Siddiqui', doctor: 'Dr. Fatima Malik', time: '10:30 AM', status: 'Scheduled' },
];

const statusColor: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
  Completed: 'success', 'In Progress': 'warning', Waiting: 'info', Scheduled: 'default',
};

export default function Dashboard() {
  const theme = useTheme();
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const stats = [
    { label: "Today's Revenue", value: 'Rs 1,24,500', icon: <AttachMoney />, color: '#1565C0', bg: '#1565C020', change: '+12.4%', up: true },
    { label: 'Patients Today', value: '67', icon: <People />, color: '#00897B', bg: '#00897B20', change: '+8.2%', up: true },
    { label: 'Appointments', value: '43', icon: <CalendarToday />, color: '#E65100', bg: '#E6510020', change: '-3.1%', up: false },
    { label: 'Pharmacy Sales', value: 'Rs 48,200', icon: <LocalPharmacy />, color: '#C62828', bg: '#C6282820', change: '+15.6%', up: true },
    { label: 'Lab Tests', value: '28', icon: <Biotech />, color: '#6A1B9A', bg: '#6A1B9A20', change: '+6.7%', up: true },
    { label: 'Pending Bills', value: 'Rs 22,400', icon: <Receipt />, color: '#2E7D32', bg: '#2E7D3220', change: '-2.3%', up: false },
  ];

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>
            {greeting}, {user?.role === 'doctor' ? 'Dr.' : ''} {user?.name?.split(' ')[user?.role === 'doctor' ? 1 : 0]}! 👋
          </Typography>
          <Typography variant="body2" color="text.secondary">{dayName} • SehatConnect POS Dashboard</Typography>
        </Box>
      </motion.div>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((s, i) => (
          <Grid key={s.label} size={{ xs: 12, sm: 6, lg: 4 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card sx={{
                border: `1px solid ${s.color}30`, background: `${s.color}08`,
                '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 8px 25px ${s.color}25` },
                transition: 'all 0.2s',
              }}>
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</Typography>
                      <Typography variant="h5" fontWeight={700} sx={{ color: s.color, my: 0.5 }}>{s.value}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {s.up ? <TrendingUp sx={{ fontSize: 14, color: 'success.main' }} /> : <TrendingDown sx={{ fontSize: 14, color: 'error.main' }} />}
                        <Typography variant="caption" color={s.up ? 'success.main' : 'error.main'} fontWeight={600}>{s.change} vs yesterday</Typography>
                      </Box>
                    </Box>
                    <Avatar sx={{ bgcolor: s.bg, width: 48, height: 48, color: s.color }}>
                      {s.icon}
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>Weekly Revenue & Patients</Typography>
                    <Typography variant="caption" color="text.secondary">This week vs last week</Typography>
                  </Box>
                  <Chip label="This Week" color="primary" size="small" />
                </Box>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1565C0" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1565C0" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="pat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00897B" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00897B" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} />
                    <Tooltip contentStyle={{ background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8 }}
                      formatter={(v, name) => [name === 'revenue' ? `Rs ${Number(v).toLocaleString()}` : v, name === 'revenue' ? 'Revenue (Rs)' : 'Patients']} />
                    <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#1565C0" fill="url(#rev)" strokeWidth={2} />
                    <Area yAxisId="right" type="monotone" dataKey="patients" stroke="#00897B" fill="url(#pat)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Revenue Breakdown</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>By department today</Typography>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={revenueBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                      {revenueBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v}%`, 'Share']} />
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 1 }}>
                  {revenueBreakdown.map((item, i) => (
                    <Box key={item.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS[i] }} />
                        <Typography variant="caption">{item.name}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, mx: 1 }}>
                        <LinearProgress variant="determinate" value={item.value} sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: `${COLORS[i]}20`, '& .MuiLinearProgress-bar': { bgcolor: COLORS[i] } }} />
                      </Box>
                      <Typography variant="caption" fontWeight={700}>{item.value}%</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h6" fontWeight={700}>Recent Patients</Typography>
                  <Button endIcon={<ArrowForward />} size="small">View All</Button>
                </Box>
                {recentPatients.map((p, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderBottom: i < recentPatients.length - 1 ? '1px solid' : 'none', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
                    <Avatar sx={{ bgcolor: `${p.color}20`, color: p.color, width: 40, height: 40, fontWeight: 700 }}>{p.name.charAt(0)}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{p.type} • {p.time}</Typography>
                    </Box>
                    <Chip label={p.status} size="small" sx={{ bgcolor: `${p.color}15`, color: p.color, fontWeight: 600, fontSize: '0.7rem' }} />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <Card>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h6" fontWeight={700}>Today's Appointments</Typography>
                  <Button endIcon={<ArrowForward />} size="small">Schedule</Button>
                </Box>
                {todayAppts.map((a, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderBottom: i < todayAppts.length - 1 ? '1px solid' : 'none', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
                    <Paper sx={{ px: 1.5, py: 0.5, bgcolor: 'primary.main', borderRadius: 1.5, minWidth: 44, textAlign: 'center' }}>
                      <Typography variant="caption" fontWeight={700} color="#fff">{a.token}</Typography>
                    </Paper>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{a.patient}</Typography>
                      <Typography variant="caption" color="text.secondary">{a.doctor}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Chip label={a.status} size="small" color={statusColor[a.status]} sx={{ mb: 0.5, fontSize: '0.65rem' }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Schedule sx={{ fontSize: 11, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">{a.time}</Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}

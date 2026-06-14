import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, Avatar,
  Stepper, Step, StepLabel, Chip,
  FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress,
  Paper, Divider, IconButton, InputAdornment, Grid,
} from '@mui/material';
import {
  PersonAdd, Login, LocalHospital, CalendarMonth, CheckCircle,
  Visibility, VisibilityOff, ArrowBack, MedicalServices, AccessTime,
  LocationOn, Star, Phone, ArrowForward, Logout, BookOnline,
  Shield, Lock, VerifiedUser,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface PatientAccount {
  id: string; name: string; phone: string; email?: string;
  dob?: string; gender?: string; address?: string; blood_group?: string;
}

interface Doctor {
  id: string; name: string; specialization: string;
  fee: number; rating: number; years_experience: number;
  qualification: string; available: boolean;
}

interface Availability {
  id: string; doctor_id: string; hospital_id: string;
  working_days: string; start_time: string; end_time: string;
  hospital?: { name: string; address: string };
}

interface Booking {
  id: string; doctor_name: string; hospital_name: string;
  preferred_date: string; preferred_time: string;
  status: string; fee: number; created_at: string; notes?: string;
}

type Screen = 'landing' | 'register' | 'login' | 'dashboard' | 'book';

const SPEC_COLORS: Record<string, string> = {
  Cardiology: '#C62828', Orthopedics: '#1565C0', Pediatrics: '#F57C00',
  Dermatology: '#00838F', ENT: '#558B2F', 'General Surgery': '#2E7D32',
  Gynecology: '#AD1457', Neurology: '#6A1B9A', 'General Medicine': '#37474F',
};

const STATUS_COLORS: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
  pending: 'warning', confirmed: 'success', cancelled: 'error', completed: 'success',
};

function formatTime(t: string) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

export default function PatientPortal() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [patient, setPatient] = useState<PatientAccount | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPin, setShowPin] = useState(false);

  // Registration form
  const [regForm, setRegForm] = useState({
    name: '', phone: '', pin: '', confirmPin: '',
    dob: '', gender: '', address: '', blood_group: '',
  });

  // Login form
  const [loginForm, setLoginForm] = useState({ phone: '', pin: '' });

  // Booking
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedAvail, setSelectedAvail] = useState<Availability | null>(null);
  const [bookForm, setBookForm] = useState({ date: '', time: '', notes: '' });
  const [bookStep, setBookStep] = useState(0);
  const [bookConfirmed, setBookConfirmed] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('portal_patient');
    if (stored) {
      try {
        const p = JSON.parse(stored);
        setPatient(p);
        setScreen('dashboard');
        loadDashboardData(p.phone, sessionStorage.getItem('portal_pin') || '');
      } catch { /* ignore */ }
    }
  }, []);

  const loadDashboardData = async (phone: string, pin: string) => {
    const [docRes, availRes] = await Promise.all([
      supabase.from('doctors').select('id,name,specialization,fee,rating,years_experience,qualification,available').order('rating', { ascending: false }),
      supabase.from('doctor_hospital_availability').select('*,hospital:hospitals(name,address)'),
    ]);
    if (docRes.data) setDoctors(docRes.data);
    if (availRes.data) setAvailability(availRes.data as Availability[]);

    const { data: bData } = await supabase.rpc('get_patient_bookings', { p_phone: phone, p_pin: pin });
    if (bData) setBookings(Array.isArray(bData) ? bData : []);
  };

  const handleRegister = async () => {
    setError('');
    if (!regForm.name.trim() || !regForm.phone.trim() || !regForm.pin.trim()) {
      setError('Name, phone, and PIN are required.'); return;
    }
    if (!/^\d{4,6}$/.test(regForm.pin)) {
      setError('PIN must be 4–6 digits.'); return;
    }
    if (regForm.pin !== regForm.confirmPin) {
      setError('PINs do not match.'); return;
    }
    setLoading(true);
    const { error: err } = await supabase.from('patient_accounts').insert({
      name: regForm.name.trim(),
      phone: regForm.phone.trim(),
      pin: regForm.pin,
      dob: regForm.dob || null,
      gender: regForm.gender || null,
      address: regForm.address || null,
      blood_group: regForm.blood_group || null,
    });
    if (err) {
      setError(err.code === '23505' ? 'This phone number is already registered. Please log in.' : 'Registration failed. Please try again.');
      setLoading(false); return;
    }
    // Auto-login
    const { data: acc } = await supabase.rpc('patient_login', { p_phone: regForm.phone.trim(), p_pin: regForm.pin });
    if (acc) {
      setPatient(acc as PatientAccount);
      sessionStorage.setItem('portal_patient', JSON.stringify(acc));
      sessionStorage.setItem('portal_pin', regForm.pin);
      setSuccess('Account created! Welcome to SehatConnect Portal.');
      setScreen('dashboard');
      loadDashboardData(regForm.phone.trim(), regForm.pin);
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setError('');
    if (!loginForm.phone.trim() || !loginForm.pin.trim()) {
      setError('Phone and PIN are required.'); return;
    }
    setLoading(true);
    const { data: acc } = await supabase.rpc('patient_login', { p_phone: loginForm.phone.trim(), p_pin: loginForm.pin });
    if (!acc) {
      setError('Incorrect phone number or PIN. Please try again.');
      setLoading(false); return;
    }
    setPatient(acc as PatientAccount);
    sessionStorage.setItem('portal_patient', JSON.stringify(acc));
    sessionStorage.setItem('portal_pin', loginForm.pin);
    setScreen('dashboard');
    loadDashboardData(loginForm.phone.trim(), loginForm.pin);
    setLoading(false);
  };

  const handleLogout = () => {
    setPatient(null);
    sessionStorage.removeItem('portal_patient');
    sessionStorage.removeItem('portal_pin');
    setScreen('landing');
    setBookings([]); setDoctors([]); setAvailability([]);
  };

  const getDoctorAvailability = (doctorId: string) =>
    availability.filter(a => a.doctor_id === doctorId);

  const handleConfirmBooking = async () => {
    if (!patient || !selectedDoctor || !selectedAvail || !bookForm.date) return;
    setLoading(true);
    const { error: err } = await supabase.from('portal_bookings').insert({
      patient_account_id: patient.id,
      patient_name: patient.name,
      patient_phone: patient.phone,
      doctor_id: selectedDoctor.id,
      doctor_name: selectedDoctor.name,
      hospital_id: selectedAvail.hospital_id,
      hospital_name: (selectedAvail.hospital as { name: string; address: string } | undefined)?.name || '',
      preferred_date: bookForm.date,
      preferred_time: bookForm.time || `${formatTime(selectedAvail.start_time)} – ${formatTime(selectedAvail.end_time)}`,
      notes: bookForm.notes || null,
      fee: selectedDoctor.fee,
      status: 'pending',
    });
    if (!err) {
      setBookConfirmed(true);
      const pin = sessionStorage.getItem('portal_pin') || '';
      await loadDashboardData(patient.phone, pin);
    } else {
      setError('Booking failed. Please try again.');
    }
    setLoading(false);
  };

  const specColor = (spec: string) => SPEC_COLORS[spec] || '#1565C0';

  // ─── LANDING ────────────────────────────────────────────────────────────────
  if (screen === 'landing') {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 50%, #1B5E20 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        p: 3,
      }}>
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.15)', mx: 'auto', mb: 2.5, border: '3px solid rgba(255,255,255,0.3)' }}>
              <LocalHospital sx={{ fontSize: 40, color: '#fff' }} />
            </Avatar>
            <Typography variant="h3" fontWeight={800} color="#fff" sx={{ mb: 1 }}>SehatConnect</Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 400 }}>Patient Portal • Quetta, Pakistan</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 1 }}>
              Book appointments with top doctors — securely and privately
            </Typography>
          </Box>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card sx={{ maxWidth: 480, width: '100%', borderRadius: 4, overflow: 'hidden' }}>
            <Box sx={{ background: 'linear-gradient(135deg, #1565C0, #1976D2)', p: 3, textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={700} color="#fff">Welcome to the Patient Portal</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Manage your appointments with ease
              </Typography>
            </Box>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                {[
                  { icon: <BookOnline />, text: 'Book appointments online' },
                  { icon: <Shield />, text: 'Your privacy is secured with PIN protection' },
                  { icon: <CalendarMonth />, text: 'Track all your bookings in one place' },
                ].map(item => (
                  <Box key={item.text} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', color: 'primary.dark' }}>{item.icon}</Avatar>
                    <Typography variant="body2" color="text.secondary">{item.text}</Typography>
                  </Box>
                ))}
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                <Button
                  fullWidth variant="contained" size="large"
                  startIcon={<PersonAdd />}
                  onClick={() => { setScreen('register'); setError(''); }}
                  sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
                >
                  Create New Account
                </Button>
                <Button
                  fullWidth variant="outlined" size="large"
                  startIcon={<Login />}
                  onClick={() => { setScreen('login'); setError(''); }}
                  sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
                >
                  Login to My Account
                </Button>
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        <Box sx={{ mt: 4, display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { icon: <Lock />, label: 'PIN Protected' },
            { icon: <VerifiedUser />, label: 'Secure Data' },
            { icon: <Shield />, label: 'Private Records' },
          ].map(f => (
            <Box key={f.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ color: 'rgba(255,255,255,0.7)' }}>{f.icon}</Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>{f.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  // ─── REGISTER ────────────────────────────────────────────────────────────────
  if (screen === 'register') {
    return (
      <Box sx={{
        minHeight: '100vh', bgcolor: 'background.default',
        display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3,
      }}>
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
          <Card sx={{ maxWidth: 540, width: '100%', borderRadius: 4 }}>
            <Box sx={{ background: 'linear-gradient(135deg, #1565C0, #1976D2)', p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <IconButton onClick={() => setScreen('landing')} sx={{ color: '#fff' }}><ArrowBack /></IconButton>
                <Box>
                  <Typography variant="h6" fontWeight={700} color="#fff">Create Account</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>Register to book appointments online</Typography>
                </Box>
              </Box>
            </Box>
            <CardContent sx={{ p: 3 }}>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} color="primary">Personal Information</Typography>
                <TextField label="Full Name *" value={regForm.name} onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))} fullWidth size="small" />
                <TextField
                  label="Phone Number *" value={regForm.phone}
                  onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))}
                  fullWidth size="small" placeholder="0300-1234567"
                  helperText="This will be your unique login identifier"
                />
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <TextField label="Date of Birth" type="date" value={regForm.dob} onChange={e => setRegForm(f => ({ ...f, dob: e.target.value }))} fullWidth size="small" InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid size={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Gender</InputLabel>
                      <Select value={regForm.gender} label="Gender" onChange={e => setRegForm(f => ({ ...f, gender: e.target.value }))}>
                        {['Male', 'Female', 'Other'].map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <FormControl fullWidth size="small">
                  <InputLabel>Blood Group</InputLabel>
                  <Select value={regForm.blood_group} label="Blood Group" onChange={e => setRegForm(f => ({ ...f, blood_group: e.target.value }))}>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <MenuItem key={bg} value={bg}>{bg}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField label="Address" value={regForm.address} onChange={e => setRegForm(f => ({ ...f, address: e.target.value }))} fullWidth size="small" multiline rows={2} />

                <Divider />
                <Box sx={{ bgcolor: 'primary.light', borderRadius: 2, p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Lock sx={{ color: 'primary.dark', fontSize: 18 }} />
                  <Typography variant="caption" color="primary.dark" fontWeight={600}>
                    Create a 4–6 digit PIN. You will use this to log in and protect your records.
                  </Typography>
                </Box>
                <TextField
                  label="Create PIN *" value={regForm.pin}
                  onChange={e => setRegForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                  fullWidth size="small" type={showPin ? 'text' : 'password'}
                  inputProps={{ maxLength: 6, inputMode: 'numeric' }}
                  InputProps={{ endAdornment: <InputAdornment position="end"><IconButton size="small" onClick={() => setShowPin(s => !s)}>{showPin ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }}
                />
                <TextField
                  label="Confirm PIN *" value={regForm.confirmPin}
                  onChange={e => setRegForm(f => ({ ...f, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                  fullWidth size="small" type="password"
                  inputProps={{ maxLength: 6, inputMode: 'numeric' }}
                  error={regForm.confirmPin.length > 0 && regForm.pin !== regForm.confirmPin}
                  helperText={regForm.confirmPin.length > 0 && regForm.pin !== regForm.confirmPin ? 'PINs do not match' : ''}
                />
              </Box>

              <Button
                fullWidth variant="contained" size="large"
                onClick={handleRegister} disabled={loading}
                sx={{ mt: 3, py: 1.5, borderRadius: 2, fontWeight: 700 }}
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <PersonAdd />}
              >
                {loading ? 'Creating Account...' : 'Create My Account'}
              </Button>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="caption" color="text.secondary">Already have an account? </Typography>
                <Button size="small" onClick={() => { setScreen('login'); setError(''); }}>Login</Button>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    );
  }

  // ─── LOGIN ───────────────────────────────────────────────────────────────────
  if (screen === 'login') {
    return (
      <Box sx={{
        minHeight: '100vh', bgcolor: 'background.default',
        display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3,
      }}>
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
          <Card sx={{ maxWidth: 420, width: '100%', borderRadius: 4 }}>
            <Box sx={{ background: 'linear-gradient(135deg, #1565C0, #1976D2)', p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <IconButton onClick={() => setScreen('landing')} sx={{ color: '#fff' }}><ArrowBack /></IconButton>
                <Box>
                  <Typography variant="h6" fontWeight={700} color="#fff">Patient Login</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>Enter your phone and PIN</Typography>
                </Box>
              </Box>
            </Box>
            <CardContent sx={{ p: 3 }}>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.light', mx: 'auto', mb: 1 }}>
                    <Lock sx={{ color: 'primary.dark', fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="body2" color="text.secondary">Your records are secured with your PIN</Typography>
                </Box>

                <TextField
                  label="Phone Number" value={loginForm.phone}
                  onChange={e => setLoginForm(f => ({ ...f, phone: e.target.value }))}
                  fullWidth size="small" placeholder="0300-1234567"
                  InputProps={{ startAdornment: <InputAdornment position="start"><Phone fontSize="small" color="action" /></InputAdornment> }}
                />
                <TextField
                  label="PIN" value={loginForm.pin}
                  onChange={e => setLoginForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                  fullWidth size="small" type={showPin ? 'text' : 'password'}
                  inputProps={{ maxLength: 6, inputMode: 'numeric' }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPin(s => !s)}>{showPin ? <VisibilityOff /> : <Visibility />}</IconButton>
                    </InputAdornment>,
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />

                <Button
                  fullWidth variant="contained" size="large"
                  onClick={handleLogin} disabled={loading}
                  sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Login />}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>

                <Divider />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">New patient? </Typography>
                  <Button size="small" onClick={() => { setScreen('register'); setError(''); }}>Create Account</Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    );
  }

  // ─── BOOKING FLOW ─────────────────────────────────────────────────────────────
  if (screen === 'book') {
    const docAvailability = selectedDoctor ? getDoctorAvailability(selectedDoctor.id) : [];

    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
        <Box sx={{ maxWidth: 720, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <IconButton onClick={() => { setScreen('dashboard'); setSelectedDoctor(null); setBookStep(0); setBookConfirmed(false); }}><ArrowBack /></IconButton>
            <Box>
              <Typography variant="h6" fontWeight={700}>Book Appointment</Typography>
              <Typography variant="caption" color="text.secondary">Logged in as {patient?.name}</Typography>
            </Box>
          </Box>

          {bookConfirmed ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <Box sx={{ bgcolor: 'success.main', p: 4, textAlign: 'center' }}>
                  <CheckCircle sx={{ fontSize: 64, color: '#fff', mb: 2 }} />
                  <Typography variant="h5" fontWeight={800} color="#fff">Booking Confirmed!</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.85)', mt: 1 }}>
                    Your appointment request has been submitted.
                  </Typography>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Paper sx={{ p: 2.5, bgcolor: 'action.hover', borderRadius: 2, mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Appointment Summary</Typography>
                    {[
                      { label: 'Doctor', value: selectedDoctor?.name },
                      { label: 'Specialization', value: selectedDoctor?.specialization },
                      { label: 'Hospital', value: (selectedAvail?.hospital as { name: string; address: string } | undefined)?.name },
                      { label: 'Date', value: bookForm.date },
                      { label: 'Time', value: bookForm.time || `${formatTime(selectedAvail?.start_time || '')} – ${formatTime(selectedAvail?.end_time || '')}` },
                      { label: 'Fee', value: `Rs ${selectedDoctor?.fee?.toLocaleString()}` },
                    ].map(r => (
                      <Box key={r.label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                        <Typography variant="caption" color="text.secondary">{r.label}</Typography>
                        <Typography variant="caption" fontWeight={700}>{r.value}</Typography>
                      </Box>
                    ))}
                  </Paper>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    The clinic will confirm your appointment. Please arrive 10–15 minutes early.
                  </Alert>
                  <Button fullWidth variant="contained" onClick={() => { setScreen('dashboard'); setBookStep(0); setBookConfirmed(false); setSelectedDoctor(null); }}>
                    Back to My Dashboard
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <>
              <Stepper activeStep={bookStep} sx={{ mb: 3 }}>
                {['Select Doctor', 'Choose Slot', 'Confirm'].map(label => (
                  <Step key={label}><StepLabel>{label}</StepLabel></Step>
                ))}
              </Stepper>

              {bookStep === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                    {doctors.length} doctors available — select one to continue
                  </Typography>
                  {doctors.map(doc => (
                    <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <Card
                        sx={{
                          cursor: 'pointer', border: `2px solid transparent`,
                          '&:hover': { borderColor: specColor(doc.specialization), transform: 'translateY(-2px)' },
                          transition: 'all 0.2s',
                        }}
                        onClick={() => { setSelectedDoctor(doc); setBookStep(1); }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                              <Avatar sx={{ bgcolor: `${specColor(doc.specialization)}15`, color: specColor(doc.specialization), width: 48, height: 48, fontWeight: 800 }}>
                                {doc.name.split(' ').slice(1).map(n => n[0]).join('').slice(0, 2) || doc.name[0]}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" fontWeight={700}>{doc.name}</Typography>
                                <Chip label={doc.specialization} size="small" sx={{ bgcolor: `${specColor(doc.specialization)}12`, color: specColor(doc.specialization), fontWeight: 700, fontSize: '0.65rem', height: 18, mt: 0.25 }} />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                                  <Star sx={{ fontSize: 12, color: '#FFB300' }} />
                                  <Typography variant="caption" fontWeight={700}>{(doc.rating ?? 0).toFixed(1)}</Typography>
                                  <Typography variant="caption" color="text.secondary">• {doc.years_experience}+ yrs</Typography>
                                </Box>
                              </Box>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="subtitle2" fontWeight={800} color="success.main">Rs {(doc.fee ?? 0).toLocaleString()}</Typography>
                              <Chip label={doc.available ? 'Available' : 'Busy'} size="small" color={doc.available ? 'success' : 'default'} sx={{ fontSize: '0.6rem', height: 18, mt: 0.5 }} />
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </Box>
              )}

              {bookStep === 1 && selectedDoctor && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Card sx={{ borderRadius: 2, border: `2px solid ${specColor(selectedDoctor.specialization)}30` }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>Selected: {selectedDoctor.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{selectedDoctor.specialization} • Rs {(selectedDoctor.fee ?? 0).toLocaleString()} fee</Typography>
                    </CardContent>
                  </Card>

                  <Typography variant="subtitle2" fontWeight={700}>Available Slots</Typography>
                  {docAvailability.length === 0 ? (
                    <Alert severity="warning">No schedule available for this doctor. Please call the clinic.</Alert>
                  ) : docAvailability.map(avail => (
                    <Card
                      key={avail.id}
                      sx={{
                        cursor: 'pointer',
                        border: `2px solid ${selectedAvail?.id === avail.id ? specColor(selectedDoctor.specialization) : 'transparent'}`,
                        '&:hover': { borderColor: specColor(selectedDoctor.specialization) },
                        transition: 'border 0.2s',
                      }}
                      onClick={() => setSelectedAvail(avail)}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                              <LocationOn sx={{ fontSize: 14, color: 'primary.main' }} />
                              <Typography variant="body2" fontWeight={700}>{(avail.hospital as { name: string; address: string } | undefined)?.name || 'Hospital'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {avail.working_days.split(',').map(d => (
                                <Chip key={d} label={d.trim()} size="small" sx={{ fontSize: '0.6rem', height: 18 }} />
                              ))}
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'primary.light', borderRadius: 2, px: 1.5, py: 0.5 }}>
                            <AccessTime sx={{ fontSize: 13, color: '#fff' }} />
                            <Typography variant="caption" fontWeight={700} color="#fff">
                              {formatTime(avail.start_time)} – {formatTime(avail.end_time)}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}

                  {selectedAvail && (
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Divider />
                      <TextField
                        label="Preferred Date *" type="date" value={bookForm.date}
                        onChange={e => setBookForm(f => ({ ...f, date: e.target.value }))}
                        fullWidth size="small" InputLabelProps={{ shrink: true }}
                        inputProps={{ min: new Date().toISOString().split('T')[0] }}
                      />
                      <TextField
                        label="Preferred Time (optional)" value={bookForm.time}
                        onChange={e => setBookForm(f => ({ ...f, time: e.target.value }))}
                        fullWidth size="small" placeholder="e.g. 10:00 AM"
                      />
                      <TextField
                        label="Notes / Symptoms (optional)" value={bookForm.notes}
                        onChange={e => setBookForm(f => ({ ...f, notes: e.target.value }))}
                        fullWidth size="small" multiline rows={2}
                      />
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Button variant="outlined" onClick={() => setBookStep(0)} startIcon={<ArrowBack />}>Back</Button>
                    <Button
                      variant="contained" disabled={!selectedAvail || !bookForm.date}
                      onClick={() => setBookStep(2)} endIcon={<ArrowForward />}
                      sx={{ flex: 1 }}
                    >
                      Continue
                    </Button>
                  </Box>
                </Box>
              )}

              {bookStep === 2 && selectedDoctor && selectedAvail && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700}>Confirm Appointment Details</Typography>
                  {error && <Alert severity="error">{error}</Alert>}

                  <Paper sx={{ p: 2.5, bgcolor: 'primary.light', borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={800} color="primary.dark" sx={{ mb: 1.5 }}>Appointment Summary</Typography>
                    {[
                      { label: 'Patient', value: patient?.name },
                      { label: 'Phone', value: patient?.phone },
                      { label: 'Doctor', value: selectedDoctor.name },
                      { label: 'Specialization', value: selectedDoctor.specialization },
                      { label: 'Hospital', value: (selectedAvail.hospital as { name: string; address: string } | undefined)?.name },
                      { label: 'Date', value: bookForm.date },
                      { label: 'Time', value: bookForm.time || `${formatTime(selectedAvail.start_time)} – ${formatTime(selectedAvail.end_time)}` },
                      { label: 'Consultation Fee', value: `Rs ${(selectedDoctor.fee ?? 0).toLocaleString()}` },
                    ].map(row => (
                      <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                        <Typography variant="caption" color="primary.dark">{row.label}</Typography>
                        <Typography variant="caption" fontWeight={700} color="primary.dark">{row.value}</Typography>
                      </Box>
                    ))}
                  </Paper>

                  {bookForm.notes && (
                    <Paper sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>Notes / Symptoms</Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>{bookForm.notes}</Typography>
                    </Paper>
                  )}

                  <Alert severity="info" icon={<Shield />}>
                    Your personal information is encrypted and only shared with the clinic for appointment purposes.
                  </Alert>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" onClick={() => setBookStep(1)} startIcon={<ArrowBack />}>Back</Button>
                    <Button
                      variant="contained" color="success" sx={{ flex: 1, fontWeight: 700 }}
                      onClick={handleConfirmBooking} disabled={loading}
                      startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CheckCircle />}
                    >
                      {loading ? 'Submitting...' : 'Confirm Booking'}
                    </Button>
                  </Box>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
    );
  }

  // ─── DASHBOARD ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ background: 'linear-gradient(135deg, #1565C0, #1976D2)', px: 3, py: 2.5 }}>
        <Box sx={{ maxWidth: 900, mx: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)' }}>
              <MedicalServices sx={{ color: '#fff' }} />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} color="#fff">Welcome, {patient?.name?.split(' ')[0]}!</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>{patient?.phone} • Patient Portal</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained" startIcon={<BookOnline />}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }, fontWeight: 700 }}
              onClick={() => { setScreen('book'); setBookStep(0); setBookConfirmed(false); setSelectedDoctor(null); setSelectedAvail(null); setBookForm({ date: '', time: '', notes: '' }); }}
            >
              Book Appointment
            </Button>
            <IconButton onClick={handleLogout} sx={{ color: '#fff' }} title="Logout"><Logout /></IconButton>
          </Box>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

        {/* Patient info card */}
        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>My Profile</Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {[
                { label: 'Name', value: patient?.name },
                { label: 'Phone', value: patient?.phone },
                { label: 'DOB', value: patient?.dob || '—' },
                { label: 'Gender', value: patient?.gender || '—' },
                { label: 'Blood Group', value: patient?.blood_group || '—' },
              ].map(f => (
                <Box key={f.label}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>{f.label}</Typography>
                  <Typography variant="body2" fontWeight={700}>{f.value}</Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* My Bookings */}
        <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>My Appointments ({bookings.length})</Typography>
          <Button variant="outlined" size="small" startIcon={<BookOnline />}
            onClick={() => { setScreen('book'); setBookStep(0); setBookConfirmed(false); setSelectedDoctor(null); setSelectedAvail(null); setBookForm({ date: '', time: '', notes: '' }); }}
          >
            New Booking
          </Button>
        </Box>

        {bookings.length === 0 ? (
          <Paper sx={{ p: 5, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 3 }}>
            <CalendarMonth sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary" fontWeight={600}>No appointments yet</Typography>
            <Typography variant="caption" color="text.disabled">Click "Book Appointment" to get started</Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <AnimatePresence>
              {bookings.map((b, i) => (
                <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700}>{b.doctor_name}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
                            <LocationOn sx={{ fontSize: 13, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">{b.hospital_name}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
                            <CalendarMonth sx={{ fontSize: 13, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">{b.preferred_date} • {b.preferred_time}</Typography>
                          </Box>
                          {b.notes && <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>{b.notes}</Typography>}
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Chip label={b.status} size="small" color={STATUS_COLORS[b.status] || 'default'} sx={{ fontWeight: 700, textTransform: 'capitalize', mb: 0.5 }} />
                          <Typography variant="caption" color="success.main" fontWeight={700} sx={{ display: 'block' }}>
                            Rs {(b.fee ?? 0).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </Box>
        )}

        <Box sx={{ mt: 4, p: 2, bgcolor: 'action.hover', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Shield sx={{ color: 'text.secondary', fontSize: 18 }} />
          <Typography variant="caption" color="text.secondary">
            Your data is protected. We never share your personal information without your consent.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

import { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography, Tab, Tabs,
  InputAdornment, IconButton, Checkbox, FormControlLabel, Alert, Chip,
} from '@mui/material';
import {
  Email, Lock, Visibility, VisibilityOff, LocalHospital, WifiOff, Pin,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login, loginWithPin } = useAuth();
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('admin@sehatconnect.pk');
  const [password, setPassword] = useState('password123');
  const [pin, setPin] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isOnline = navigator.onLine;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const ok = await login(email, password, remember);
    if (!ok) setError('Invalid email or password. Try password123');
    setLoading(false);
  };

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const ok = await loginWithPin(pin);
    if (!ok) setError('Invalid PIN. Try 1234 (Admin)');
    setLoading(false);
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #EBF0FA 0%, #DBEAFE 50%, #E0F2F1 100%)',
      position: 'relative', overflow: 'hidden', p: 2,
    }}>
      {/* Background circles */}
      {[{ size: 400, top: -100, right: -100, opacity: 0.15 }, { size: 300, bottom: -80, left: -80, opacity: 0.1 }, { size: 200, top: '30%', left: '5%', opacity: 0.08 }].map((c, i) => (
        <Box key={i} sx={{
          position: 'absolute', width: c.size, height: c.size, borderRadius: '50%',
          background: 'linear-gradient(135deg, #1565C0, #00897B)',
          opacity: c.opacity, top: c.top, right: (c as { right?: number }).right,
          bottom: (c as { bottom?: number }).bottom, left: (c as { left?: number }).left,
        }} />
      ))}

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{
            width: 72, height: 72, borderRadius: '20px', mx: 'auto', mb: 2,
            background: 'linear-gradient(135deg, #1565C0, #1E88E5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(21,101,192,0.4)',
          }}>
            <LocalHospital sx={{ fontSize: 38, color: '#fff' }} />
          </Box>
          <Typography variant="h4" fontWeight={700} color="primary.dark">SehatConnect POS</Typography>
          <Typography variant="body2" color="text.secondary">Healthcare Management System • Pakistan</Typography>
          {!isOnline && (
            <Chip icon={<WifiOff fontSize="small" />} label="Offline Mode" size="small" color="warning" sx={{ mt: 1 }} />
          )}
        </Box>

        <Card sx={{ width: 380, boxShadow: '0 20px 60px rgba(21,101,192,0.15)', borderRadius: 4, backdropFilter: 'blur(20px)' }}>
          <CardContent sx={{ p: 4 }}>
            <Tabs value={tab} onChange={(_, v) => { setTab(v); setError(''); }} sx={{ mb: 3 }}>
              <Tab label="Email Login" sx={{ flex: 1, fontWeight: 600 }} />
              <Tab label="PIN Login" sx={{ flex: 1, fontWeight: 600 }} />
            </Tabs>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            {tab === 0 ? (
              <Box component="form" onSubmit={handleEmailLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required fullWidth
                  InputProps={{ startAdornment: <InputAdornment position="start"><Email color="primary" fontSize="small" /></InputAdornment> }}
                />
                <TextField
                  label="Password" type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} required fullWidth
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Lock color="primary" fontSize="small" /></InputAdornment>,
                    endAdornment: <InputAdornment position="end"><IconButton size="small" onClick={() => setShowPass(!showPass)}>{showPass ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>,
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <FormControlLabel control={<Checkbox size="small" checked={remember} onChange={e => setRemember(e.target.checked)} />} label={<Typography variant="caption">Remember me</Typography>} />
                  <Typography variant="caption" color="primary" sx={{ cursor: 'pointer' }}>Forgot password?</Typography>
                </Box>
                <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ mt: 1, py: 1.5, fontSize: '1rem' }}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handlePinLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Enter PIN" type="password" value={pin} onChange={e => setPin(e.target.value)}
                  required fullWidth inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em' } }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Pin color="primary" /></InputAdornment> }}
                />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {[{ pin: '1234', role: 'Admin' }, { pin: '2345', role: 'Doctor' }, { pin: '3456', role: 'Reception' }, { pin: '4567', role: 'Pharmacist' }].map(d => (
                    <Chip key={d.pin} label={`${d.role}: ${d.pin}`} size="small" onClick={() => setPin(d.pin)} sx={{ cursor: 'pointer', fontSize: '0.7rem' }} />
                  ))}
                </Box>
                <Button type="submit" variant="contained" fullWidth size="large" disabled={loading || pin.length < 4} sx={{ py: 1.5, fontSize: '1rem' }}>
                  {loading ? 'Verifying...' : 'Quick Login'}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
          SehatConnect POS v1.0 • Optimized for Pakistan • Offline-First
        </Typography>
      </motion.div>
    </Box>
  );
}

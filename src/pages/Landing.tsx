import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Container, Typography, Grid, Card, CardContent,
  Avatar, Chip, Stack, Divider,
} from '@mui/material';
import {
  LocalHospital, People, CalendarMonth, LocalPharmacy, Biotech,
  Receipt, SwapHoriz, BarChart, Shield, Wifi, Speed, CheckCircle,
  ArrowForward, Star, MedicalServices, AdminPanelSettings,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const FEATURES = [
  { icon: <People />, title: 'Patient Management', desc: 'Complete patient records, history, and visit tracking in one place.', color: '#1565C0' },
  { icon: <MedicalServices />, title: 'Doctor Scheduling', desc: 'Manage doctor availability, shifts, and appointment allocation.', color: '#00897B' },
  { icon: <CalendarMonth />, title: 'Appointments', desc: 'Online booking, reminders, and real-time slot management.', color: '#F57C00' },
  { icon: <LocalPharmacy />, title: 'Pharmacy POS', desc: 'Point-of-sale with inventory, dispensing, and billing integration.', color: '#C62828' },
  { icon: <Biotech />, title: 'Lab Tests', desc: 'Order tests, track samples, and deliver reports digitally.', color: '#6A1B9A' },
  { icon: <Receipt />, title: 'Billing & Invoicing', desc: 'Automated invoices, insurance claims, and payment tracking.', color: '#1B5E20' },
  { icon: <SwapHoriz />, title: 'Patient Transfers', desc: 'Securely exchange patient records between hospitals in real time.', color: '#0277BD' },
  { icon: <BarChart />, title: 'Reports & Analytics', desc: 'Revenue dashboards, patient trends, and operational insights.', color: '#4527A0' },
  { icon: <AdminPanelSettings />, title: 'Role-Based Access', desc: 'Granular permissions for admin, doctors, receptionists, and more.', color: '#37474F' },
];

const STATS = [
  { value: '500+', label: 'Hospitals Connected' },
  { value: '2M+', label: 'Patients Managed' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '50+', label: 'Cities in Pakistan' },
];

const TRANSFER_STEPS = [
  { step: '01', title: 'Initiate Request', desc: 'Doctor creates a transfer request with full patient medical summary, diagnosis, medications, and urgency level.' },
  { step: '02', title: 'Receiving Hospital Accepts', desc: 'Destination hospital reviews the patient record and accepts or schedules the arrival.' },
  { step: '03', title: 'Patient in Transit', desc: 'Transfer is marked in-transit. Both hospitals track the handover in real time.' },
  { step: '04', title: 'Handover Complete', desc: 'Receiving hospital confirms arrival. Full transfer timeline is archived for audit.' },
];

const TESTIMONIALS = [
  { name: 'Dr. Sana Mirza', role: 'Medical Director, Aga Khan Hospital', text: 'SehatConnect has transformed how we coordinate inter-hospital transfers. What used to take hours of phone calls now happens in minutes.', rating: 5 },
  { name: 'Ahmed Farooq', role: 'CEO, Al-Shifa Healthcare', text: 'The pharmacy POS alone saved us 30% in billing errors. The integrated system is exactly what Pakistani healthcare needed.', rating: 5 },
  { name: 'Dr. Imran Qureshi', role: 'Head of Cardiology, CMH Rawalpindi', text: 'Critical patient transfers are now handled with zero information loss. The timeline feature gives us complete accountability.', rating: 5 },
];

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* ── NAVBAR ── */}
      <Box sx={{
        position: 'sticky', top: 0, zIndex: 100,
        bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid', borderColor: 'divider',
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LocalHospital sx={{ color: '#fff', fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={800} lineHeight={1.1}>SehatConnect</Typography>
                <Typography variant="caption" color="text.secondary" lineHeight={1}>POS & Clinic Management</Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button variant="text" color="inherit" sx={{ textTransform: 'none', fontWeight: 600, display: { xs: 'none', sm: 'inline-flex' } }}
                onClick={() => navigate('/portal')}>
                Patient Portal
              </Button>
              <Button variant="contained" disableElevation onClick={() => navigate('/login')}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 2.5 }}>
                Staff Login
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* ── HERO ── */}
      <Box sx={{
        background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 40%, #1976D2 70%, #1E88E5 100%)',
        pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 14 }, overflow: 'hidden', position: 'relative',
      }}>
        <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {[...Array(4)].map((_, i) => (
            <Box key={i} sx={{
              position: 'absolute', borderRadius: '50%',
              width: [400, 300, 250, 180][i], height: [400, 300, 250, 180][i],
              bgcolor: 'rgba(255,255,255,0.04)',
              top: [-100, '60%', '20%', '70%'][i],
              right: [-80, -60, '45%', '20%'][i],
              left: [undefined, undefined, undefined, undefined][i],
            }} />
          ))}
        </Box>
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                <Chip label="Pakistan's #1 Hospital Management Platform" size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700, mb: 3, fontSize: '0.75rem', letterSpacing: 0.5 }} />
                <Typography variant="h2" fontWeight={900} color="#fff" lineHeight={1.15} sx={{ fontSize: { xs: '2.2rem', md: '3.2rem' } }}>
                  Modern Healthcare
                  <br />
                  <Box component="span" sx={{ color: '#90CAF9' }}>Management</Box>
                  <br />
                  for Pakistan
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', mt: 2.5, mb: 4, fontWeight: 400, lineHeight: 1.6, maxWidth: 540 }}>
                  From pharmacy POS to inter-hospital patient transfers — SehatConnect gives your facility one unified platform to deliver better care.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button variant="contained" size="large" onClick={() => navigate('/login')}
                    endIcon={<ArrowForward />}
                    sx={{ bgcolor: '#fff', color: 'primary.dark', fontWeight: 800, textTransform: 'none', borderRadius: 2.5, px: 4, py: 1.5,
                      '&:hover': { bgcolor: '#E3F2FD' } }}>
                    Get Started Free
                  </Button>
                  <Button variant="outlined" size="large" onClick={() => navigate('/portal')}
                    sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'none', borderRadius: 2.5, px: 4, py: 1.5,
                      '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}>
                    Patient Portal
                  </Button>
                </Stack>
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                <Grid container spacing={2}>
                  {STATS.map((s, i) => (
                    <Grid key={i} size={{ xs: 6 }}>
                      <Card elevation={0} sx={{
                        bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)', borderRadius: 3, p: 2.5,
                        textAlign: 'center',
                      }}>
                        <Typography variant="h4" fontWeight={900} color="#fff">{s.value}</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>{s.label}</Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── TRUST BADGES ── */}
      <Box sx={{ bgcolor: 'grey.50', py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Stack direction="row" spacing={{ xs: 3, md: 6 }} justifyContent="center" flexWrap="wrap" useFlexGap>
            {[
              { icon: <Shield sx={{ fontSize: 18 }} />, label: 'HIPAA-Aligned Security' },
              { icon: <Wifi sx={{ fontSize: 18 }} />, label: 'Offline-First Architecture' },
              { icon: <Speed sx={{ fontSize: 18 }} />, label: '99.9% Uptime SLA' },
              { icon: <CheckCircle sx={{ fontSize: 18 }} />, label: 'PMDC Compliant' },
            ].map((b, i) => (
              <Stack key={i} direction="row" spacing={0.75} alignItems="center" sx={{ color: 'text.secondary' }}>
                <Box sx={{ color: 'primary.main' }}>{b.icon}</Box>
                <Typography variant="body2" fontWeight={600}>{b.label}</Typography>
              </Stack>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ── FEATURES ── */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <FadeIn>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Chip label="Full-Suite Platform" size="small" color="primary" variant="outlined" sx={{ fontWeight: 700, mb: 2 }} />
              <Typography variant="h3" fontWeight={800} sx={{ fontSize: { xs: '1.9rem', md: '2.6rem' } }}>
                Everything Your Hospital Needs
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 560, mx: 'auto' }}>
                One integrated system replacing dozens of disconnected tools — built specifically for Pakistan's healthcare environment.
              </Typography>
            </Box>
          </FadeIn>
          <Grid container spacing={3}>
            {FEATURES.map((f, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <FadeIn delay={i * 0.05}>
                  <Card elevation={0} sx={{
                    height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 3,
                    p: 0.5, transition: 'all 0.2s ease',
                    '&:hover': { boxShadow: 6, transform: 'translateY(-4px)', borderColor: f.color },
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Avatar sx={{ bgcolor: `${f.color}15`, color: f.color, width: 48, height: 48, mb: 2 }}>
                        {f.icon}
                      </Avatar>
                      <Typography variant="h6" fontWeight={700} mb={1}>{f.title}</Typography>
                      <Typography variant="body2" color="text.secondary" lineHeight={1.6}>{f.desc}</Typography>
                    </CardContent>
                  </Card>
                </FadeIn>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── INTER-HOSPITAL TRANSFERS HIGHLIGHT ── */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <FadeIn>
                <Chip label="New Feature" size="small" sx={{ bgcolor: '#E3F2FD', color: 'primary.dark', fontWeight: 700, mb: 2 }} />
                <Typography variant="h3" fontWeight={800} sx={{ fontSize: { xs: '1.9rem', md: '2.4rem' }, mb: 2 }}>
                  Seamless Inter-Hospital
                  <Box component="span" sx={{ color: 'primary.main' }}> Patient Transfers</Box>
                </Typography>
                <Typography variant="body1" color="text.secondary" lineHeight={1.7} mb={3}>
                  When a patient needs specialized care, every minute counts. SehatConnect eliminates phone tag and fax delays — the complete medical handover happens digitally, in real time.
                </Typography>
                <Stack spacing={1.5} mb={4}>
                  {['Full medical record handover', 'Critical urgency flagging', 'Real-time status tracking', 'Complete audit timeline'].map((item, i) => (
                    <Stack key={i} direction="row" spacing={1} alignItems="center">
                      <CheckCircle sx={{ color: 'success.main', fontSize: 18 }} />
                      <Typography variant="body2" fontWeight={500}>{item}</Typography>
                    </Stack>
                  ))}
                </Stack>
                <Button variant="contained" disableElevation size="large" onClick={() => navigate('/login')}
                  endIcon={<ArrowForward />}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5, px: 3 }}>
                  Try Transfers Now
                </Button>
              </FadeIn>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <FadeIn delay={0.15}>
                <Grid container spacing={2}>
                  {TRANSFER_STEPS.map((s, i) => (
                    <Grid key={i} size={{ xs: 12, sm: 6 }}>
                      <Card elevation={0} sx={{
                        border: '1px solid', borderColor: 'divider', borderRadius: 3,
                        p: 0, overflow: 'hidden',
                        borderLeft: `4px solid`,
                        borderLeftColor: ['primary.main', 'warning.main', 'secondary.main', 'success.main'][i],
                      }}>
                        <CardContent sx={{ p: 2.5 }}>
                          <Typography variant="overline" fontWeight={900} sx={{
                            color: ['primary.main', 'warning.main', 'secondary.main', 'success.main'][i],
                            fontSize: '0.85rem', letterSpacing: 1,
                          }}>
                            Step {s.step}
                          </Typography>
                          <Typography variant="subtitle1" fontWeight={700} mt={0.5} mb={1}>{s.title}</Typography>
                          <Typography variant="body2" color="text.secondary" lineHeight={1.6}>{s.desc}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </FadeIn>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── TESTIMONIALS ── */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <FadeIn>
            <Box sx={{ textAlign: 'center', mb: 7 }}>
              <Typography variant="h3" fontWeight={800} sx={{ fontSize: { xs: '1.9rem', md: '2.4rem' } }}>
                Trusted by Pakistan's Best Hospitals
              </Typography>
            </Box>
          </FadeIn>
          <Grid container spacing={3}>
            {TESTIMONIALS.map((t, i) => (
              <Grid key={i} size={{ xs: 12, md: 4 }}>
                <FadeIn delay={i * 0.1}>
                  <Card elevation={0} sx={{
                    height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 3,
                    p: 0.5,
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" spacing={0.5} mb={2}>
                        {[...Array(t.rating)].map((_, j) => <Star key={j} sx={{ color: '#FFC107', fontSize: 18 }} />)}
                      </Stack>
                      <Typography variant="body1" color="text.secondary" lineHeight={1.7} mb={3} sx={{ fontStyle: 'italic' }}>
                        "{t.text}"
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40, fontSize: '0.9rem', fontWeight: 700 }}>
                          {t.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>{t.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{t.role}</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </FadeIn>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── CTA BANNER ── */}
      <Box sx={{
        py: { xs: 8, md: 10 },
        background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
      }}>
        <Container maxWidth="md">
          <FadeIn>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={900} color="#fff" sx={{ fontSize: { xs: '1.9rem', md: '2.5rem' }, mb: 2 }}>
                Ready to Modernize Your Hospital?
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4, fontWeight: 400 }}>
                Join 500+ healthcare facilities already running on SehatConnect.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button variant="contained" size="large" onClick={() => navigate('/login')}
                  sx={{ bgcolor: '#fff', color: 'primary.dark', fontWeight: 800, textTransform: 'none', borderRadius: 2.5, px: 5, py: 1.5,
                    '&:hover': { bgcolor: '#E3F2FD' } }}>
                  Start for Free
                </Button>
                <Button variant="outlined" size="large" onClick={() => navigate('/portal')}
                  sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'none', borderRadius: 2.5, px: 5, py: 1.5,
                    '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                  Patient Portal
                </Button>
              </Stack>
            </Box>
          </FadeIn>
        </Container>
      </Box>

      {/* ── FOOTER ── */}
      <Box sx={{ bgcolor: '#0D1B2A', py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LocalHospital sx={{ color: '#fff', fontSize: 18 }} />
              </Box>
              <Typography variant="body1" fontWeight={800} color="#fff">SehatConnect</Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
              &copy; 2026 SehatConnect. Built for Pakistan's Healthcare.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

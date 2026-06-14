import { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Avatar, Chip, Button, Dialog,
  DialogContent, InputAdornment, TextField, Tabs, Tab, Paper,
  Rating, Divider, LinearProgress, Skeleton,
} from '@mui/material';
import {
  Search, AccessTime, MedicalServices, WorkspacePremium, Star,
  LocationOn, Phone, Email, FilterList,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { supabase } from '../lib/supabase';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  phone: string;
  email: string;
  fee: number;
  available: boolean;
  years_experience: number;
  qualification: string;
  bio: string;
  rating: number;
  total_reviews: number;
}

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  specialties: string[];
}

interface Availability {
  id: string;
  doctor_id: string;
  hospital_id: string;
  working_days: string;
  start_time: string;
  end_time: string;
}

interface Review {
  id: string;
  doctor_id: string;
  patient_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

const SPEC_COLORS: Record<string, string> = {
  Cardiology: '#C62828',
  Orthopedics: '#1565C0',
  Pediatrics: '#F57C00',
  Dermatology: '#00838F',
  ENT: '#558B2F',
  'General Surgery': '#2E7D32',
  Gynecology: '#AD1457',
  Neurology: '#6A1B9A',
  'General Medicine': '#37474F',
};

const SPEC_BG: Record<string, string> = {
  Cardiology: '#FFEBEE',
  Orthopedics: '#E3F2FD',
  Pediatrics: '#FFF3E0',
  Dermatology: '#E0F7FA',
  ENT: '#F1F8E9',
  'General Surgery': '#E8F5E9',
  Gynecology: '#FCE4EC',
  Neurology: '#EDE7F6',
  'General Medicine': '#ECEFF1',
};

const SPECIALIZATIONS = ['All', 'Cardiology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'ENT', 'General Surgery', 'Gynecology', 'Neurology', 'General Medicine'];

function DoctorCardSkeleton() {
  return (
    <Card sx={{ height: 280 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Skeleton variant="circular" width={72} height={72} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="70%" height={28} />
            <Skeleton variant="text" width="50%" height={20} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
        </Box>
        <Skeleton variant="rounded" width="100%" height={32} sx={{ mb: 1.5 }} />
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="75%" />
      </CardContent>
    </Card>
  );
}

export default function Doctors() {
  const theme = useTheme();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('All');
  const [selected, setSelected] = useState<Doctor | null>(null);
  const [detailTab, setDetailTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [docRes, hospRes, availRes, revRes] = await Promise.all([
      supabase.from('doctors').select('*').order('rating', { ascending: false }),
      supabase.from('hospitals').select('id,name,address,phone,specialties'),
      supabase.from('doctor_hospital_availability').select('*'),
      supabase.from('doctor_reviews').select('*').order('created_at', { ascending: false }),
    ]);
    if (docRes.data) setDoctors(docRes.data);
    if (hospRes.data) setHospitals(hospRes.data);
    if (availRes.data) setAvailability(availRes.data);
    if (revRes.data) setReviews(revRes.data);
    setLoading(false);
  };

  const filtered = doctors.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization.toLowerCase().includes(search.toLowerCase()) ||
      d.qualification?.toLowerCase().includes(search.toLowerCase());
    const matchSpec = specFilter === 'All' || d.specialization === specFilter;
    return matchSearch && matchSpec;
  });

  const getDoctorAvailability = (doctorId: string) =>
    availability.filter(a => a.doctor_id === doctorId);

  const getDoctorReviews = (doctorId: string) =>
    reviews.filter(r => r.doctor_id === doctorId);

  const getHospital = (hospitalId: string) =>
    hospitals.find(h => h.id === hospitalId);

  const specColor = (spec: string) => SPEC_COLORS[spec] || '#1565C0';
  const specBg = (spec: string) => SPEC_BG[spec] || '#E3F2FD';

  const formatTime = (t: string) => {
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>Top Doctors — Quetta</Typography>
          <Typography variant="body2" color="text.secondary">
            {doctors.length} specialists listed • Ranked by patient ratings & reviews
          </Typography>
        </Box>
      </motion.div>

      {/* Search + Filter */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Search by name, specialization or qualification..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              size="small"
              sx={{ flex: 1, minWidth: 240 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search fontSize="small" color="action" /></InputAdornment>,
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FilterList fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>Filter:</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              {SPECIALIZATIONS.slice(0, 6).map(spec => (
                <Chip
                  key={spec}
                  label={spec}
                  size="small"
                  onClick={() => setSpecFilter(spec)}
                  sx={{
                    cursor: 'pointer',
                    fontWeight: 600,
                    bgcolor: specFilter === spec
                      ? (spec === 'All' ? 'primary.main' : specColor(spec))
                      : 'action.hover',
                    color: specFilter === spec ? '#fff' : 'text.secondary',
                    '&:hover': { opacity: 0.85 },
                    transition: 'all 0.2s',
                  }}
                />
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Results count */}
      {!loading && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, ml: 0.5 }}>
          Showing {filtered.length} of {doctors.length} doctors
          {specFilter !== 'All' && ` in ${specFilter}`}
        </Typography>
      )}

      {/* Doctor Cards */}
      <Grid container spacing={2.5}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
              <DoctorCardSkeleton />
            </Grid>
          ))
        ) : filtered.length === 0 ? (
          <Grid size={12}>
            <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'action.hover' }}>
              <MedicalServices sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography color="text.secondary">No doctors found matching your search.</Typography>
            </Paper>
          </Grid>
        ) : filtered.map((doc, i) => (
          <Grid key={doc.id} size={{ xs: 12, sm: 6, lg: 4 }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Card
                onClick={() => { setSelected(doc); setDetailTab(0); }}
                sx={{
                  cursor: 'pointer', height: '100%',
                  border: `1px solid ${specColor(doc.specialization)}20`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 32px ${specColor(doc.specialization)}25`,
                    borderColor: `${specColor(doc.specialization)}50`,
                  },
                  transition: 'all 0.25s ease',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Rank badge for top 3 */}
                  {i < 3 && (
                    <Box sx={{
                      position: 'absolute', top: 12, right: 12,
                      width: 28, height: 28, borderRadius: '50%',
                      bgcolor: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : '#CD7F32',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Typography variant="caption" fontWeight={800} sx={{ color: '#fff', fontSize: '0.65rem' }}>
                        #{i + 1}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Avatar sx={{
                      width: 72, height: 72,
                      bgcolor: specBg(doc.specialization),
                      color: specColor(doc.specialization),
                      fontSize: '1.5rem', fontWeight: 800,
                      border: `2px solid ${specColor(doc.specialization)}30`,
                    }}>
                      {doc.name.split(' ').slice(1).map((n: string) => n[0]).join('').slice(0, 2) || doc.name[0]}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={700} noWrap>{doc.name}</Typography>
                      <Chip
                        label={doc.specialization}
                        size="small"
                        sx={{
                          bgcolor: specBg(doc.specialization),
                          color: specColor(doc.specialization),
                          fontWeight: 700, fontSize: '0.65rem', mt: 0.5, height: 20,
                        }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.75 }}>
                        <Rating value={doc.rating ?? 0} size="small" readOnly precision={0.1} />
                        <Typography variant="caption" fontWeight={700}>{(doc.rating ?? 0).toFixed(1)}</Typography>
                        <Typography variant="caption" color="text.secondary">({doc.total_reviews})</Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 1.5 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="subtitle2" fontWeight={800} color={specColor(doc.specialization)}>
                        {doc.years_experience}+
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Years</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="subtitle2" fontWeight={800} color={specColor(doc.specialization)}>
                        Rs {(doc.fee ?? 0).toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Fee</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Chip
                        label={doc.available ? 'Available' : 'Busy'}
                        size="small"
                        color={doc.available ? 'success' : 'default'}
                        sx={{ fontSize: '0.65rem', height: 20, fontWeight: 700 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Status</Typography>
                    </Box>
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, minHeight: 34, lineHeight: 1.5 }}>
                    {doc.bio?.slice(0, 90)}{(doc.bio?.length ?? 0) > 90 ? '...' : ''}
                  </Typography>

                  <Button
                    fullWidth variant="outlined" size="small"
                    sx={{
                      borderColor: `${specColor(doc.specialization)}50`,
                      color: specColor(doc.specialization),
                      '&:hover': {
                        bgcolor: specBg(doc.specialization),
                        borderColor: specColor(doc.specialization),
                      },
                    }}
                  >
                    View Full Profile
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Doctor Detail Dialog */}
      <AnimatePresence>
        {selected && (
          <Dialog
            open={!!selected}
            onClose={() => setSelected(null)}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
          >
            {/* Header banner */}
            <Box sx={{
              background: `linear-gradient(135deg, ${specColor(selected.specialization)} 0%, ${specColor(selected.specialization)}cc 100%)`,
              p: 3, pb: 2,
            }}>
              <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
                <Avatar sx={{
                  width: 88, height: 88,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  fontSize: '2rem', fontWeight: 800,
                  border: '3px solid rgba(255,255,255,0.4)',
                }}>
                  {selected.name.split(' ').slice(1).map((n: string) => n[0]).join('').slice(0, 2) || selected.name[0]}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" fontWeight={800} color="#fff">{selected.name}</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mb: 0.75 }}>
                    {selected.qualification}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Rating value={selected.rating ?? 0} readOnly precision={0.1} sx={{ '& .MuiRating-iconFilled': { color: '#FFD700' } }} />
                    <Typography variant="body2" fontWeight={700} color="#fff">
                      {(selected.rating ?? 0).toFixed(1)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                      ({selected.total_reviews} reviews)
                    </Typography>
                    <Chip
                      label={selected.available ? 'Available Today' : 'Not Available'}
                      size="small"
                      sx={{
                        bgcolor: selected.available ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
                        color: '#fff', fontWeight: 700, fontSize: '0.65rem',
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={detailTab} onChange={(_e, v) => setDetailTab(v)}
                sx={{ px: 2, '& .MuiTab-root': { fontWeight: 600 } }}
              >
                <Tab label="Overview" />
                <Tab label={`Availability (${getDoctorAvailability(selected.id).length})`} />
                <Tab label={`Reviews (${getDoctorReviews(selected.id).length})`} />
              </Tabs>
            </Box>

            <DialogContent sx={{ p: 3 }}>
              {detailTab === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {/* Stats row */}
                  <Grid container spacing={2}>
                    {[
                      { label: 'Experience', value: `${selected.years_experience}+ years`, icon: <WorkspacePremium />, color: specColor(selected.specialization) },
                      { label: 'Consultation Fee', value: `Rs ${(selected.fee ?? 0).toLocaleString()}`, icon: <Star />, color: '#E65100' },
                      { label: 'Reviews', value: `${selected.total_reviews} patients`, icon: <Star />, color: '#2E7D32' },
                    ].map(stat => (
                      <Grid key={stat.label} size={{ xs: 12, sm: 4 }}>
                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: `${stat.color}08`, border: `1px solid ${stat.color}20`, borderRadius: 2 }}>
                          <Avatar sx={{ bgcolor: `${stat.color}15`, color: stat.color, mx: 'auto', mb: 1, width: 40, height: 40 }}>
                            {stat.icon}
                          </Avatar>
                          <Typography variant="subtitle2" fontWeight={800} color={stat.color}>{stat.value}</Typography>
                          <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Bio */}
                  <Paper sx={{ p: 2.5, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>About</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {selected.bio}
                    </Typography>
                  </Paper>

                  {/* Contact */}
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2">{selected.phone}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email fontSize="small" color="action" />
                      <Typography variant="body2">{selected.email}</Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {detailTab === 1 && (
                <Box>
                  {getDoctorAvailability(selected.id).length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {getDoctorAvailability(selected.id).map(avail => {
                        const hospital = getHospital(avail.hospital_id);
                        return (
                          <Paper key={avail.id} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <LocationOn fontSize="small" color="primary" />
                                  <Typography variant="subtitle2" fontWeight={700}>{hospital?.name || 'Unknown Hospital'}</Typography>
                                </Box>
                                {hospital?.address && (
                                  <Typography variant="caption" color="text.secondary" sx={{ ml: 3 }}>{hospital.address}</Typography>
                                )}
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'primary.light', borderRadius: 2, px: 1.5, py: 0.5 }}>
                                <AccessTime sx={{ fontSize: 14, color: '#fff' }} />
                                <Typography variant="caption" fontWeight={700} color="#fff">
                                  {formatTime(avail.start_time)} – {formatTime(avail.end_time)}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                              {avail.working_days.split(',').map(day => (
                                <Chip
                                  key={day}
                                  label={day.trim()}
                                  size="small"
                                  sx={{
                                    bgcolor: specBg(selected.specialization),
                                    color: specColor(selected.specialization),
                                    fontWeight: 700, fontSize: '0.7rem',
                                  }}
                                />
                              ))}
                            </Box>
                          </Paper>
                        );
                      })}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <AccessTime sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                      <Typography color="text.secondary">No availability schedule listed.</Typography>
                    </Box>
                  )}
                </Box>
              )}

              {detailTab === 2 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Rating summary */}
                  {getDoctorReviews(selected.id).length > 0 && (
                    <Paper sx={{ p: 2.5, bgcolor: `${specColor(selected.specialization)}08`, border: `1px solid ${specColor(selected.specialization)}20`, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h3" fontWeight={800} color={specColor(selected.specialization)}>
                            {(selected.rating ?? 0).toFixed(1)}
                          </Typography>
                          <Rating value={selected.rating ?? 0} readOnly precision={0.1} size="small" />
                          <Typography variant="caption" color="text.secondary">{selected.total_reviews} reviews</Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          {[5, 4, 3, 2, 1].map(star => {
                            const count = getDoctorReviews(selected.id).filter(r => r.rating === star).length;
                            const pct = getDoctorReviews(selected.id).length > 0
                              ? (count / getDoctorReviews(selected.id).length) * 100 : 0;
                            return (
                              <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="caption" sx={{ minWidth: 12 }}>{star}</Typography>
                                <Star sx={{ fontSize: 12, color: '#FFB300' }} />
                                <LinearProgress variant="determinate" value={pct} sx={{
                                  flex: 1, height: 6, borderRadius: 3,
                                  bgcolor: 'action.hover',
                                  '& .MuiLinearProgress-bar': { bgcolor: '#FFB300', borderRadius: 3 },
                                }} />
                                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 20 }}>{count}</Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    </Paper>
                  )}

                  {getDoctorReviews(selected.id).map(review => (
                    <Paper key={review.id} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: specBg(selected.specialization), color: specColor(selected.specialization), fontSize: '0.85rem', fontWeight: 700 }}>
                            {review.patient_name.charAt(0)}
                          </Avatar>
                          <Typography variant="subtitle2" fontWeight={600}>{review.patient_name}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Rating value={review.rating} size="small" readOnly />
                          <Typography variant="caption" fontWeight={700}>{review.rating}/5</Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, ml: 6.5 }}>
                        "{review.comment}"
                      </Typography>
                      {review.created_at && (
                        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.75, ml: 6.5 }}>
                          {new Date(review.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </Typography>
                      )}
                    </Paper>
                  ))}

                  {getDoctorReviews(selected.id).length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Star sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                      <Typography color="text.secondary">No reviews yet.</Typography>
                    </Box>
                  )}
                </Box>
              )}
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </Box>
  );
}

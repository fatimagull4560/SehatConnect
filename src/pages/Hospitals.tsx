import { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Avatar, Chip, Dialog,
  DialogContent, InputAdornment, TextField, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Rating,
  Divider, Paper, Skeleton,
} from '@mui/material';
import {
  Search, LocalHospital, Phone, Email, LocationOn, MedicalServices,
  AccessTime, WorkspacePremium,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { supabase } from '../lib/supabase';

interface Hospital {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  specialties: string[];
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  years_experience: number;
  qualification: string;
  fee: number;
  rating: number;
  total_reviews: number;
  available: boolean;
}

interface Availability {
  id: string;
  doctor_id: string;
  hospital_id: string;
  working_days: string;
  start_time: string;
  end_time: string;
}

const SPEC_COLORS: Record<string, string> = {
  Cardiology: '#C62828', Orthopedics: '#1565C0', Pediatrics: '#F57C00',
  Dermatology: '#00838F', ENT: '#558B2F', 'General Surgery': '#2E7D32',
  Gynecology: '#AD1457', Neurology: '#6A1B9A', 'General Medicine': '#37474F',
  Surgery: '#2E7D32', Emergency: '#BF360C', Obstetrics: '#880E4F',
  Psychiatry: '#4527A0', Urology: '#1B5E20', Gastroenterology: '#AD1457',
  Research: '#0D47A1', 'All Specialties': '#1565C0', 'Teaching Hospital': '#546E7A',
  Trauma: '#D84315',
};

const HOSPITAL_ACCENT_COLORS = ['#1565C0', '#C62828', '#00897B', '#6A1B9A', '#E65100'];

function HospitalCardSkeleton() {
  return (
    <Card sx={{ height: 240 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Skeleton variant="circular" width={56} height={56} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="75%" height={24} />
            <Skeleton variant="text" width="60%" height={18} />
          </Box>
        </Box>
        <Skeleton variant="rounded" width="100%" height={28} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="45%" />
      </CardContent>
    </Card>
  );
}

export default function Hospitals() {
  const theme = useTheme();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [hospRes, docRes, availRes] = await Promise.all([
      supabase.from('hospitals').select('*').order('name'),
      supabase.from('doctors').select('id,name,specialization,years_experience,qualification,fee,rating,total_reviews,available').order('rating', { ascending: false }),
      supabase.from('doctor_hospital_availability').select('*'),
    ]);
    if (hospRes.data) setHospitals(hospRes.data);
    if (docRes.data) setDoctors(docRes.data);
    if (availRes.data) setAvailability(availRes.data);
    setLoading(false);
  };

  const filtered = hospitals.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.city?.toLowerCase().includes(search.toLowerCase()) ||
    h.address?.toLowerCase().includes(search.toLowerCase()) ||
    (h.specialties || []).some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const getHospitalDoctors = (hospitalId: string) => {
    const docIds = availability.filter(a => a.hospital_id === hospitalId).map(a => a.doctor_id);
    return doctors.filter(d => docIds.includes(d.id));
  };

  const getAvailabilityForDoctor = (hospitalId: string, doctorId: string) =>
    availability.find(a => a.hospital_id === hospitalId && a.doctor_id === doctorId);

  const specColor = (spec: string) => SPEC_COLORS[spec] || '#546E7A';

  const formatTime = (t: string) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>Hospitals in Quetta</Typography>
          <Typography variant="body2" color="text.secondary">
            {hospitals.length} hospitals & clinics • Browse facilities, specialties, and doctor schedules
          </Typography>
        </Box>
      </motion.div>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <TextField
            placeholder="Search by hospital name, area, specialty..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            fullWidth size="small"
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search fontSize="small" color="action" /></InputAdornment>,
            }}
          />
        </CardContent>
      </Card>

      {!loading && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, ml: 0.5 }}>
          Showing {filtered.length} of {hospitals.length} hospitals
        </Typography>
      )}

      <Grid container spacing={2.5}>
        {loading ? Array.from({ length: 5 }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
            <HospitalCardSkeleton />
          </Grid>
        )) : filtered.map((hospital, i) => {
          const hospDoctors = getHospitalDoctors(hospital.id);
          const accentColor = HOSPITAL_ACCENT_COLORS[i % HOSPITAL_ACCENT_COLORS.length];

          return (
            <Grid key={hospital.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.3 }}
              >
                <Card
                  onClick={() => setSelected(hospital)}
                  sx={{
                    cursor: 'pointer', height: '100%',
                    border: `1px solid ${accentColor}20`,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 32px ${accentColor}20`,
                      borderColor: `${accentColor}50`,
                    },
                    transition: 'all 0.25s ease',
                  }}
                >
                  {/* Color top strip */}
                  <Box sx={{ height: 4, bgcolor: accentColor, borderRadius: '16px 16px 0 0' }} />
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Avatar sx={{
                        width: 56, height: 56,
                        bgcolor: `${accentColor}15`,
                        color: accentColor,
                        border: `2px solid ${accentColor}30`,
                      }}>
                        <LocalHospital />
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.3, mb: 0.5 }}>
                          {hospital.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                          <LocationOn sx={{ fontSize: 13, color: 'text.secondary', mt: 0.2, flexShrink: 0 }} />
                          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                            {hospital.address}
                          </Typography>
                        </Box>
                        {hospital.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                            <Phone sx={{ fontSize: 12, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">{hospital.phone}</Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.75, mb: 2, flexWrap: 'wrap' }}>
                      {(hospital.specialties || []).slice(0, 4).map(spec => (
                        <Chip
                          key={spec}
                          label={spec}
                          size="small"
                          sx={{
                            bgcolor: `${specColor(spec)}12`,
                            color: specColor(spec),
                            fontWeight: 600,
                            fontSize: '0.6rem',
                            height: 20,
                          }}
                        />
                      ))}
                      {(hospital.specialties || []).length > 4 && (
                        <Chip
                          label={`+${hospital.specialties.length - 4} more`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.6rem', height: 20 }}
                        />
                      )}
                    </Box>

                    <Divider sx={{ mb: 1.5 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <MedicalServices sx={{ fontSize: 15, color: accentColor }} />
                        <Typography variant="caption" fontWeight={600} color={accentColor}>
                          {hospDoctors.length} doctor{hospDoctors.length !== 1 ? 's' : ''} available
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="primary.main" fontWeight={700}>
                        View Details →
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      {/* Hospital Detail Dialog */}
      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        {selected && (() => {
          const hospDoctors = getHospitalDoctors(selected.id);
          const hospIndex = hospitals.findIndex(h => h.id === selected.id);
          const accentColor = HOSPITAL_ACCENT_COLORS[hospIndex % HOSPITAL_ACCENT_COLORS.length];

          return (
            <>
              {/* Header */}
              <Box sx={{
                background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)`,
                p: 3,
              }}>
                <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
                  <Avatar sx={{
                    width: 72, height: 72,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    border: '3px solid rgba(255,255,255,0.4)',
                  }}>
                    <LocalHospital sx={{ fontSize: 36 }} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" fontWeight={800} color="#fff">{selected.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                      <LocationOn sx={{ fontSize: 16, color: 'rgba(255,255,255,0.8)' }} />
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>{selected.address}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      {selected.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Phone sx={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }} />
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>{selected.phone}</Typography>
                        </Box>
                      )}
                      {selected.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Email sx={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }} />
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>{selected.email}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={800} color="#fff">{hospDoctors.length}</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>Doctors</Typography>
                  </Box>
                </Box>
              </Box>

              <DialogContent sx={{ p: 3 }}>
                {/* Specialties */}
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Departments & Specialties</Typography>
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 3 }}>
                  {(selected.specialties || []).map(spec => (
                    <Chip
                      key={spec}
                      label={spec}
                      size="small"
                      sx={{
                        bgcolor: `${specColor(spec)}12`,
                        color: specColor(spec),
                        fontWeight: 700,
                        border: `1px solid ${specColor(spec)}30`,
                      }}
                    />
                  ))}
                </Box>

                {/* Doctors table */}
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                  Available Doctors ({hospDoctors.length})
                </Typography>

                {hospDoctors.length > 0 ? (
                  <TableContainer component={Paper} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                          <TableCell sx={{ fontWeight: 700 }}>Doctor</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Specialization</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Experience</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Fee</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Rating</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Schedule</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Timing</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {hospDoctors.map(doc => {
                          const avail = getAvailabilityForDoctor(selected.id, doc.id);
                          return (
                            <TableRow
                              key={doc.id}
                              sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                            >
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Avatar sx={{
                                    width: 36, height: 36,
                                    bgcolor: `${specColor(doc.specialization)}15`,
                                    color: specColor(doc.specialization),
                                    fontSize: '0.75rem', fontWeight: 800,
                                  }}>
                                    {doc.name.split(' ').slice(1).map((n: string) => n[0]).join('').slice(0, 2) || doc.name[0]}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" fontWeight={700}>{doc.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">{doc.qualification?.split(',')[0]}</Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={doc.specialization}
                                  size="small"
                                  sx={{
                                    bgcolor: `${specColor(doc.specialization)}12`,
                                    color: specColor(doc.specialization),
                                    fontWeight: 700, fontSize: '0.65rem',
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <WorkspacePremium sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="body2">{doc.years_experience}+ yrs</Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight={600} color="success.main">
                                  Rs {(doc.fee ?? 0).toLocaleString()}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Rating value={doc.rating ?? 0} size="small" readOnly precision={0.5} />
                                  <Typography variant="caption" fontWeight={700}>{(doc.rating ?? 0).toFixed(1)}</Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                {avail ? (
                                  <Box sx={{ display: 'flex', gap: 0.4, flexWrap: 'wrap' }}>
                                    {avail.working_days.split(',').map(day => (
                                      <Chip
                                        key={day}
                                        label={day.trim().slice(0, 3)}
                                        size="small"
                                        sx={{
                                          fontSize: '0.6rem', height: 18,
                                          bgcolor: `${accentColor}15`,
                                          color: accentColor,
                                          fontWeight: 700,
                                        }}
                                      />
                                    ))}
                                  </Box>
                                ) : <Typography variant="caption" color="text.disabled">—</Typography>}
                              </TableCell>
                              <TableCell>
                                {avail ? (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap' }}>
                                    <AccessTime sx={{ fontSize: 13, color: 'text.secondary' }} />
                                    <Typography variant="caption">
                                      {formatTime(avail.start_time)} – {formatTime(avail.end_time)}
                                    </Typography>
                                  </Box>
                                ) : <Typography variant="caption" color="text.disabled">—</Typography>}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={doc.available ? 'Available' : 'Busy'}
                                  size="small"
                                  color={doc.available ? 'success' : 'default'}
                                  sx={{ fontSize: '0.65rem', height: 20, fontWeight: 700 }}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 2 }}>
                    <MedicalServices sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                    <Typography color="text.secondary">No doctor schedule data available for this hospital.</Typography>
                  </Paper>
                )}
              </DialogContent>
            </>
          );
        })()}
      </Dialog>
    </Box>
  );
}

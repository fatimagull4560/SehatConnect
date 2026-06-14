import { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Badge, Divider, Paper, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
} from '@mui/material';
import {
  Add, Remove, Delete, ShoppingCart, Search, Inventory,
  LocalPharmacy, Receipt, QrCodeScanner, CheckCircle,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { generateInvoiceNo } from '../lib/db';

interface Medicine { id: string; name: string; generic: string; price: number; stock: number; category: string; expiry: string; lowStock: boolean; }
interface CartItem { med: Medicine; qty: number; }

const MEDICINES: Medicine[] = [
  { id: '1', name: 'Panadol 500mg', generic: 'Paracetamol', price: 85, stock: 240, category: 'Analgesic', expiry: '2026-12', lowStock: false },
  { id: '2', name: 'Augmentin 625mg', generic: 'Amoxicillin+Clavulanate', price: 1200, stock: 45, category: 'Antibiotic', expiry: '2026-08', lowStock: false },
  { id: '3', name: 'Brufen 400mg', generic: 'Ibuprofen', price: 95, stock: 180, category: 'Analgesic', expiry: '2027-03', lowStock: false },
  { id: '4', name: 'Zinat 500mg', generic: 'Cefuroxime', price: 780, stock: 8, category: 'Antibiotic', expiry: '2026-06', lowStock: true },
  { id: '5', name: 'Metformin 500mg', generic: 'Metformin HCI', price: 120, stock: 0, category: 'Antidiabetic', expiry: '2027-01', lowStock: true },
  { id: '6', name: 'Amlodipine 5mg', generic: 'Amlodipine Besylate', price: 210, stock: 95, category: 'Antihypertensive', expiry: '2027-06', lowStock: false },
  { id: '7', name: 'ORS Sachets', generic: 'Oral Rehydration Salts', price: 45, stock: 350, category: 'ORS', expiry: '2028-01', lowStock: false },
  { id: '8', name: 'Ventolin Inhaler', generic: 'Salbutamol', price: 450, stock: 22, category: 'Bronchodilator', expiry: '2026-10', lowStock: false },
];

export default function Pharmacy() {
  const [tab, setTab] = useState<'pos' | 'inventory'>('pos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cash, setCash] = useState('');
  const [invoiceDone, setInvoiceDone] = useState(false);

  const filtered = MEDICINES.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) || m.generic.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (med: Medicine) => {
    if (med.stock === 0) return;
    setCart(prev => {
      const ex = prev.find(c => c.med.id === med.id);
      if (ex) return prev.map(c => c.med.id === med.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { med, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(c => c.med.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c).filter(c => c.qty > 0));
  };

  const subtotal = cart.reduce((s, c) => s + c.med.price * c.qty, 0);
  const cashNum = parseFloat(cash) || 0;
  const change = cashNum - subtotal;

  const handleCheckout = () => {
    setCart([]);
    setCheckoutOpen(false);
    setCash('');
    setInvoiceDone(true);
    setTimeout(() => setInvoiceDone(false), 3000);
  };

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Pharmacy POS</Typography>
            <Typography variant="body2" color="text.secondary">Fast checkout • Barcode scanning • Offline ready</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant={tab === 'pos' ? 'contained' : 'outlined'} startIcon={<ShoppingCart />} onClick={() => setTab('pos')}>POS</Button>
            <Button variant={tab === 'inventory' ? 'contained' : 'outlined'} startIcon={<Inventory />} onClick={() => setTab('inventory')}>Inventory</Button>
          </Box>
        </Box>
      </motion.div>

      <AnimatePresence>
        {invoiceDone && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircle />}>Invoice created successfully! {generateInvoiceNo()}</Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {tab === 'pos' ? (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
                  <TextField placeholder="Search medicine, generic name, or barcode..." value={search} onChange={e => setSearch(e.target.value)} size="small" sx={{ flex: 1 }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
                  <IconButton size="small" sx={{ border: '1px solid', borderColor: 'divider' }}><QrCodeScanner /></IconButton>
                </Box>
                <Grid container spacing={0} sx={{ p: 2, gap: 0 }}>
                  {filtered.map((med, i) => (
                    <Grid key={med.id} size={{ xs: 12, sm: 6 }}>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                        <Paper
                          onClick={() => addToCart(med)}
                          sx={{
                            m: 0.75, p: 2, cursor: med.stock > 0 ? 'pointer' : 'not-allowed',
                            border: '1px solid', borderColor: med.lowStock ? 'warning.light' : 'divider',
                            bgcolor: med.stock === 0 ? 'action.disabledBackground' : 'background.paper',
                            '&:hover': med.stock > 0 ? { borderColor: 'primary.main', bgcolor: 'primary.50', transform: 'scale(1.01)' } : {},
                            transition: 'all 0.15s', opacity: med.stock === 0 ? 0.6 : 1,
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2" fontWeight={700}>{med.name}</Typography>
                            {med.lowStock && <Chip label="Low" size="small" color="warning" sx={{ fontSize: '0.6rem', height: 18 }} />}
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>{med.generic}</Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" fontWeight={700} color="primary">Rs {med.price}</Typography>
                            <Chip label={med.stock === 0 ? 'Out of Stock' : `Qty: ${med.stock}`} size="small" color={med.stock === 0 ? 'error' : 'success'} sx={{ fontSize: '0.65rem', height: 20 }} />
                          </Box>
                        </Paper>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ position: 'sticky', top: 80 }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Badge badgeContent={cart.reduce((s, c) => s + c.qty, 0)} color="primary">
                    <ShoppingCart color="primary" />
                  </Badge>
                  <Typography variant="h6" fontWeight={700}>Cart</Typography>
                </Box>

                {cart.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <LocalPharmacy sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">No items in cart.<br />Click medicines to add.</Typography>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ maxHeight: 320, overflow: 'auto' }}>
                      <AnimatePresence>
                        {cart.map(item => (
                          <motion.div key={item.med.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                                <Typography variant="caption" fontWeight={600} sx={{ flex: 1, pr: 1 }}>{item.med.name}</Typography>
                                <IconButton size="small" color="error" onClick={() => setCart(c => c.filter(x => x.med.id !== item.med.id))}><Delete sx={{ fontSize: 14 }} /></IconButton>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <IconButton size="small" onClick={() => updateQty(item.med.id, -1)}><Remove sx={{ fontSize: 14 }} /></IconButton>
                                  <Typography variant="body2" fontWeight={700} sx={{ minWidth: 24, textAlign: 'center' }}>{item.qty}</Typography>
                                  <IconButton size="small" onClick={() => updateQty(item.med.id, 1)}><Add sx={{ fontSize: 14 }} /></IconButton>
                                </Box>
                                <Typography variant="body2" fontWeight={700} color="primary">Rs {(item.med.price * item.qty).toLocaleString()}</Typography>
                              </Box>
                            </Box>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      <Divider sx={{ mb: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight={700}>Total</Typography>
                        <Typography variant="subtitle1" fontWeight={700} color="primary">Rs {subtotal.toLocaleString()}</Typography>
                      </Box>
                      <Button variant="contained" fullWidth startIcon={<Receipt />} onClick={() => setCheckoutOpen(true)} size="large">
                        Checkout
                      </Button>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Medicine</TableCell>
                    <TableCell>Generic</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Expiry</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {MEDICINES.map(med => (
                    <TableRow key={med.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                      <TableCell><Typography variant="body2" fontWeight={600}>{med.name}</Typography></TableCell>
                      <TableCell><Typography variant="caption" color="text.secondary">{med.generic}</Typography></TableCell>
                      <TableCell><Chip label={med.category} size="small" sx={{ fontSize: '0.65rem' }} /></TableCell>
                      <TableCell><Typography variant="body2" fontWeight={600} color="primary">Rs {med.price}</Typography></TableCell>
                      <TableCell><Typography variant="body2" fontWeight={600}>{med.stock}</Typography></TableCell>
                      <TableCell><Typography variant="caption">{med.expiry}</Typography></TableCell>
                      <TableCell>
                        <Chip label={med.stock === 0 ? 'Out of Stock' : med.lowStock ? 'Low Stock' : 'In Stock'}
                          size="small" color={med.stock === 0 ? 'error' : med.lowStock ? 'warning' : 'success'} sx={{ fontSize: '0.65rem' }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      <Dialog open={checkoutOpen} onClose={() => setCheckoutOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle><Typography variant="h6" fontWeight={700}>Checkout</Typography></DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
              {cart.map(item => (
                <Box key={item.med.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption">{item.med.name} x{item.qty}</Typography>
                  <Typography variant="caption" fontWeight={600}>Rs {(item.med.price * item.qty).toLocaleString()}</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" fontWeight={700}>Total</Typography>
                <Typography variant="subtitle2" fontWeight={700} color="primary">Rs {subtotal.toLocaleString()}</Typography>
              </Box>
            </Paper>
            <TextField label="Cash Received (Rs)" type="number" value={cash} onChange={e => setCash(e.target.value)} fullWidth autoFocus />
            {cashNum >= subtotal && cashNum > 0 && (
              <Alert severity="success">Change: Rs {change.toLocaleString()}</Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setCheckoutOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleCheckout} variant="contained" disabled={cashNum < subtotal} startIcon={<CheckCircle />}>Confirm Sale</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

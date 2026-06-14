import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ColorModeProvider } from './contexts/ColorModeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SyncProvider } from './contexts/SyncContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Transfers from './pages/Transfers';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Pharmacy from './pages/Pharmacy';
import Lab from './pages/Lab';
import Billing from './pages/Billing';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import Hospitals from './pages/Hospitals';
import PatientPortal from './pages/PatientPortal';
import { Box, CircularProgress } from '@mui/material';

function ProtectedRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/pharmacy" element={<Pharmacy />} />
        <Route path="/lab" element={<Lab />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/transfers" element={<Transfers />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ColorModeProvider>
        <AuthProvider>
          <SyncProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<LoginRoute />} />
              <Route path="/portal" element={<PatientPortal />} />
              <Route path="/*" element={<ProtectedRoutes />} />
            </Routes>
          </SyncProvider>
        </AuthProvider>
      </ColorModeProvider>
    </BrowserRouter>
  );
}

function LoginRoute() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Login />;
}

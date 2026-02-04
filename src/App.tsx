import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Landing
import Landing from './pages/Landing';

// Patient Pages
import PatientRegister from './pages/patient/Register';
import PatientLogin from './pages/patient/Login';
import PatientDashboard from './pages/patient/Dashboard';
import PatientProfile from './pages/patient/Profile';
import PatientBooking from './pages/patient/Booking';
import PatientAppointments from './pages/patient/Appointments';
import PatientMedicalHistory from './pages/patient/MedicalHistory';
import PatientMedicalHistoryDetail from './pages/patient/MedicalHistoryDetail';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminDoctors from './pages/admin/Doctors';
import AdminSpecialties from './pages/admin/Specialties';
import AdminServices from './pages/admin/Services';
import AdminShifts from './pages/admin/Shifts';
import AdminPendingApproval from './pages/admin/PendingApproval';
import AdminCheckIn from './pages/admin/CheckIn';
import AdminAppointmentTracking from './pages/admin/AppointmentTracking';

// Doctor Pages
import DoctorLogin from './pages/doctor/Login';
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorExamination from './pages/doctor/Examination';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/patient/register" element={<PatientRegister />} />
      <Route path="/patient/login" element={<PatientLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/doctor/login" element={<DoctorLogin />} />

      {/* Protected Patient Routes */}
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']} redirectTo="/patient/login">
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/profile"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']} redirectTo="/patient/login">
            <PatientProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/booking"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']} redirectTo="/patient/login">
            <PatientBooking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/appointments"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']} redirectTo="/patient/login">
            <PatientAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/medical-history"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']} redirectTo="/patient/login">
            <PatientMedicalHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/medical-history/:id"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']} redirectTo="/patient/login">
            <PatientMedicalHistoryDetail />
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']} redirectTo="/admin/login">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']} redirectTo="/admin/login">
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/doctors"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']} redirectTo="/admin/login">
            <AdminDoctors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/specialties"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']} redirectTo="/admin/login">
            <AdminSpecialties />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/services"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']} redirectTo="/admin/login">
            <AdminServices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/shifts"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']} redirectTo="/admin/login">
            <AdminShifts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/appointments/pending"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']} redirectTo="/admin/login">
            <AdminPendingApproval />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/checkin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']} redirectTo="/admin/login">
            <AdminCheckIn />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/appointments"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']} redirectTo="/admin/login">
            <AdminAppointmentTracking />
          </ProtectedRoute>
        }
      />

      {/* Protected Doctor Routes */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']} redirectTo="/doctor/login">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/examination/:id"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']} redirectTo="/doctor/login">
            <DoctorExamination />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

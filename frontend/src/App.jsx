import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Unauthorized from './pages/auth/Unauthorized';

// Layouts
import AdminLayout from './layouts/AdminLayout';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminDoctors from './pages/admin/Doctors';
import AdminPatients from './pages/admin/Patients';
import AdminDepartments from './pages/admin/Departments';
import AdminUsers from './pages/admin/Users';
import AdminSchedules from './pages/admin/Schedules';
import AdminAppointments from './pages/admin/Appointments';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';

// Patient Pages
import PatientDoctorSearch from './pages/patient/DoctorSearch';
import PatientDoctorProfile from './pages/patient/DoctorProfile';

// Dummy Dashboard Components for other roles
const PatientDashboard = () => <div className="p-8 text-2xl font-bold text-center">Patient Dashboard</div>;
const DoctorDashboard = () => <div className="p-8 text-2xl font-bold text-center">Doctor Dashboard</div>;
const ReceptionDashboard = () => <div className="p-8 text-2xl font-bold text-center">Reception Dashboard</div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/doctors" element={<AdminDoctors />} />
                <Route path="/admin/patients" element={<AdminPatients />} />
                <Route path="/admin/departments" element={<AdminDepartments />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/schedules" element={<AdminSchedules />} />
                <Route path="/admin/appointments" element={<AdminAppointments />} />
                <Route path="/admin/reports" element={<AdminReports />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>
            </Route>

            {/* Protected Patient Routes */}
            <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
              <Route path="/patient/dashboard" element={<PatientDashboard />} />
              <Route path="/patient/doctors" element={<PatientDoctorSearch />} />
              <Route path="/patient/doctors/:id" element={<PatientDoctorProfile />} />
            </Route>

            {/* Protected Doctor Routes */}
            <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            </Route>

            {/* Protected Reception Routes */}
            <Route element={<ProtectedRoute allowedRoles={['RECEPTIONIST']} />}>
              <Route path="/reception/dashboard" element={<ReceptionDashboard />} />
            </Route>

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

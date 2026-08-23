import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Public Pages
import Landing from './pages/public/Landing';

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
import PatientLayout from './layouts/PatientLayout';
import Dashboard from './pages/patient/Dashboard';
import PatientDoctorSearch from './pages/patient/DoctorSearch';
import PatientDoctorProfile from './pages/patient/DoctorProfile';
import Booking from './pages/patient/Booking';
import BookingConfirmation from './pages/patient/BookingConfirmation';
import Appointments from './pages/patient/Appointments';
import Queue from './pages/patient/Queue';
import Notifications from './pages/Notifications';
import Profile from './pages/patient/Profile';
import Prescriptions from './pages/patient/Prescriptions';
import LabResults from './pages/patient/LabResults';
import Billing from './pages/patient/Billing';
import FamilyMembers from './pages/patient/FamilyMembers';
import Telemedicine from './pages/patient/Telemedicine';

// Doctor Pages
import DoctorLayout from './layouts/DoctorLayout';
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorQueue from './pages/doctor/Queue';
import DoctorPatients from './pages/doctor/Patients';
import DoctorProfile from './pages/doctor/Profile';
import DoctorSchedules from './pages/doctor/Schedules';
import DoctorPrescriptions from './pages/doctor/Prescriptions';
import DoctorSettings from './pages/doctor/Settings';

// Reception Pages
import ReceptionLayout from './layouts/ReceptionLayout';
import ReceptionDashboard from './pages/reception/Dashboard';
import ReceptionPatients from './pages/reception/Patients';
import ReceptionAppointments from './pages/reception/Appointments';
import ReceptionCheckIn from './pages/reception/CheckIn';
import ReceptionQueue from './pages/reception/Queue';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
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
                  <Route path="/admin/notifications" element={<Notifications />} />
                </Route>
              </Route>

              {/* Protected Patient Routes */}
              <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
                <Route element={<PatientLayout />}>
                  <Route path="/patient/dashboard" element={<Dashboard />} />
                  <Route path="/patient/doctors" element={<PatientDoctorSearch />} />
                  <Route path="/patient/doctors/:id" element={<PatientDoctorProfile />} />
                  <Route path="/book/:id" element={<Booking />} />
                  <Route path="/confirmation/:id" element={<BookingConfirmation />} />
                  <Route path="/patient/appointments" element={<Appointments />} />
                  <Route path="/patient/queue" element={<Queue />} />
                  <Route path="/patient/notifications" element={<Notifications />} />
                  <Route path="/patient/profile" element={<Profile />} />
                  <Route path="/patient/prescriptions" element={<Prescriptions />} />
                  <Route path="/patient/labs" element={<LabResults />} />
                  <Route path="/patient/billing" element={<Billing />} />
                  <Route path="/patient/family" element={<FamilyMembers />} />
                  <Route path="/patient/telemedicine" element={<Telemedicine />} />
                </Route>
              </Route>

              {/* Protected Doctor Routes */}
              <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
                <Route element={<DoctorLayout />}>
                  <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
                  <Route path="/doctor/appointments" element={<DoctorAppointments />} />
                  <Route path="/doctor/queue" element={<DoctorQueue />} />
                  <Route path="/doctor/schedules" element={<DoctorSchedules />} />
                  <Route path="/doctor/patients" element={<DoctorPatients />} />
                  <Route path="/doctor/profile" element={<DoctorProfile />} />
                  <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
                  <Route path="/doctor/notifications" element={<Notifications />} />
                  <Route path="/doctor/settings" element={<DoctorSettings />} />
                </Route>
              </Route>

              {/* Protected Reception Routes */}
              <Route element={<ProtectedRoute allowedRoles={['RECEPTIONIST']} />}>
                <Route element={<ReceptionLayout />}>
                  <Route path="/reception/dashboard" element={<ReceptionDashboard />} />
                  <Route path="/reception/patients" element={<ReceptionPatients />} />
                  <Route path="/reception/appointments" element={<ReceptionAppointments />} />
                  <Route path="/reception/check-in" element={<ReceptionCheckIn />} />
                  <Route path="/reception/queue" element={<ReceptionQueue />} />
                  <Route path="/reception/notifications" element={<Notifications />} />
                </Route>
              </Route>

              {/* Catch All */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Users, Calendar, Clock, Bell, UserCircle, LogOut, Menu, X, Pill, FileBarChart, CreditCard, UserPlus, Video } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import NotificationDropdown from '../components/NotificationDropdown';

const PatientLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/patient/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Find Doctors', path: '/patient/doctors', icon: <Users size={20} /> },
        { name: 'Appointments', path: '/patient/appointments', icon: <Calendar size={20} /> },
        { name: 'Telemedicine', path: '/patient/telemedicine', icon: <Video size={20} /> },
        { name: 'Prescriptions', path: '/patient/prescriptions', icon: <Pill size={20} /> },
        { name: 'Lab Results', path: '/patient/labs', icon: <FileBarChart size={20} /> },
        { name: 'Live Queue', path: '/patient/queue', icon: <Clock size={20} /> },
        { name: 'Billing', path: '/patient/billing', icon: <CreditCard size={20} /> },
        { name: 'Family', path: '/patient/family', icon: <UserPlus size={20} /> },
        { name: 'Notifications', path: '/patient/notifications', icon: <Bell size={20} /> },
        { name: 'Profile', path: '/patient/profile', icon: <UserCircle size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            <Toaster position="top-right" />
            
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} shadow-xl`}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Patient Portal</span>
                    <button className="md:hidden text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
                        <X size={24} />
                    </button>
                </div>
                
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) => 
                                `flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
                            }
                        >
                            <span className="mr-3">{item.icon}</span>
                            <span className="font-medium">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2.5 text-slate-300 hover:text-white hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors"
                    >
                        <LogOut size={20} className="mr-3" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
                    <div className="flex items-center md:hidden gap-3">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-600 hover:text-blue-600">
                            <Menu size={24} />
                        </button>
                        <span className="text-xl font-bold text-blue-600">Patient Portal</span>
                    </div>
                    <div className="flex-1"></div>
                    <div className="flex items-center space-x-6">
                        <NotificationDropdown rolePrefix="patient" />
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-2 shadow-sm border border-blue-200">
                                {user?.firstName?.charAt(0) || 'P'}
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold text-gray-700">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs text-blue-600 font-medium capitalize">Patient Account</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default PatientLayout;

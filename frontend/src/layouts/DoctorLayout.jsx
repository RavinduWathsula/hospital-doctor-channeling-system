import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, CalendarCheck, Clock, CalendarDays, Users, UserCircle, LogOut, Stethoscope, Menu, X, Pill } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import NotificationDropdown from '../components/NotificationDropdown';

const DoctorLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/doctor/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Appointments', path: '/doctor/appointments', icon: <CalendarCheck size={20} /> },
        { name: 'Live Queue', path: '/doctor/queue', icon: <Clock size={20} /> },
        { name: 'My Schedule', path: '/doctor/schedules', icon: <CalendarDays size={20} /> },
        { name: 'Patients', path: '/doctor/patients', icon: <Users size={20} /> },
        { name: 'Prescriptions', path: '/doctor/prescriptions', icon: <Pill size={20} /> },
        { name: 'Profile', path: '/doctor/profile', icon: <UserCircle size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            <Toaster position="top-right" />
            
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-teal-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} shadow-xl`}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-teal-800">
                    <div className="flex items-center">
                        <Stethoscope className="mr-2 text-teal-400" size={24} />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-400">Doctor Portal</span>
                    </div>
                    <button className="md:hidden text-teal-100 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
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
                                `flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30' : 'text-teal-100 hover:bg-teal-800 hover:text-white'}`
                            }
                        >
                            <span className="mr-3">{item.icon}</span>
                            <span className="font-medium">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-teal-800">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2.5 text-teal-100 hover:text-white hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors"
                    >
                        <LogOut size={20} className="mr-3" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-50 relative">
                    <div className="flex items-center md:hidden gap-3">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-600 hover:text-teal-600">
                            <Menu size={24} />
                        </button>
                        <div className="flex items-center">
                            <Stethoscope className="mr-2 text-teal-600" size={24} />
                            <span className="text-xl font-bold text-teal-600">Doctor Portal</span>
                        </div>
                    </div>
                    <div className="flex-1"></div>
                    <div className="flex items-center space-x-6">
                        <NotificationDropdown rolePrefix="doctor" />
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold mr-2 shadow-sm border border-teal-200">
                                {user?.firstName?.charAt(0) || 'D'}
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold text-gray-700">Dr. {user?.firstName} {user?.lastName}</p>
                                <p className="text-xs text-teal-600 font-medium capitalize">Doctor Account</p>
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

export default DoctorLayout;

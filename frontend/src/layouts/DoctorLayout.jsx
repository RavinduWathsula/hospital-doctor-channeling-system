import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, CalendarCheck, Clock, CalendarDays, Users, UserCircle, LogOut, Stethoscope, Menu, X, Pill, Settings } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import NotificationDropdown from '../components/NotificationDropdown';

const DoctorLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [currentTime, setCurrentTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const timeString = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(currentTime);

    const dateString = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    }).format(currentTime);

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
        { name: 'Settings', path: '/doctor/settings', icon: <Settings size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            <Toaster position="top-right" />
            
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-theme-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} shadow-xl`}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-theme-800">
                    <div className="flex items-center">
                        <Stethoscope className="mr-2 text-theme-300" size={24} />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-theme-300 to-theme-100">Doctor Portal</span>
                    </div>
                    <button className="md:hidden text-theme-300 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
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
                                `flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive ? 'bg-theme-600 text-white shadow-lg shadow-theme-500/30 font-semibold' : 'text-theme-100 hover:bg-theme-800 hover:text-white font-medium'}`
                            }
                        >
                            <span className="mr-3">{item.icon}</span>
                            <span className="font-medium">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-theme-800">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2.5 text-theme-200 hover:text-white hover:bg-theme-800 rounded-lg transition-colors font-medium"
                    >
                        <LogOut size={20} className="mr-3" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-50 relative">
                    <div className="flex items-center md:hidden gap-3">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-600 hover:text-theme-600">
                            <Menu size={24} />
                        </button>
                        <div className="flex items-center">
                            <Stethoscope className="mr-2 text-theme-600" size={24} />
                            <span className="text-xl font-bold text-theme-600">Doctor Portal</span>
                        </div>
                    </div>
                    <div className="flex-1 flex justify-end md:justify-center px-4">
                        <div className="hidden md:flex items-center gap-4 text-sm font-semibold text-slate-600 bg-slate-100/80 px-5 py-2 rounded-full border border-slate-200/50 shadow-sm">
                            <span className="flex items-center gap-2"><CalendarCheck size={16} className="text-teal-600" /> {dateString}</span>
                            <span className="text-slate-300">|</span>
                            <span className="flex items-center gap-2 font-mono"><Clock size={16} className="text-teal-600 animate-pulse" /> {timeString}</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        <NotificationDropdown rolePrefix="doctor" />
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-theme-100 flex items-center justify-center text-theme-600 font-bold mr-2 shadow-sm border border-theme-200">
                                {user?.first_name?.charAt(0) || 'D'}
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold text-gray-700">Dr. {user?.first_name} {user?.last_name}</p>
                                <p className="text-xs text-theme-600 font-medium capitalize">Doctor Account</p>
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

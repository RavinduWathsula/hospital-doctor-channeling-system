import React, { useContext, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, CalendarCheck, Clock, CalendarDays, Users, UserCircle, LogOut, Stethoscope, Menu, X, Pill, Settings } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import NotificationDropdown from '../components/NotificationDropdown';

const DoctorLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [currentTime, setCurrentTime] = React.useState(new Date());
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const handleConfirmLogout = () => {
        setShowLogoutConfirm(false);
        toast.success(`See you next time, Dr. ${user?.first_name || ''}! 👋`, {
            style: {
                borderRadius: '12px',
                background: '#0f172a',
                color: '#fff',
                border: '1px solid #1e293b',
            },
            iconTheme: {
                primary: '#14b8a6', // teal color for doctor
                secondary: '#fff',
            },
            duration: 2000,
        });
        setTimeout(() => {
            logout();
            navigate('/login');
        }, 1200);
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
                        onClick={handleLogoutClick}
                        className="group relative flex items-center w-full px-4 py-3 bg-theme-800/40 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-orange-500/20 text-theme-200 hover:text-red-400 rounded-xl transition-all duration-300 overflow-hidden shadow-sm hover:shadow-red-500/10 border border-transparent hover:border-red-500/20"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
                        <div className="relative flex items-center w-full">
                            <LogOut size={20} className="mr-3 group-hover:-translate-x-1 group-hover:text-red-400 transition-all duration-300" />
                            <span className="font-medium group-hover:pl-1 transition-all duration-300">Logout Securely</span>
                        </div>
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
                            <div className="w-8 h-8 rounded-full bg-theme-100 flex items-center justify-center text-theme-600 font-bold mr-2 shadow-sm border border-theme-200 overflow-hidden">
                                {user?.profile_image ? (
                                    <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    user?.first_name?.charAt(0) || 'D'
                                )}
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

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)}></div>
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative z-10 shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <LogOut size={32} className="text-red-600 ml-1" />
                        </div>
                        <h3 className="text-2xl font-bold text-center text-slate-800 mb-2">Sign Out</h3>
                        <p className="text-center text-slate-500 mb-8 font-medium">Are you sure you want to securely log out of the doctor portal?</p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmLogout}
                                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-600/30"
                            >
                                Yes, Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorLayout;

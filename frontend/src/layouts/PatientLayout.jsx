import React, { useContext, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Users, Calendar, Clock, Bell, UserCircle, LogOut, Menu, X, Pill, FileBarChart, CreditCard, UserPlus, Video } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import NotificationDropdown from '../components/NotificationDropdown';

const PatientLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const handleConfirmLogout = () => {
        setShowLogoutConfirm(false);
        toast.success(`See you next time, ${user?.first_name || 'friend'}! 👋`, {
            style: {
                borderRadius: '12px',
                background: '#1e293b',
                color: '#fff',
                border: '1px solid #334155',
            },
            iconTheme: {
                primary: '#3b82f6',
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
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans print:h-auto print:overflow-visible print:bg-white">
            <Toaster position="top-right" />
            
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} shadow-xl print:hidden`}>
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
                        onClick={handleLogoutClick}
                        className="group relative flex items-center w-full px-4 py-3 bg-slate-800/40 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-orange-500/20 text-slate-300 hover:text-red-400 rounded-xl transition-all duration-300 overflow-hidden shadow-sm hover:shadow-red-500/10 border border-transparent hover:border-red-500/20"
                    >
                        {/* Hover animated background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
                        
                        <div className="relative flex items-center w-full">
                            <LogOut size={20} className="mr-3 group-hover:-translate-x-1 group-hover:text-red-500 transition-all duration-300" />
                            <span className="font-medium group-hover:pl-1 transition-all duration-300">Logout</span>
                        </div>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-50 relative print:hidden">
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
                                {user?.first_name?.charAt(0) || 'P'}
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold text-gray-700">{user?.first_name} {user?.last_name}</p>
                                <p className="text-xs text-blue-600 font-medium capitalize">Patient Account</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50/50 p-6 print:overflow-visible print:p-0 print:bg-white">
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
                        <p className="text-center text-slate-500 mb-8 font-medium">Are you sure you want to log out of your account?</p>
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

export default PatientLayout;

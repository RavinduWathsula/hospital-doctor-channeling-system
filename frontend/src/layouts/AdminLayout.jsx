import React, { useContext, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Users, Activity, Building, Calendar, ClipboardList, Settings, LogOut, UserCircle, Menu, X, Command } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import NotificationDropdown from '../components/NotificationDropdown';

const AdminLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const handleConfirmLogout = () => {
        setShowLogoutConfirm(false);
        toast.success(`See you next time, ${user?.first_name || 'Admin'}! 👋`, {
            style: {
                borderRadius: '12px',
                background: '#fff',
                color: '#334155',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            },
            iconTheme: {
                primary: '#4f46e5',
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
        { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Doctors', path: '/admin/doctors', icon: <Activity size={20} /> },
        { name: 'Patients', path: '/admin/patients', icon: <UserCircle size={20} /> },
        { name: 'Departments', path: '/admin/departments', icon: <Building size={20} /> },
        { name: 'Schedules', path: '/admin/schedules', icon: <Calendar size={20} /> },
        { name: 'Appointments', path: '/admin/appointments', icon: <ClipboardList size={20} /> },
        { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
        { name: 'Reports', path: '/admin/reports', icon: <Activity size={20} /> },
        { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-slate-50/50 overflow-hidden font-sans">
            <Toaster position="top-right" />
            
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
            )}

            {/* Sidebar - Light & Professional Theme */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col transform transition-all duration-300 ease-in-out border-r border-slate-200 shadow-sm md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo Area */}
                <div className="h-20 flex items-center justify-between px-8 border-b border-slate-100 relative overflow-hidden bg-white">
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                            <Command size={22} className="text-indigo-600" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-slate-800">Smart<span className="text-indigo-600 font-bold">Hospital</span></span>
                    </div>
                    <button className="md:hidden text-slate-400 hover:text-slate-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                        <X size={24} />
                    </button>
                </div>
                
                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar bg-white">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-4">Admin Menu</div>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) => 
                                `flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                                    isActive 
                                    ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600 shadow-sm' 
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border-l-4 border-transparent'
                                }`
                            }
                        >
                            <span className={`mr-4 transition-colors ${
                                ({ isActive }) => isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                            }`}>{item.icon}</span>
                            <span className="tracking-wide text-sm">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Logout Area */}
                <div className="p-6 border-t border-slate-100 relative overflow-hidden bg-white">
                    <button 
                        onClick={handleLogoutClick}
                        className="relative overflow-hidden flex items-center justify-center w-full px-4 py-3 text-slate-600 bg-slate-50 border border-slate-200 hover:border-rose-200 hover:text-rose-600 rounded-2xl transition-all duration-300 group shadow-sm"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-rose-50 to-orange-50 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
                        <div className="relative flex items-center justify-center w-full">
                            <LogOut size={20} className="mr-3 group-hover:-translate-x-1 group-hover:scale-110 transition-all duration-300" />
                            <span className="font-semibold transition-colors group-hover:pl-1 duration-300">Logout Securely</span>
                        </div>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Top Header - Light Professional */}
                <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-8 z-10 sticky top-0 transition-all shadow-sm">
                    <div className="flex items-center md:hidden gap-4">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 shadow-sm border border-slate-200 transition-all">
                            <Menu size={20} />
                        </button>
                        <span className="text-lg font-black tracking-tight text-slate-800">Admin Portal</span>
                    </div>
                    <div className="flex-1 hidden md:block">
                        {/* Could put a global search bar here if desired in the future */}
                    </div>
                    
                    <div className="flex items-center space-x-6">
                        <NotificationDropdown rolePrefix="admin" />
                        <div className="h-8 w-px bg-slate-200"></div>
                        <div className="flex items-center group cursor-pointer">
                            <div className="text-right mr-3 hidden md:block">
                                <p className="font-bold text-slate-800 text-sm">{user?.first_name} {user?.last_name}</p>
                                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{user?.role}</p>
                            </div>
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center text-indigo-700 font-black border border-indigo-200 shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all">
                                {user?.first_name?.charAt(0) || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)}></div>
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative z-10 shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
                        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <LogOut size={32} className="text-rose-600 ml-1" />
                        </div>
                        <h3 className="text-2xl font-bold text-center text-slate-800 mb-2">Sign Out</h3>
                        <p className="text-center text-slate-500 mb-8 font-medium">Are you sure you want to securely log out of the admin portal?</p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmLogout}
                                className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-rose-600/30"
                            >
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLayout;

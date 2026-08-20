import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Users, Calendar, Clock, Bell, UserCircle, LogOut } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

const PatientLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/patient/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Find Doctors', path: '/patient/doctors', icon: <Users size={20} /> },
        { name: 'Appointments', path: '/patient/appointments', icon: <Calendar size={20} /> },
        { name: 'Live Queue', path: '/patient/queue', icon: <Clock size={20} /> },
        { name: 'Notifications', path: '/patient/notifications', icon: <Bell size={20} /> },
        { name: 'Profile', path: '/patient/profile', icon: <UserCircle size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            <Toaster position="top-right" />
            
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex shadow-xl z-20">
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Patient Portal</span>
                </div>
                
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
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
                    <div className="flex items-center md:hidden">
                        <span className="text-xl font-bold text-blue-600">Patient Portal</span>
                    </div>
                    <div className="flex-1"></div>
                    <div className="flex items-center space-x-4">
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

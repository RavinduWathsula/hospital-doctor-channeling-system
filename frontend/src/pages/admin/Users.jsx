import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Search, Shield, UserCircle, Settings, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Users = () => {
    const { token } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        setIsLoading(true);
        fetch('http://localhost:5000/api/users', { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => { if(data.success) setUsers(data.data); })
            .catch(() => toast.error('Error fetching users'))
            .finally(() => setIsLoading(false));
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            const res = await fetch(`http://localhost:5000/api/users/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            const data = await res.json();
            if(data.success) {
                toast.success('User status updated');
                fetchUsers();
            } else toast.error(data.message);
        } catch { toast.error('Error updating status'); }
    };

    const filtered = users.filter(u => (u.first_name + ' ' + u.last_name + ' ' + u.email + ' ' + u.role).toLowerCase().includes(search.toLowerCase()));

    const getRoleBadge = (role) => {
        switch (role) {
            case 'ADMIN': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'DOCTOR': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'RECEPTIONIST': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'PATIENT': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const tableVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const rowVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
                        <Shield className="text-indigo-600 mr-3" size={32} /> User Access Control
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Manage global system access and role-based permissions.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search size={18} className="text-slate-400" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search by name, email, or role..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                            className="w-full sm:w-80 pl-11 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm" 
                        />
                    </div>
                </div>
            </div>

            {/* Main Table Container */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden relative">
                {isLoading ? (
                    <div className="p-12 text-center">
                        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-500 font-medium">Loading user database...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50/50 backdrop-blur-md text-slate-500 uppercase tracking-widest text-xs font-bold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-5">User</th>
                                    <th className="px-6 py-5">Role & Clearance</th>
                                    <th className="px-6 py-5">System Status</th>
                                    <th className="px-6 py-5 text-right">Access Controls</th>
                                </tr>
                            </thead>
                            <motion.tbody variants={tableVariants} initial="hidden" animate="show">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-16 text-center">
                                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner rotate-3">
                                                <UserCircle size={32} className="text-slate-400" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-800 mb-1">No users found</h3>
                                            <p className="text-slate-500">No users match your current search parameters.</p>
                                        </td>
                                    </tr>
                                ) : filtered.map(u => (
                                    <motion.tr variants={rowVariants} key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-700 font-black shadow-sm mr-4 border border-slate-200">
                                                    {u.first_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 text-base">{u.first_name} {u.last_name}</div>
                                                    <div className="text-slate-500 text-xs font-semibold">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wide border shadow-sm ${getRoleBadge(u.role)}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${
                                                u.is_active 
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                                                : 'bg-rose-50 text-rose-600 border border-rose-200'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${u.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                                {u.is_active ? 'Access Granted' : 'Access Revoked'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {u.role !== 'ADMIN' && (
                                                <button 
                                                    onClick={() => toggleStatus(u.id, u.is_active)} 
                                                    className={`inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                                        u.is_active 
                                                        ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 hover:shadow-md' 
                                                        : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:shadow-md'
                                                    }`}
                                                >
                                                    {u.is_active ? (
                                                        <><XCircle size={16} className="mr-1.5" /> Revoke</>
                                                    ) : (
                                                        <><CheckCircle size={16} className="mr-1.5" /> Grant</>
                                                    )}
                                                </button>
                                            )}
                                            {u.role === 'ADMIN' && (
                                                <span className="text-xs font-bold text-slate-400 italic">Protected</span>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </motion.tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Users;

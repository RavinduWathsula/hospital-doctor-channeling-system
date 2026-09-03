import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Search, UserCircle, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Patients = () => {
    const { token } = useContext(AuthContext);
    const [patients, setPatients] = useState([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = () => {
        setIsLoading(true);
        fetch('/api/patients', { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => { if(data.success) setPatients(data.data); })
            .catch(() => toast.error('Error fetching patients'))
            .finally(() => setIsLoading(false));
    };

    const toggleStatus = async (userId, currentStatus) => {
        try {
            const res = await fetch(`/api/patients/${userId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            const data = await res.json();
            if(data.success) {
                toast.success('Patient status updated');
                fetchPatients();
            } else toast.error(data.message);
        } catch { toast.error('Error updating status'); }
    };

    const filtered = patients.filter(p => (p.first_name + ' ' + p.last_name + ' ' + (p.nic || '')).toLowerCase().includes(search.toLowerCase()));

    const tableVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
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
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Patient Directory</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage hospital patients, view details, and control access.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search size={18} className="text-slate-400" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search patients..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                            className="w-full sm:w-72 pl-11 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm" 
                        />
                    </div>
                </div>
            </div>

            {/* Main Table Container */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden relative">
                
                {isLoading ? (
                    <div className="p-12 text-center">
                        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-500 font-medium">Loading patients directory...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50/50 backdrop-blur-md text-slate-500 uppercase tracking-widest text-xs font-bold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-5">Profile</th>
                                    <th className="px-6 py-5">Name & NIC</th>
                                    <th className="px-6 py-5">Contact Details</th>
                                    <th className="px-6 py-5">Gender</th>
                                    <th className="px-6 py-5">Status</th>
                                    <th className="px-6 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <motion.tbody 
                                variants={tableVariants}
                                initial="hidden"
                                animate="show"
                            >
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center">
                                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner rotate-3">
                                                <UserCircle size={32} className="text-slate-400" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-800 mb-1">No patients found</h3>
                                            <p className="text-slate-500">There are no patients matching your current search criteria.</p>
                                        </td>
                                    </tr>
                                ) : filtered.map(p => (
                                    <motion.tr variants={rowVariants} key={p.id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-50 overflow-hidden shadow-sm border border-blue-50 flex items-center justify-center">
                                                <span className="text-lg font-black text-blue-700">{p.first_name.charAt(0)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800 text-base mb-0.5 group-hover:text-blue-600 transition-colors">{p.first_name} {p.last_name}</div>
                                            <div className="text-slate-500 text-xs font-semibold">{p.nic || 'No NIC provided'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-700">{p.phone || 'N/A'}</div>
                                            <div className="text-slate-500 text-xs">{p.email || 'No email'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-slate-100 px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 uppercase tracking-wide">
                                                {p.gender || 'Not specified'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${
                                                p.is_active 
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                                                : 'bg-rose-50 text-rose-600 border border-rose-200'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${p.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                                {p.is_active ? 'Active Account' : 'Suspended'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => toggleStatus(p.user_id, p.is_active)} 
                                                className={`inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                                    p.is_active 
                                                    ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 hover:shadow-md' 
                                                    : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:shadow-md'
                                                }`}
                                            >
                                                {p.is_active ? (
                                                    <><XCircle size={16} className="mr-1.5" /> Suspend</>
                                                ) : (
                                                    <><CheckCircle size={16} className="mr-1.5" /> Reactivate</>
                                                )}
                                            </button>
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

export default Patients;

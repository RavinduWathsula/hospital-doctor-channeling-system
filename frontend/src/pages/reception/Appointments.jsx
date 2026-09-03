import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Search, Eye, ShieldCheck, X, Calendar as CalendarIcon, Clock, User, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ReceptionAppointments = () => {
    const { token } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/appointments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setAppointments(data.data);
            }
        } catch (error) {
            toast.error('Error fetching appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        if (!window.confirm(`Are you sure you want to mark this as ${status}?`)) return;
        
        try {
            const res = await fetch(`/api/appointments/${id}/admin-status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                fetchAppointments();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Server error');
        }
    };

    const filtered = appointments.filter(a => 
        (a.patient_first_name + ' ' + a.patient_last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.doctor_first_name + ' ' + a.doctor_last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.id.toString().includes(searchTerm)
    );

    const getBadge = (status) => {
        const styles = {
            'PENDING': 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20',
            'CONFIRMED': 'bg-blue-500/10 text-blue-600 border border-blue-500/20',
            'CHECKED_IN': 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20',
            'WAITING': 'bg-purple-500/10 text-purple-600 border border-purple-500/20',
            'CALLED': 'bg-pink-500/10 text-pink-600 border border-pink-500/20',
            'IN_CONSULTATION': 'bg-orange-500/10 text-orange-600 border border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.3)] animate-pulse',
            'COMPLETED': 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
            'NO_SHOW': 'bg-red-500/10 text-red-600 border border-red-500/20',
            'CANCELLED': 'bg-slate-500/10 text-slate-600 border border-slate-500/20'
        };
        
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase shadow-sm ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status.replace('_', ' ')}
            </span>
        );
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 font-sans pb-12">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="relative">
                    <div className="absolute -inset-4 bg-indigo-500/20 blur-3xl -z-10 rounded-full opacity-50"></div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Appointments Hub</h1>
                    <p className="text-slate-500 text-sm font-semibold mt-1 tracking-wide uppercase">Hospital Command Center</p>
                </div>
                
                <div className="relative group w-full lg:w-96">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                    <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl shadow-lg flex items-center p-1">
                        <div className="p-3 text-indigo-500">
                            <Search size={20} strokeWidth={2.5} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search ID, Patient, or Doctor..." 
                            className="bg-transparent border-none outline-none w-full py-3 pr-4 text-slate-700 font-medium placeholder-slate-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white/60 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white/60 overflow-hidden relative">
                {/* Decorative background gradients */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-indigo-100/50 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-100/50 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>

                <div className="overflow-x-auto p-2">
                    <table className="w-full text-left text-sm border-separate border-spacing-y-3">
                        <thead>
                            <tr className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                <th className="px-6 py-4 rounded-l-2xl">ID / Q.No</th>
                                <th className="px-6 py-4">Patient</th>
                                <th className="px-6 py-4">Doctor</th>
                                <th className="px-6 py-4">Schedule</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 rounded-r-2xl text-right">Actions</th>
                            </tr>
                        </thead>
                        
                        <motion.tbody 
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center">
                                        <div className="inline-flex items-center justify-center p-4 bg-indigo-50 rounded-full">
                                            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-4 text-slate-400 transform rotate-12">
                                                <CalendarIcon size={40} />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-800">No Appointments Found</h3>
                                            <p className="text-slate-500 mt-2 font-medium">Try adjusting your search criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence>
                                    {filtered.map(app => (
                                        <motion.tr 
                                            key={app.id} 
                                            variants={itemVariants}
                                            layout
                                            className="group bg-white hover:bg-slate-50/80 transition-all duration-300 shadow-sm hover:shadow-md border border-slate-100"
                                        >
                                            <td className="px-6 py-5 rounded-l-3xl border-y border-l border-slate-100 group-hover:border-indigo-100 transition-colors">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-slate-400 tracking-wider">#{app.id}</span>
                                                    <span className="text-lg font-black text-indigo-600">Q-{app.queue_number}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 border-y border-slate-100 group-hover:border-indigo-100 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center text-blue-600 shadow-inner">
                                                        <User size={18} strokeWidth={2.5} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-base">{app.patient_first_name} {app.patient_last_name}</p>
                                                        <p className="text-xs font-bold text-slate-400">Patient</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 border-y border-slate-100 group-hover:border-indigo-100 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center text-emerald-600 shadow-inner">
                                                        <Stethoscope size={18} strokeWidth={2.5} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-base">Dr. {app.doctor_first_name} {app.doctor_last_name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 border-y border-slate-100 group-hover:border-indigo-100 transition-colors">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center text-slate-700 font-semibold text-sm bg-slate-100/50 w-fit px-2.5 py-1 rounded-lg">
                                                        <CalendarIcon size={14} className="mr-2 text-indigo-500" />
                                                        {new Date(app.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                    <div className="flex items-center text-slate-500 font-bold text-xs bg-slate-100/50 w-fit px-2.5 py-1 rounded-lg">
                                                        <Clock size={14} className="mr-2 text-purple-500" />
                                                        {app.appointment_time}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 border-y border-slate-100 group-hover:border-indigo-100 transition-colors">
                                                {getBadge(app.status)}
                                            </td>
                                            <td className="px-6 py-5 rounded-r-3xl border-y border-r border-slate-100 group-hover:border-indigo-100 transition-colors text-right">
                                                <div className="flex justify-end gap-2">
                                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="w-10 h-10 flex items-center justify-center text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm" title="View Details">
                                                        <Eye size={18} strokeWidth={2.5} />
                                                    </motion.button>
                                                    
                                                    {app.status === 'PENDING' && (
                                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => handleStatusUpdate(app.id, 'CONFIRMED')} className="w-10 h-10 flex items-center justify-center text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm" title="Confirm">
                                                            <ShieldCheck size={18} strokeWidth={2.5} />
                                                        </motion.button>
                                                    )}
                                                    
                                                    {(app.status === 'PENDING' || app.status === 'CONFIRMED') && (
                                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => handleStatusUpdate(app.id, 'CANCELLED')} className="w-10 h-10 flex items-center justify-center text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm" title="Cancel">
                                                            <X size={18} strokeWidth={2.5} />
                                                        </motion.button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            )}
                        </motion.tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReceptionAppointments;

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Search, CheckCircle, UserCheck, CalendarDays, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ReceptionCheckIn = () => {
    const { token } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isCheckedIn, setIsCheckedIn] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm) return;

        try {
            setLoading(true);
            setAppointment(null);
            setIsCheckedIn(false);
            
            const res = await fetch('/api/appointments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (data.success && data.data) {
                const today = new Date().toISOString().split('T')[0];
                const found = data.data.find(a => 
                    a.appointment_date.split('T')[0] === today && 
                    (a.id.toString() === searchTerm || a.queue_number?.toString() === searchTerm || a.patient_first_name.toLowerCase() === searchTerm.toLowerCase()) &&
                    (a.status === 'PENDING' || a.status === 'CONFIRMED')
                );

                if (found) {
                    setAppointment(found);
                } else {
                    toast.error("No valid appointment found for check-in today.");
                }
            }
        } catch (error) {
            toast.error('Search error');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        if (!appointment) return;

        try {
            const res = await fetch(`/api/appointments/${appointment.id}/admin-status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ status: 'WAITING' })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Patient checked in successfully!');
                setIsCheckedIn(true);
                setTimeout(() => {
                    setAppointment(null);
                    setSearchTerm('');
                    setIsCheckedIn(false);
                }, 3000);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Error checking in');
        }
    };

    return (
        <div className="max-w-4xl mx-auto min-h-[80vh] flex flex-col justify-center py-10 relative font-sans">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center mb-12 relative"
            >
                <div className="relative inline-flex items-center justify-center w-28 h-28 mb-6 group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl rotate-6 group-hover:rotate-12 transition-transform duration-500 opacity-20 blur-lg"></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl rotate-3 shadow-xl"></div>
                    <div className="absolute inset-[2px] bg-white rounded-[22px] flex items-center justify-center z-10">
                        <UserCheck size={48} strokeWidth={2} className="text-indigo-600 drop-shadow-md" />
                    </div>
                </div>
                <h1 className="text-5xl font-black text-slate-800 tracking-tight mb-3">Fast Check-In</h1>
                <p className="text-slate-500 font-medium text-lg">Verify arrival and add patients to the live queue instantly.</p>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                className="w-full max-w-2xl mx-auto"
            >
                <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60 p-3 mb-8">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1 group">
                            <div className="absolute inset-0 bg-indigo-500/5 rounded-2xl transition-colors group-hover:bg-indigo-500/10 -z-10"></div>
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" size={24} />
                            <input 
                                type="text" 
                                placeholder="Queue No, Appt ID, or Patient Name..." 
                                className="w-full pl-16 pr-6 py-5 bg-transparent border-none rounded-2xl outline-none text-xl font-semibold text-slate-700 placeholder-slate-400 transition-all focus:ring-0"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading || isCheckedIn}
                            className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-black text-lg tracking-wide transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 relative overflow-hidden"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                            ) : (
                                'Verify'
                            )}
                        </button>
                    </form>
                </div>

                <AnimatePresence mode="wait">
                    {appointment && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ type: "spring", bounce: 0.4 }}
                            className="relative"
                        >
                            {/* Ticket styling with dashed borders */}
                            <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col relative z-10">
                                {/* Ticket top border accent */}
                                <div className="h-3 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                                
                                <div className="p-8 md:p-10">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <div className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-xs font-black tracking-widest uppercase mb-4 shadow-sm">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                                                Match Found
                                            </div>
                                            <h2 className="text-3xl font-black text-slate-800">{appointment.patient_first_name} {appointment.patient_last_name}</h2>
                                            <p className="text-slate-500 font-medium text-lg mt-1">Ready for check-in</p>
                                        </div>
                                        <div className="w-20 h-20 bg-indigo-50 rounded-2xl border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center transform rotate-3 shadow-inner">
                                            <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Q-No</span>
                                            <span className="text-3xl font-black text-indigo-600">{appointment.queue_number}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50/80 rounded-3xl border border-slate-100/80 mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-500">
                                                <UserCheck size={24} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Doctor</p>
                                                <p className="font-bold text-slate-800 text-lg">Dr. {appointment.doctor_first_name} {appointment.doctor_last_name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-purple-500">
                                                <Clock size={24} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Time</p>
                                                <p className="font-bold text-slate-800 text-lg">{appointment.appointment_time}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {!isCheckedIn ? (
                                        <button 
                                            onClick={handleCheckIn}
                                            className="group relative w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xl tracking-wide transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
                                        >
                                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <span className="relative flex items-center justify-center gap-3">
                                                <CheckCircle size={28} /> Complete Check-In
                                            </span>
                                        </button>
                                    ) : (
                                        <div className="w-full py-5 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center justify-center gap-3 animate-in zoom-in duration-300">
                                            <CheckCircle2 size={28} className="animate-bounce" />
                                            <span className="font-black text-xl">Successfully Checked In!</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Decorative ticket circles */}
                            <div className="absolute top-[60%] -left-6 w-12 h-12 bg-gray-50 rounded-full shadow-inner z-20 hidden md:block"></div>
                            <div className="absolute top-[60%] -right-6 w-12 h-12 bg-gray-50 rounded-full shadow-inner z-20 hidden md:block"></div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ReceptionCheckIn;

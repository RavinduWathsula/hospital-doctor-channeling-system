import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Users, Activity, Loader2, Sparkles, User, Clock, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ReceptionQueue = () => {
    const { token } = useContext(AuthContext);
    const [queues, setQueues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQueues();
        const interval = setInterval(fetchQueues, 30000); // Auto-refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchQueues = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/queues', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data) {
                setQueues(data.data);
            }
        } catch (error) {
            toast.error('Error fetching live queues');
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 font-sans pb-12 relative min-h-screen">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-blue-100/40 via-indigo-50/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
                <div>
                    <div className="inline-flex items-center px-3 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-full text-xs font-black tracking-widest uppercase mb-4 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-rose-500 mr-2 animate-pulse"></span>
                        Live Updates
                    </div>
                    <h1 className="text-4xl font-black text-slate-800 flex items-center tracking-tight">
                        Hospital Queue
                    </h1>
                    <p className="text-slate-500 font-medium text-lg mt-2">Real-time overview of active doctors and waiting patients.</p>
                </div>
                <button 
                    onClick={fetchQueues}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 font-bold rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 group"
                >
                    <Activity size={18} className="group-hover:animate-spin" />
                    Refresh Now
                </button>
            </div>

            {loading && queues.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-64 gap-4">
                    <Loader2 className="animate-spin text-indigo-500" size={48} />
                    <p className="text-slate-500 font-bold tracking-wide animate-pulse">Syncing hospital feeds...</p>
                </div>
            ) : queues.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="flex flex-col items-center justify-center py-32 bg-white/60 backdrop-blur-3xl rounded-[3rem] border border-white shadow-xl relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50 pointer-events-none"></div>
                    <div className="w-32 h-32 bg-gradient-to-tr from-slate-100 to-indigo-50 rounded-[2.5rem] flex items-center justify-center transform rotate-12 shadow-inner mb-8 relative">
                        <div className="absolute -top-4 -right-4 w-8 h-8 bg-amber-200 rounded-full blur-md opacity-60"></div>
                        <Users size={56} className="text-indigo-300 -rotate-12" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-2 z-10">No Active Queues</h2>
                    <p className="text-slate-500 font-medium text-lg z-10">It's quiet right now. Doctors have cleared their lists.</p>
                </motion.div>
            ) : (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                >
                    {queues.map((doctorQueue) => (
                        <motion.div 
                            key={doctorQueue.doctorId} 
                            variants={cardVariants}
                            className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-white/60 overflow-hidden flex flex-col group hover:shadow-[0_20px_60px_-15px_rgba(79,70,229,0.15)] transition-all duration-500 relative"
                        >
                            {/* Decorative blur blob */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/10 rounded-full blur-3xl -z-10 group-hover:bg-indigo-500/20 transition-colors duration-500"></div>

                            {/* Doctor Header */}
                            <div className="p-6 pb-5 relative">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80"></div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="font-black text-2xl text-slate-800 tracking-tight">Dr. {doctorQueue.doctorName}</h2>
                                        <p className="text-indigo-600 font-bold text-sm tracking-wide mt-1">{doctorQueue.specialization}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center font-bold text-xl shadow-inner border border-indigo-100">
                                        {doctorQueue.doctorName.charAt(0)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col px-6 pb-6">
                                {/* Current Patient */}
                                <div className="relative mb-6">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                                        <Sparkles size={12} className="mr-1 text-amber-500" /> Currently Seeing
                                    </p>
                                    
                                    {doctorQueue.currentPatient ? (
                                        <div className="relative bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-5 text-white shadow-xl overflow-hidden transform group-hover:scale-[1.02] transition-transform duration-300">
                                            {/* Glowing ring effect */}
                                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                                            
                                            <div className="flex items-center gap-4 relative z-10">
                                                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner border border-white/20">
                                                    {doctorQueue.currentPatient.queue_number}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-lg leading-tight mb-1">{doctorQueue.currentPatient.first_name} {doctorQueue.currentPatient.last_name}</p>
                                                    <p className="text-xs text-indigo-200 font-medium flex items-center">
                                                        <Clock size={12} className="mr-1" /> Scheduled: {doctorQueue.currentPatient.appointment_time}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-slate-50 border border-slate-100 border-dashed rounded-3xl p-6 text-center">
                                            <p className="text-slate-400 font-bold">No active consultation</p>
                                            <p className="text-slate-400 text-xs mt-1">Waiting for next patient</p>
                                        </div>
                                    )}
                                </div>

                                {/* Waiting List */}
                                <div className="flex-1 flex flex-col">
                                    <div className="flex justify-between items-center mb-4 px-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Up Next in Queue</p>
                                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-black shadow-sm border border-indigo-100">
                                            {doctorQueue.waitingPatients?.length || 0} Waiting
                                        </span>
                                    </div>
                                    
                                    {doctorQueue.waitingPatients && doctorQueue.waitingPatients.length > 0 ? (
                                        <div className="flex-1 space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                                            {doctorQueue.waitingPatients.map((p, idx) => (
                                                <div key={p.id} className="group/item flex items-center p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all shadow-sm hover:shadow-md cursor-pointer relative overflow-hidden">
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 scale-y-0 group-hover/item:scale-y-100 transition-transform origin-center"></div>
                                                    
                                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center font-black text-slate-400 group-hover/item:text-indigo-600 transition-colors mr-3 shrink-0">
                                                        {p.queue_number}
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-slate-700 text-sm truncate group-hover/item:text-slate-900 transition-colors">{p.first_name} {p.last_name}</p>
                                                        <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{p.appointment_time}</p>
                                                    </div>
                                                    
                                                    <ChevronRight size={16} className="text-slate-300 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50/50 rounded-3xl border border-slate-100 border-dashed">
                                            <User size={24} className="text-slate-300 mb-2" />
                                            <p className="text-slate-500 font-semibold text-sm">Queue is empty</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
};

export default ReceptionQueue;

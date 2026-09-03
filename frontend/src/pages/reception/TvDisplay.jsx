import React, { useEffect, useState } from 'react';
import { Volume2, MonitorPlay, Activity, Clock, BellRing, Info, ActivitySquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LiveDateTime from '../../components/LiveDateTime';

const ReceptionTvDisplay = () => {
    const [queues, setQueues] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        fetchQueues();
        const interval = setInterval(fetchQueues, 15000); // Auto-refresh every 15 seconds
        
        const timeInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => {
            clearInterval(interval);
            clearInterval(timeInterval);
        };
    }, []);

    const fetchQueues = async () => {
        try {
            // Note: In a real app this should be a public or specific endpoint for TV display
            // that doesn't require admin token, or you pass a specific display token.
            // Using the existing endpoint for demo.
            const res = await fetch('/api/queues');
            const data = await res.json();
            if (data.success && data.data) {
                setQueues(data.data);
            }
        } catch (error) {
            console.error('Error fetching live queues for TV', error);
        }
    };

    // Filter out patients who are CALLED so they flash prominently
    const callingPatients = queues.flatMap(q => 
        q.waitingPatients
            ?.filter(p => p.status === 'CALLED')
            .map(p => ({ ...p, doctorName: q.doctorName, room: q.room || 'Consultation Room' })) || []
    );

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 text-slate-200 overflow-hidden font-sans flex flex-col">
            {/* Dark Mode Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[120%] bg-indigo-900/20 skew-x-12 blur-3xl opacity-50"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[80%] bg-blue-900/20 -skew-x-12 blur-3xl opacity-50"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-10"></div>
            </div>

            {/* Header Section */}
            <header className="relative z-10 flex items-center justify-between px-8 py-6 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.4)]">
                        <MonitorPlay size={32} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                            SmartHospital <span className="text-indigo-400">Live</span>
                        </h1>
                        <p className="text-slate-400 font-semibold tracking-widest uppercase text-sm mt-1 flex items-center gap-2">
                            <ActivitySquare size={14} className="text-emerald-400" /> Waitlist Status Display
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="px-6 py-3 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-white/5 flex items-center gap-3 shadow-lg">
                        <Clock className="text-indigo-400" size={24} />
                        <span className="text-3xl font-black tracking-wider text-white">{formatTime(currentTime)}</span>
                    </div>
                </div>
            </header>

            {/* Main Content Split */}
            <div className="flex-1 flex overflow-hidden relative z-10 p-6 gap-6">
                
                {/* Left Side: Now Calling (High Priority) */}
                <div className="w-1/3 flex flex-col bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                    <div className="p-6 bg-gradient-to-r from-emerald-900/40 to-slate-900 border-b border-white/10 flex items-center justify-between">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                            <BellRing className="text-emerald-400 animate-bounce" size={28} />
                            NOW CALLING
                        </h2>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                        <AnimatePresence>
                            {callingPatients.length > 0 ? (
                                callingPatients.map((p, idx) => (
                                    <motion.div 
                                        key={p.id}
                                        initial={{ opacity: 0, x: -50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="bg-gradient-to-br from-emerald-500/20 to-teal-900/40 border border-emerald-500/30 rounded-3xl p-6 shadow-[0_0_40px_rgba(16,185,129,0.15)] relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl -z-10 rounded-full animate-pulse"></div>
                                        
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-slate-300 font-bold tracking-widest text-sm uppercase">Ticket Number</p>
                                            <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,1)] animate-ping"></div>
                                        </div>
                                        
                                        <h3 className="text-7xl font-black text-white tracking-tighter mb-6">
                                            {p.queue_number}
                                        </h3>
                                        
                                        <div className="space-y-2">
                                            <p className="text-2xl font-bold text-emerald-300">Dr. {p.doctorName}</p>
                                            <div className="inline-flex items-center px-4 py-2 bg-emerald-950/50 rounded-xl text-emerald-400 font-bold border border-emerald-800/50">
                                                Proceed to {p.room}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 p-8">
                                    <Volume2 size={64} className="text-slate-600 mb-6" />
                                    <p className="text-2xl font-bold text-slate-400">Please wait for your queue number to be called.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Side: Doctor Queues */}
                <div className="w-2/3 flex flex-col bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="p-6 bg-gradient-to-r from-indigo-900/40 to-slate-900 border-b border-white/10 flex items-center justify-between">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                            <Users className="text-indigo-400" size={28} />
                            WAITING LIST
                        </h2>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                        {queues.every(q => q.waitingPatients?.filter(p => p.status === 'WAITING' || p.status === 'PENDING').length === 0) && (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                <Activity size={80} className="mb-6 opacity-20" />
                                <p className="text-2xl font-black tracking-wide">No patients currently waiting</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-6">
                            {queues.map(q => {
                                const waiting = q.waitingPatients?.filter(p => p.status === 'WAITING' || p.status === 'PENDING') || [];
                                if (waiting.length === 0) return null;

                                return (
                                    <div key={q.doctorId} className="bg-slate-800/60 border border-slate-700/50 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors duration-500"></div>
                                        
                                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
                                            <div>
                                                <h3 className="text-2xl font-black text-white">Dr. {q.doctorName}</h3>
                                                <p className="text-indigo-400 font-bold">{q.specialization}</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center font-bold text-xl text-slate-300 border border-slate-700">
                                                {waiting.length}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            {waiting.slice(0, 9).map(p => (
                                                <div key={p.id} className="bg-slate-900/80 border border-slate-700 rounded-xl py-3 text-center shadow-inner text-white font-black text-2xl">
                                                    {p.queue_number}
                                                </div>
                                            ))}
                                            {waiting.length > 9 && (
                                                <div className="bg-slate-900/40 border border-slate-700/50 border-dashed rounded-xl py-3 text-center text-slate-400 font-black text-xl flex items-center justify-center">
                                                    +{waiting.length - 9}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Ticker */}
            <div className="h-12 bg-indigo-600 relative z-20 flex items-center overflow-hidden border-t border-indigo-500">
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-indigo-600 to-transparent z-10"></div>
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-indigo-600 to-transparent z-10"></div>
                
                <div className="animate-marquee whitespace-nowrap flex items-center text-indigo-50 font-bold tracking-widest uppercase text-sm">
                    <span className="mx-8 flex items-center"><Info size={16} className="mr-2" /> Please keep your belongings safe</span>
                    <span className="mx-8 flex items-center">•</span>
                    <span className="mx-8 flex items-center">Maintain silence in the waiting area</span>
                    <span className="mx-8 flex items-center">•</span>
                    <span className="mx-8 flex items-center">For any assistance, contact the front desk</span>
                    <span className="mx-8 flex items-center">•</span>
                    <span className="mx-8 flex items-center">Masks are highly recommended inside the hospital</span>
                    <span className="mx-8 flex items-center">•</span>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 20s linear infinite;
                    min-width: 200%;
                }
            `}} />
        </div>
    );
};

export default ReceptionTvDisplay;

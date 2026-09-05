import React, { useEffect, useState } from 'react';
import { Volume2, MonitorPlay, Activity, Clock, BellRing, Info, ActivitySquare, Sparkles, Stethoscope, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="relative w-full min-h-[85vh] rounded-[2.5rem] bg-[#0B0F19] text-slate-200 overflow-hidden font-sans flex flex-col selection:bg-indigo-500/30 shadow-2xl border border-slate-800">
            {/* Immersive Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-indigo-900/30 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }}></div>
                <div className="absolute top-[20%] -right-[20%] w-[60%] h-[80%] bg-purple-900/20 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }}></div>
                <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }}></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyIvPjwvc3ZnPg==')] opacity-20"></div>
            </div>

            {/* Premium Header */}
            <header className="relative z-10 flex items-center justify-between px-10 py-8 bg-slate-900/40 backdrop-blur-2xl border-b border-white/5 shadow-2xl">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                        <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl border border-white/20">
                            <ActivitySquare size={40} className="text-white" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300 drop-shadow-lg">
                            SmartHospital
                        </h1>
                        <p className="text-indigo-400 font-bold tracking-[0.2em] uppercase text-sm mt-2 flex items-center gap-2">
                            <Sparkles size={16} /> Patient Queue Display
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    <div className="text-6xl font-black tracking-wider text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] tabular-nums">
                        {formatTime(currentTime)}
                    </div>
                    <div className="text-indigo-300 font-semibold tracking-widest uppercase text-lg mt-1">
                        {formatDate(currentTime)}
                    </div>
                </div>
            </header>

            {/* Main Content Layout */}
            <div className="flex-1 flex overflow-hidden relative z-10 p-8 gap-8">
                
                {/* Left Column: Now Calling (High Priority) */}
                <div className="w-[45%] flex flex-col gap-6">
                    <div className="flex items-center gap-4 bg-emerald-900/30 border border-emerald-500/20 backdrop-blur-md py-4 px-8 rounded-3xl shadow-lg">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,1)] animate-ping"></div>
                        <h2 className="text-3xl font-black text-emerald-400 tracking-widest uppercase flex items-center gap-3">
                            <BellRing size={32} /> Now Serving
                        </h2>
                    </div>

                    <div className="flex-1 flex flex-col gap-6 overflow-y-hidden">
                        <AnimatePresence>
                            {callingPatients.length > 0 ? (
                                callingPatients.slice(0, 3).map((p, idx) => (
                                    <motion.div 
                                        key={p.id}
                                        initial={{ opacity: 0, scale: 0.8, x: -100 }}
                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, x: -100 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                        className={`relative overflow-hidden rounded-[2.5rem] border backdrop-blur-xl p-10 flex flex-col justify-center shadow-2xl ${
                                            idx === 0 
                                                ? 'bg-gradient-to-br from-emerald-500/20 via-teal-900/40 to-slate-900 border-emerald-400/50 flex-1' 
                                                : 'bg-slate-800/40 border-slate-600/50 flex-none'
                                        }`}
                                    >
                                        {idx === 0 && (
                                            <div className="absolute inset-0 bg-emerald-500/5 animate-pulse -z-10"></div>
                                        )}
                                        
                                        <div className="flex items-center justify-between mb-4">
                                            <p className={`font-black tracking-widest uppercase ${idx === 0 ? 'text-emerald-400 text-xl' : 'text-slate-400 text-sm'}`}>
                                                Ticket Number
                                            </p>
                                        </div>
                                        
                                        <h3 className={`font-black text-white tracking-tighter drop-shadow-xl ${idx === 0 ? 'text-[8rem] leading-none mb-6' : 'text-6xl mb-2'}`}>
                                            {p.queue_number}
                                        </h3>
                                        
                                        <div className={`mt-auto bg-slate-900/60 rounded-3xl p-6 border ${idx === 0 ? 'border-emerald-500/30' : 'border-white/5'}`}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Doctor</p>
                                                    <p className={`font-bold ${idx === 0 ? 'text-3xl text-emerald-300' : 'text-xl text-white'}`}>
                                                        Dr. {p.doctorName}
                                                    </p>
                                                </div>
                                                <div className={`px-6 py-4 rounded-2xl font-black text-xl flex items-center gap-2 ${idx === 0 ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-slate-700 text-white'}`}>
                                                    {p.room} <ChevronRight size={24} />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[3rem]">
                                    <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center mb-8 shadow-inner border border-slate-700">
                                        <MonitorPlay size={64} className="text-slate-600" />
                                    </div>
                                    <p className="text-3xl font-black text-slate-300 tracking-wide">Waiting for next patient</p>
                                    <p className="text-slate-500 font-semibold mt-4 text-xl">Please check your queue number</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Column: Waitlist Grid */}
                <div className="w-[55%] flex flex-col gap-6">
                    <div className="flex items-center gap-4 bg-indigo-900/30 border border-indigo-500/20 backdrop-blur-md py-4 px-8 rounded-3xl shadow-lg">
                        <Activity size={32} className="text-indigo-400" />
                        <h2 className="text-3xl font-black text-indigo-300 tracking-widest uppercase">
                            Up Next (Waiting)
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        {queues.every(q => q.waitingPatients?.filter(p => p.status === 'WAITING' || p.status === 'PENDING').length === 0) && (
                            <div className="flex flex-col items-center justify-center h-full text-slate-600 bg-slate-900/30 backdrop-blur-sm rounded-[3rem] border border-white/5">
                                <Stethoscope size={100} className="mb-8 opacity-20" />
                                <p className="text-3xl font-black tracking-widest uppercase">Queue is Empty</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-6">
                            {queues.map(q => {
                                const waiting = q.waitingPatients?.filter(p => p.status === 'WAITING' || p.status === 'PENDING') || [];
                                if (waiting.length === 0) return null;

                                return (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={q.doctorId} 
                                        className="bg-slate-800/40 backdrop-blur-lg border border-white/10 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group hover:bg-slate-800/60 transition-colors"
                                    >
                                        {/* Doctor Header */}
                                        <div className="flex items-start justify-between mb-6">
                                            <div>
                                                <h3 className="text-2xl font-black text-white">Dr. {q.doctorName}</h3>
                                                <p className="text-indigo-400 font-bold uppercase tracking-wider text-sm mt-1">{q.specialization}</p>
                                            </div>
                                            <div className="flex flex-col items-center justify-center bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-2xl w-16 h-16 shadow-inner">
                                                <span className="text-xs font-bold uppercase tracking-widest">Wait</span>
                                                <span className="text-2xl font-black">{waiting.length}</span>
                                            </div>
                                        </div>

                                        {/* Tickets Grid */}
                                        <div className="grid grid-cols-3 gap-3">
                                            {waiting.slice(0, 6).map(p => (
                                                <div key={p.id} className="bg-slate-900/80 border border-white/5 rounded-xl py-3 text-center shadow-md text-white font-black text-2xl tracking-wider">
                                                    {p.queue_number}
                                                </div>
                                            ))}
                                            {waiting.length > 6 && (
                                                <div className="bg-indigo-900/30 border border-indigo-500/30 border-dashed rounded-xl py-3 text-center text-indigo-300 font-black text-xl flex items-center justify-center">
                                                    +{waiting.length - 6}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Bottom Ticker */}
            <div className="h-16 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 relative z-20 flex items-center overflow-hidden border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                <div className="absolute left-0 top-0 bottom-0 w-48 bg-gradient-to-r from-indigo-950 to-transparent z-10"></div>
                <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-indigo-950 to-transparent z-10"></div>
                
                <div className="animate-marquee whitespace-nowrap flex items-center text-indigo-100 font-black tracking-widest uppercase text-xl">
                    <span className="mx-12 flex items-center"><Info size={24} className="mr-3 text-emerald-400" /> Please wait in the designated seating area</span>
                    <span className="mx-12 text-indigo-500 opacity-50">✦</span>
                    <span className="mx-12 flex items-center">Have your documents ready before entering the consultation room</span>
                    <span className="mx-12 text-indigo-500 opacity-50">✦</span>
                    <span className="mx-12 flex items-center">Silence your mobile phones</span>
                    <span className="mx-12 text-indigo-500 opacity-50">✦</span>
                    <span className="mx-12 flex items-center"><Activity size={24} className="mr-3 text-purple-400" /> Emergency services are available 24/7</span>
                    <span className="mx-12 text-indigo-500 opacity-50">✦</span>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                    min-width: 200%;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 0px; /* Hide scrollbar for clean TV look */
                    background: transparent;
                }
            `}} />
        </div>
    );
};

export default ReceptionTvDisplay;

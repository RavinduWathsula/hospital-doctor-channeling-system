import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MonitorPlay, Users, Volume2, Clock, CalendarDays, Maximize2 } from 'lucide-react';

const TvDisplay = () => {
    const { token } = useContext(AuthContext);
    const [queues, setQueues] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        fetchQueues();
        const interval = setInterval(fetchQueues, 10000); // Refresh every 10 seconds
        const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);

        return () => {
            clearInterval(interval);
            clearInterval(clockInterval);
        };
    }, []);

    const fetchQueues = async () => {
        try {
            const res = await fetch('/api/queues', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setQueues(data.data);
            }
        } catch (error) {
            console.error("Error fetching queues", error);
        }
    };

    // Calculate currently calling (IN_CONSULTATION)
    const callingPatients = queues.flatMap(q => 
        q.waitingPatients
            .filter(p => p.status === 'IN_CONSULTATION' || p.status === 'CALLED')
            .map(p => ({ ...p, doctorName: `Dr. ${q.doctor.firstName} ${q.doctor.lastName}`, room: q.doctor.room || 'Consultation Room' }))
    );

    // Enter full screen
    const handleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0F19] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0B0F19] to-[#0B0F19] text-white p-6 md:p-8 font-sans overflow-hidden flex flex-col">
            {/* Header */}
            <header className="flex justify-between items-center mb-8 pb-6 border-b border-white/10 relative shrink-0">
                <div className="absolute inset-x-0 -bottom-[1px] h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30 backdrop-blur-sm">
                        <MonitorPlay size={36} className="text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Queue Display
                        </h1>
                        <p className="text-blue-400/80 font-medium text-sm mt-1 tracking-wider uppercase">Live Patient Status</p>
                    </div>
                </div>
                <div className="flex items-center gap-8">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center text-3xl font-bold font-mono tracking-wider text-white shadow-sm">
                            <Clock size={24} className="mr-3 text-blue-500 opacity-80" />
                            {currentTime.toLocaleTimeString([], { hour12: true, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
                        </div>
                        <div className="flex items-center text-slate-400 font-medium mt-1">
                            <CalendarDays size={16} className="mr-2 opacity-70" />
                            {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                    <button 
                        onClick={handleFullScreen} 
                        className="p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-xl border border-white/10 text-slate-300 hover:text-white"
                        title="Toggle Fullscreen"
                    >
                        <Maximize2 size={24} />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
                {/* Now Calling Section - Large */}
                <div className="lg:col-span-5 flex flex-col h-full">
                    <div className="flex items-center mb-6 shrink-0">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/20 mr-4 relative">
                            <div className="w-3 h-3 rounded-full bg-red-500 animate-ping absolute"></div>
                            <div className="w-3 h-3 rounded-full bg-red-500 relative"></div>
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-wide">Now Calling</h2>
                    </div>
                    
                    <div className="flex-1 min-h-0 bg-gradient-to-br from-blue-900/40 to-indigo-900/20 rounded-3xl p-8 border border-blue-500/30 backdrop-blur-md relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 text-blue-500/10 pointer-events-none">
                            <Volume2 size={300} />
                        </div>
                        
                        <div className="relative z-10 flex-1 flex flex-col min-h-0">
                            {callingPatients.length > 0 ? (
                                <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar h-full">
                                    {callingPatients.map((p, idx) => (
                                        <div key={idx} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] transform transition-all hover:scale-[1.02] relative overflow-hidden group">
                                            <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-blue-400 to-indigo-600"></div>
                                            
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <p className="text-sm font-semibold text-blue-300 uppercase tracking-widest mb-1">Token Number</p>
                                                    <p className="text-7xl font-black text-white tracking-tighter drop-shadow-lg">{String(p.queue_number).padStart(3, '0')}</p>
                                                </div>
                                                <div className="h-16 w-16 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-400/30">
                                                    <Volume2 size={28} className="text-blue-400 group-hover:animate-pulse" />
                                                </div>
                                            </div>
                                            
                                            <div className="bg-black/30 rounded-xl p-5 border border-white/5">
                                                <p className="font-bold text-2xl text-slate-100 mb-1">{p.doctorName}</p>
                                                <div className="flex items-center text-blue-300 font-medium text-lg">
                                                    <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
                                                    Proceed to {p.room}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-60">
                                    <div className="w-32 h-32 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                                        <MonitorPlay size={64} className="text-blue-400/50" />
                                    </div>
                                    <p className="text-3xl text-slate-300 font-light tracking-wide">Waiting for next patient</p>
                                    <div className="flex gap-2 mt-4">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Waiting Queue Section */}
                <div className="lg:col-span-7 flex flex-col h-full">
                    <div className="flex items-center mb-6 shrink-0">
                        <Users className="text-slate-400 mr-4" size={32} /> 
                        <h2 className="text-3xl font-bold text-slate-200 tracking-wide">Waiting List</h2>
                    </div>
                    
                    <div className="flex-1 min-h-0 bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl overflow-hidden flex flex-col">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-4 custom-scrollbar h-full content-start">
                            {queues.map(q => {
                                const waiting = q.waitingPatients.filter(p => p.status === 'WAITING' || p.status === 'PENDING');
                                if (waiting.length === 0) return null;
                                
                                return (
                                    <div key={q.doctor.id} className="bg-black/20 rounded-2xl p-6 border border-white/5 transition-all hover:bg-black/30">
                                        <div className="flex justify-between items-center mb-5 pb-4 border-b border-white/10">
                                            <div>
                                                <h3 className="font-bold text-xl text-slate-100">Dr. {q.doctor.firstName} {q.doctor.lastName}</h3>
                                                <p className="text-sm text-slate-400 mt-1">{q.doctor.specialization || 'Consultant'}</p>
                                            </div>
                                            <div className="bg-indigo-500/20 text-indigo-300 px-4 py-1.5 rounded-full text-sm font-semibold border border-indigo-500/30 flex items-center shadow-inner">
                                                <span className="w-2 h-2 rounded-full bg-indigo-400 mr-2"></span>
                                                {waiting.length} Waiting
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-3">
                                            {waiting.slice(0, 8).map((p, idx) => (
                                                <div key={idx} className="bg-slate-800/80 border border-slate-600/50 px-4 py-3 rounded-xl text-center min-w-[80px] shadow-sm">
                                                    <p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">Token</p>
                                                    <p className="text-2xl font-bold text-white">{String(p.queue_number).padStart(3, '0')}</p>
                                                </div>
                                            ))}
                                            {waiting.length > 8 && (
                                                <div className="bg-blue-900/30 border border-blue-500/30 px-4 py-3 rounded-xl flex items-center justify-center min-w-[80px]">
                                                    <p className="text-xl font-bold text-blue-300">+{waiting.length - 8}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {queues.every(q => q.waitingPatients.filter(p => p.status === 'WAITING' || p.status === 'PENDING').length === 0) && (
                                <div className="col-span-1 md:col-span-2 h-full min-h-[300px] flex flex-col items-center justify-center text-slate-500">
                                    <Users size={64} className="mb-4 opacity-20" />
                                    <p className="text-xl font-medium tracking-wide">No patients currently waiting</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Styles for custom scrollbar */}
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}} />
        </div>
    );
};

export default TvDisplay;

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MonitorPlay, Users, Volume2 } from 'lucide-react';

const TvDisplay = () => {
    const { token } = useContext(AuthContext);
    const [queues, setQueues] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());

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
            const res = await fetch('http://localhost:5000/api/queues', {
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
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }
    };

    return (
        <div className="bg-slate-900 min-h-screen text-white p-6 font-sans">
            <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
                <div className="flex items-center">
                    <MonitorPlay size={40} className="text-blue-500 mr-4" />
                    <h1 className="text-4xl font-bold tracking-wider">Live Token Display</h1>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-mono text-blue-400">{currentTime.toLocaleTimeString()}</p>
                    <p className="text-slate-400">{currentTime.toLocaleDateString()}</p>
                </div>
            </div>

            <button onClick={handleFullScreen} className="absolute top-6 right-64 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm border border-slate-600">
                Fullscreen
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Now Calling Section - Large */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-blue-600 rounded-3xl p-6 shadow-lg border border-blue-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <Volume2 size={100} />
                        </div>
                        <h2 className="text-2xl font-bold text-blue-100 mb-6 uppercase tracking-widest flex items-center">
                            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse mr-3"></span>
                            Now Calling
                        </h2>
                        
                        {callingPatients.length > 0 ? (
                            <div className="space-y-4">
                                {callingPatients.map((p, idx) => (
                                    <div key={idx} className="bg-white text-slate-900 rounded-2xl p-6 shadow-2xl transform transition-transform hover:scale-105">
                                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Token Number</p>
                                        <p className="text-7xl font-black text-blue-600 mb-4">{String(p.queue_number).padStart(3, '0')}</p>
                                        <div className="border-t border-slate-200 pt-4">
                                            <p className="font-bold text-xl">{p.doctorName}</p>
                                            <p className="text-slate-500 font-medium">Please proceed to {p.room}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-blue-700/50 rounded-2xl p-8 text-center border border-blue-500/50">
                                <p className="text-blue-200 text-xl font-medium">Waiting for next patient...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Waiting Queue Section */}
                <div className="lg:col-span-2 bg-slate-800 rounded-3xl p-6 shadow-lg border border-slate-700">
                    <h2 className="text-2xl font-bold text-slate-300 mb-6 flex items-center">
                        <Users className="mr-3" /> Waiting List
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {queues.map(q => {
                            const waiting = q.waitingPatients.filter(p => p.status === 'WAITING' || p.status === 'PENDING');
                            if (waiting.length === 0) return null;
                            
                            return (
                                <div key={q.doctor.id} className="bg-slate-900/50 rounded-2xl p-5 border border-slate-700">
                                    <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3">
                                        <h3 className="font-bold text-xl text-slate-200">Dr. {q.doctor.firstName} {q.doctor.lastName}</h3>
                                        <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm font-medium">
                                            {waiting.length} waiting
                                        </span>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-3">
                                        {waiting.slice(0, 8).map((p, idx) => (
                                            <div key={idx} className="bg-slate-800 border border-slate-600 px-4 py-3 rounded-xl text-center min-w-[80px]">
                                                <p className="text-xs text-slate-400 mb-1">Token</p>
                                                <p className="text-2xl font-bold text-white">{String(p.queue_number).padStart(3, '0')}</p>
                                            </div>
                                        ))}
                                        {waiting.length > 8 && (
                                            <div className="bg-slate-800 border border-slate-600 px-4 py-3 rounded-xl flex items-center justify-center min-w-[80px]">
                                                <p className="text-lg font-bold text-slate-400">+{waiting.length - 8}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {queues.every(q => q.waitingPatients.filter(p => p.status === 'WAITING' || p.status === 'PENDING').length === 0) && (
                        <div className="h-64 flex items-center justify-center text-slate-500 text-xl font-medium">
                            No patients currently waiting.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TvDisplay;

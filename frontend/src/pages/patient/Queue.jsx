import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Clock, Users, Activity, CheckCircle, RotateCcw, CalendarPlus, Sparkles, Coffee } from 'lucide-react';
import { Link } from 'react-router-dom';

const Queue = () => {
    const { token } = useContext(AuthContext);
    
    const [queueData, setQueueData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const fetchQueue = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/queues/patient', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data) {
                setQueueData(data.data);
            }
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Failed to fetch queue');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 60000); // Auto refresh every minute
        return () => clearInterval(interval);
    }, [token]);

    if (isLoading && !queueData) {
        return (
            <div className="flex justify-center items-center h-[500px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!queueData) {
        return (
            <div className="max-w-4xl mx-auto mt-8 relative group perspective-1000">
                <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/50 rounded-[2.5rem] p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 backdrop-blur-2xl transition-all duration-700 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]">
                    {/* Animated Background Blobs */}
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                    <div className="absolute top-1/2 -right-24 w-80 h-80 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        {/* Icon Container */}
                        <div className="relative mb-10 mt-4">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition duration-700 animate-pulse" style={{ animationDuration: '4s' }}></div>
                            <div className="w-32 h-32 bg-white/90 backdrop-blur-xl rounded-full flex items-center justify-center text-blue-600 shadow-2xl border border-white/60 relative transform transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-3">
                                <Coffee size={56} className="animate-bounce" style={{ animationDuration: '3s' }} />
                                <div className="absolute -top-2 -right-2 bg-gradient-to-br from-amber-200 to-yellow-400 text-yellow-900 p-2.5 rounded-full shadow-lg transform rotate-12 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
                                    <Sparkles size={22} className="animate-spin-slow" />
                                </div>
                            </div>
                        </div>
                        
                        <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 via-indigo-700 to-blue-800 mb-5 tracking-tight pb-1 bg-300% animate-gradient">
                            You're All Caught Up!
                        </h2>
                        
                        <p className="text-lg text-gray-500 mb-10 max-w-lg mx-auto leading-relaxed font-medium">
                            There are no active queues for you right now. Take a moment to relax, grab a coffee, or schedule your next visit when you're ready.
                        </p>
                        
                        <Link 
                            to="/patient/booking" 
                            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 hover:from-blue-500 to-indigo-600 hover:to-indigo-500 text-white rounded-2xl font-semibold shadow-[0_8px_20px_rgb(79,70,229,0.3)] hover:shadow-[0_15px_30px_rgb(79,70,229,0.4)] transform hover:-translate-y-1 transition-all duration-300"
                        >
                            <CalendarPlus size={22} className="mr-3" />
                            Book New Appointment
                        </Link>
                    </div>
                </div>
                
                {/* Embedded CSS for animations */}
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes blob {
                        0% { transform: translate(0px, 0px) scale(1); }
                        33% { transform: translate(40px, -60px) scale(1.1); }
                        66% { transform: translate(-30px, 30px) scale(0.9); }
                        100% { transform: translate(0px, 0px) scale(1); }
                    }
                    @keyframes gradient {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                    .animate-blob {
                        animation: blob 8s infinite cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    .animation-delay-2000 {
                        animation-delay: 2s;
                    }
                    .animation-delay-4000 {
                        animation-delay: 4s;
                    }
                    .animate-gradient {
                        background-size: 200% auto;
                        animation: gradient 4s linear infinite;
                    }
                    .animate-spin-slow {
                        animation: spin 6s linear infinite;
                    }
                `}} />
            </div>
        );
    }

    const { 
        my_queue_number, 
        current_queue, 
        patients_ahead, 
        estimated_waiting_time, 
        doctor_name, 
        appointment_status 
    } = queueData;

    // Calculate progress percentage for visual ring
    const totalQueueRange = Math.max(1, my_queue_number);
    const progress = current_queue > 0 ? Math.min(100, (current_queue / totalQueueRange) * 100) : 0;
    const dashArray = `${progress} 100`;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Live Queue Tracking</h1>
                    <p className="text-gray-500 mt-1">Real-time status for your consultation with {doctor_name}.</p>
                </div>
                <button 
                    onClick={fetchQueue}
                    disabled={isLoading}
                    className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-colors"
                >
                    <RotateCcw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* Visual Tracker */}
                    <div className="flex flex-col items-center justify-center">
                        <div className="relative w-64 h-64 flex items-center justify-center">
                            {/* SVG Progress Ring */}
                            <svg viewBox="0 0 36 36" className="absolute w-full h-full transform -rotate-90">
                                <path
                                    className="text-gray-100"
                                    strokeWidth="3"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className="text-blue-600 transition-all duration-1000 ease-out"
                                    strokeDasharray={dashArray}
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            
                            <div className="text-center absolute z-10 flex flex-col items-center justify-center">
                                <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Your Turn</span>
                                {appointment_status === 'CALLED' ? (
                                    <div className="text-blue-600 flex flex-col items-center animate-pulse">
                                        <CheckCircle size={40} className="mb-2" />
                                        <span className="font-bold">PLEASE ENTER</span>
                                    </div>
                                ) : appointment_status === 'IN_CONSULTATION' ? (
                                    <div className="text-green-600 flex flex-col items-center">
                                        <Activity size={40} className="mb-2" />
                                        <span className="font-bold">IN PROGRESS</span>
                                    </div>
                                ) : (
                                    <span className="text-6xl font-black text-gray-900">{my_queue_number}</span>
                                )}
                            </div>
                        </div>
                        
                        <div className="mt-8 px-6 py-3 bg-blue-50 text-blue-800 rounded-full text-sm font-bold flex items-center shadow-sm">
                            <Activity size={16} className="mr-2 animate-pulse" />
                            Current Queue Serving: {current_queue || 0}
                        </div>
                    </div>

                    {/* Stats details */}
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <div className="flex items-center text-gray-500 mb-2">
                                <Users size={18} className="mr-2 text-indigo-500" />
                                <span className="font-semibold">Patients Ahead of You</span>
                            </div>
                            <div className="text-4xl font-bold text-gray-900">
                                {patients_ahead} <span className="text-lg font-medium text-gray-500 ml-1">people</span>
                            </div>
                        </div>

                        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                            <div className="flex items-center text-gray-500 mb-2">
                                <Clock size={18} className="mr-2 text-orange-500" />
                                <span className="font-semibold text-orange-800">Estimated Waiting Time</span>
                            </div>
                            <div className="text-4xl font-bold text-orange-600">
                                {estimated_waiting_time} <span className="text-lg font-medium text-orange-400 ml-1">minutes</span>
                            </div>
                        </div>
                        
                        <div className="text-xs text-gray-400 text-center flex justify-between px-2">
                            <span>Status: <span className="font-semibold text-gray-600">{appointment_status}</span></span>
                            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Queue;

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Clock, Users, Activity, CheckCircle, RotateCcw } from 'lucide-react';

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
            <div className="max-w-4xl mx-auto mt-8">
                <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-6">
                        <Clock size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No Active Queue</h2>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">You don't have any appointments scheduled for today, or your appointment has already concluded.</p>
                </div>
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
                                {appointment_status === 'CHECKED_IN' || appointment_status === 'IN_CONSULTATION' ? (
                                    <div className="text-blue-600 flex flex-col items-center">
                                        <CheckCircle size={40} className="mb-2" />
                                        <span className="font-bold">IT'S TIME</span>
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

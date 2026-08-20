import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Users, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

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
            const res = await fetch('http://localhost:5000/api/queues', {
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

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Activity className="mr-3 text-indigo-600" size={28} />
                    Live Hospital Queue
                </h1>
                <p className="text-gray-500 mt-1">Real-time overview of all doctor queues across the hospital.</p>
            </div>

            {loading && queues.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ) : queues.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium text-lg">No active queues right now.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {queues.map((doctorQueue) => (
                        <div key={doctorQueue.doctorId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                            {/* Doctor Header */}
                            <div className="bg-indigo-600 text-white p-4">
                                <h2 className="font-bold text-lg text-indigo-50">Dr. {doctorQueue.doctorName}</h2>
                                <p className="text-indigo-200 text-sm font-medium">{doctorQueue.specialization}</p>
                            </div>

                            <div className="p-0 flex-1 flex flex-col">
                                {/* Current Patient */}
                                <div className="p-4 border-b border-gray-100 bg-indigo-50/30">
                                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">Currently Seeing</p>
                                    {doctorQueue.currentPatient ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm border border-indigo-200">
                                                #{doctorQueue.currentPatient.queue_number}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{doctorQueue.currentPatient.first_name} {doctorQueue.currentPatient.last_name}</p>
                                                <p className="text-xs text-gray-500">{doctorQueue.currentPatient.appointment_time}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic text-sm">No active consultation</p>
                                    )}
                                </div>

                                {/* Waiting List */}
                                <div className="p-4 flex-1">
                                    <div className="flex justify-between items-center mb-3">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Waiting Room</p>
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-bold">
                                            {doctorQueue.waitingPatients?.length || 0}
                                        </span>
                                    </div>
                                    
                                    {doctorQueue.waitingPatients && doctorQueue.waitingPatients.length > 0 ? (
                                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                            {doctorQueue.waitingPatients.map(p => (
                                                <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-bold text-gray-400 w-6">#{p.queue_number}</span>
                                                        <span className="font-medium text-gray-700 text-sm">{p.first_name} {p.last_name}</span>
                                                    </div>
                                                    <span className="text-xs text-gray-400">{p.appointment_time}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 text-sm text-center py-4">Waiting room is empty.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReceptionQueue;

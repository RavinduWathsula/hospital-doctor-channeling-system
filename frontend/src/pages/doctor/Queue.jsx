import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Users, UserPlus, Play, CheckCircle, Phone, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import StateWrapper from '../../components/ui/StateWrapper';

const DoctorQueue = () => {
    const { token } = useContext(AuthContext);
    const [queueData, setQueueData] = useState({
        currentPatient: null,
        nextPatient: null,
        waitingPatients: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQueue();
    }, []);

    const fetchQueue = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:5000/api/queues/doctor', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data) {
                setQueueData(data.data);
            }
        } catch (error) {
            toast.error('Error fetching queue');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            const res = await fetch(`http://localhost:5000/api/appointments/${id}/status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Patient consultation ${status === 'IN_PROGRESS' ? 'started' : 'completed'}`);
                fetchQueue();
            } else {
                toast.error(data.message || 'Error updating status');
            }
        } catch (error) {
            toast.error('Error connecting to server');
        }
    };

    if (loading && !queueData.currentPatient && !queueData.nextPatient && (!queueData.waitingPatients || queueData.waitingPatients.length === 0)) {
        return <StateWrapper loading={true} />;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Users className="mr-3 text-teal-600" size={28} />
                    Live Queue Management
                </h1>
                <p className="text-gray-500 mt-1">Real-time view of your consulting queue.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Consultation */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -mr-16 -mt-16 z-0"></div>
                        <div className="relative z-10">
                            <h2 className="text-sm font-bold text-teal-600 uppercase tracking-wider mb-4">Current Consultation</h2>
                            
                            {queueData.currentPatient ? (
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-emerald-500 text-white rounded-2xl flex flex-col items-center justify-center shadow-lg transform rotate-3">
                                        <span className="text-xs font-semibold opacity-80 uppercase tracking-widest">Q-No</span>
                                        <span className="text-3xl font-black">{queueData.currentPatient.queue_number}</span>
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-2xl font-bold text-gray-800">{queueData.currentPatient.first_name} {queueData.currentPatient.last_name}</h3>
                                        <p className="text-gray-500 mt-1 flex items-center justify-center md:justify-start">
                                            <Phone size={14} className="mr-2" /> 
                                            {queueData.currentPatient.phone || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="flex gap-3 w-full md:w-auto">
                                        {queueData.currentPatient.status === 'CALLED' ? (
                                            <button 
                                                onClick={() => handleStatusUpdate(queueData.currentPatient.id, 'IN_CONSULTATION')}
                                                className="flex-1 md:flex-none flex items-center justify-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
                                            >
                                                <Play className="mr-2" size={20} /> Start
                                            </button>
                                        ) : (
                                            <>
                                                <button 
                                                    onClick={() => handleStatusUpdate(queueData.currentPatient.id, 'COMPLETED')}
                                                    className="flex-1 md:flex-none flex items-center justify-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
                                                >
                                                    <CheckCircle className="mr-2" size={20} /> Complete
                                                </button>
                                                <button 
                                                    onClick={() => handleStatusUpdate(queueData.currentPatient.id, 'NO_SHOW')}
                                                    className="flex-1 md:flex-none flex items-center justify-center px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
                                                >
                                                    No Show
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-teal-50/50 rounded-xl border border-dashed border-teal-200">
                                    <UserPlus className="mx-auto text-teal-300 mb-3" size={48} />
                                    <h3 className="text-lg font-semibold text-gray-700">No Active Consultation</h3>
                                    <p className="text-gray-500 mt-1">Ready for the next patient.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Next Up */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                            <ArrowRight className="mr-2" size={16} /> Next in Line
                        </h2>
                        {queueData.nextPatient ? (
                            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-orange-100 text-orange-700 rounded-lg flex items-center justify-center font-bold text-lg">
                                        #{queueData.nextPatient.queue_number}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{queueData.nextPatient.first_name} {queueData.nextPatient.last_name}</h3>
                                        <p className="text-sm text-gray-500">Scheduled: {queueData.nextPatient.appointment_time}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleStatusUpdate(queueData.nextPatient.id, 'CALLED')}
                                    disabled={!!queueData.currentPatient}
                                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors shadow-sm flex items-center"
                                >
                                    <Phone className="mr-2" size={18} /> Call Next
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                No upcoming patients in the queue.
                            </div>
                        )}
                    </div>
                </div>

                {/* Waiting List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800">Waiting Room</h2>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                            {queueData.waitingPatients?.length || 0} Waiting
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {queueData.waitingPatients && queueData.waitingPatients.length > 0 ? (
                            <div className="space-y-2">
                                {queueData.waitingPatients.map(patient => (
                                    <div key={patient.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 rounded-xl transition-colors">
                                        <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center font-bold text-sm border border-gray-200">
                                            {patient.queue_number}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-800 truncate">{patient.first_name} {patient.last_name}</p>
                                            <p className="text-xs text-gray-500">{patient.appointment_time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <Users size={32} className="text-gray-300 mb-2" />
                                <p>Queue is empty</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorQueue;

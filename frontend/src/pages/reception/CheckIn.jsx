import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Search, CheckCircle, ShieldAlert, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const ReceptionCheckIn = () => {
    const { token } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(false);

    // Using the search input to look through appointments and finding a matching confirmed/pending one today
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm) return;

        try {
            setLoading(true);
            setAppointment(null);
            
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
                setAppointment(null);
                setSearchTerm('');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Error checking in');
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 mt-10">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full mb-4">
                    <UserCheck size={40} />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Patient Check-In</h1>
                <p className="text-gray-500 mt-2">Verify arrival to add patients to the active doctor queue.</p>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                <form onSubmit={handleSearch} className="flex gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                        <input 
                            type="text" 
                            placeholder="Enter Queue No, Appt ID, or Name..." 
                            className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-lg transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-md disabled:bg-indigo-400"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </form>

                {appointment && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 animate-in slide-in-from-bottom-4">
                        <h2 className="text-sm font-bold text-indigo-800 uppercase tracking-wider mb-4">Appointment Verified</h2>
                        
                        <div className="grid grid-cols-2 gap-y-4 mb-8">
                            <div>
                                <p className="text-gray-500 text-sm">Patient Name</p>
                                <p className="font-bold text-gray-800 text-lg">{appointment.patient_first_name} {appointment.patient_last_name}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Doctor</p>
                                <p className="font-bold text-gray-800 text-lg">Dr. {appointment.doctor_first_name} {appointment.doctor_last_name}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Time</p>
                                <p className="font-bold text-gray-800 text-lg">{appointment.appointment_time}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Queue Number</p>
                                <div className="inline-block px-3 py-1 bg-indigo-600 text-white font-bold rounded-lg mt-1">
                                    #{appointment.queue_number}
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleCheckIn}
                            className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-lg transition-all shadow-md flex items-center justify-center"
                        >
                            <CheckCircle className="mr-2" size={24} /> Confirm Check-In
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReceptionCheckIn;

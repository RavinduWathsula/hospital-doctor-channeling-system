import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Search, Eye, Phone, PlayCircle, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorAppointments = () => {
    const { token } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:5000/api/appointments/doctor-appointments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setAppointments(data.data);
            } else {
                toast.error(data.message || 'Failed to fetch appointments');
            }
        } catch (error) {
            toast.error('Server error fetching appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
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
                toast.success(`Appointment marked as ${status}`);
                fetchAppointments(); // Refresh list
            } else {
                toast.error(data.message || 'Failed to update status');
            }
        } catch (error) {
            toast.error('Error updating appointment');
        }
    };

    const handleCall = (patientName) => {
        // Placeholder for future calling feature
        toast.success(`Calling ${patientName}...`);
    };

    const filteredAppointments = appointments.filter(app => 
        (app.patient_first_name + ' ' + app.patient_last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.queue_number?.toString().includes(searchTerm)
    );

    const getStatusBadge = (status) => {
        const styles = {
            'SCHEDULED': 'bg-blue-100 text-blue-800',
            'IN_PROGRESS': 'bg-orange-100 text-orange-800',
            'COMPLETED': 'bg-green-100 text-green-800',
            'NO_SHOW': 'bg-red-100 text-red-800',
            'CANCELLED': 'bg-gray-100 text-gray-800'
        };
        return <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${styles[status] || styles['SCHEDULED']}`}>{status}</span>;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your consultations and patient statuses.</p>
                </div>
                
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name or Q-No..." 
                        className="pl-10 pr-4 py-2 w-full md:w-64 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-semibold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Q.No</th>
                                <th className="px-6 py-4">Patient</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                                    </td>
                                </tr>
                            ) : filteredAppointments.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No appointments found.
                                    </td>
                                </tr>
                            ) : (
                                filteredAppointments.map((app) => (
                                    <tr key={app.id} className="hover:bg-teal-50/30 transition-colors">
                                        <td className="px-6 py-4 font-bold text-teal-700">
                                            #{app.queue_number || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-800">
                                                {app.patient_first_name} {app.patient_last_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-800 font-medium">{new Date(app.appointment_date).toLocaleDateString()}</div>
                                            <div className="text-gray-500 text-xs">{app.appointment_time}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(app.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button title="View Details" className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                                    <Eye size={18} />
                                                </button>
                                                
                                                {app.status === 'SCHEDULED' && (
                                                    <>
                                                        <button 
                                                            title="Call Patient" 
                                                            onClick={() => handleCall(`${app.patient_first_name} ${app.patient_last_name}`)}
                                                            className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                                                        >
                                                            <Phone size={18} />
                                                        </button>
                                                        <button 
                                                            title="Start Consultation" 
                                                            onClick={() => handleUpdateStatus(app.id, 'IN_PROGRESS')}
                                                            className="p-2 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                                                        >
                                                            <PlayCircle size={18} />
                                                        </button>
                                                    </>
                                                )}

                                                {app.status === 'IN_PROGRESS' && (
                                                    <button 
                                                        title="Complete Consultation" 
                                                        onClick={() => handleUpdateStatus(app.id, 'COMPLETED')}
                                                        className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}

                                                {(app.status === 'SCHEDULED' || app.status === 'IN_PROGRESS') && (
                                                    <button 
                                                        title="Mark No Show" 
                                                        onClick={() => handleUpdateStatus(app.id, 'NO_SHOW')}
                                                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DoctorAppointments;

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Search, Edit, Eye, ShieldCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ReceptionAppointments = () => {
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
            const res = await fetch('http://localhost:5000/api/appointments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setAppointments(data.data);
            }
        } catch (error) {
            toast.error('Error fetching appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        if (!window.confirm(`Are you sure you want to mark this as ${status}?`)) return;
        
        try {
            const res = await fetch(`http://localhost:5000/api/appointments/${id}/admin-status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                fetchAppointments();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Server error');
        }
    };

    const filtered = appointments.filter(a => 
        (a.patient_first_name + ' ' + a.patient_last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.doctor_first_name + ' ' + a.doctor_last_name).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getBadge = (status) => {
        const styles = {
            'PENDING': 'bg-yellow-100 text-yellow-800',
            'CONFIRMED': 'bg-blue-100 text-blue-800',
            'CHECKED_IN': 'bg-indigo-100 text-indigo-800',
            'IN_PROGRESS': 'bg-orange-100 text-orange-800',
            'COMPLETED': 'bg-green-100 text-green-800',
            'CANCELLED': 'bg-gray-100 text-gray-800',
            'NO_SHOW': 'bg-red-100 text-red-800'
        };
        return <span className={`px-2 py-1 rounded text-xs font-bold shadow-sm ${styles[status]}`}>{status}</span>;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">All Appointments</h1>
                    <p className="text-gray-500 text-sm mt-1">View and manage hospital bookings.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search patient or doctor..." 
                        className="pl-10 pr-4 py-2 w-full md:w-72 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-indigo-50 text-indigo-900 uppercase font-semibold border-b border-indigo-100">
                            <tr>
                                <th className="px-6 py-4">ID / Q.No</th>
                                <th className="px-6 py-4">Patient</th>
                                <th className="px-6 py-4">Doctor</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center">Loading...</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No appointments found.</td>
                                </tr>
                            ) : (
                                filtered.map(app => (
                                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-gray-500">
                                            {app.id} / <span className="font-bold text-gray-800">#{app.queue_number}</span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-800">
                                            {app.patient_first_name} {app.patient_last_name}
                                        </td>
                                        <td className="px-6 py-4">Dr. {app.doctor_first_name} {app.doctor_last_name}</td>
                                        <td className="px-6 py-4">
                                            <div>{new Date(app.appointment_date).toLocaleDateString()}</div>
                                            <div className="text-xs text-gray-500">{app.appointment_time}</div>
                                        </td>
                                        <td className="px-6 py-4">{getBadge(app.status)}</td>
                                        <td className="px-6 py-4 text-right flex justify-end space-x-2">
                                            <button className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded" title="View">
                                                <Eye size={18} />
                                            </button>
                                            
                                            {app.status === 'PENDING' && (
                                                <button onClick={() => handleStatusUpdate(app.id, 'CONFIRMED')} className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded" title="Confirm">
                                                    <ShieldCheck size={18} />
                                                </button>
                                            )}
                                            
                                            {(app.status === 'PENDING' || app.status === 'CONFIRMED') && (
                                                <button onClick={() => handleStatusUpdate(app.id, 'CANCELLED')} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded" title="Cancel">
                                                    <X size={18} />
                                                </button>
                                            )}
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

export default ReceptionAppointments;

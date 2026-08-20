import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, XCircle, Search, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import StateWrapper from '../../components/ui/StateWrapper';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const Appointments = () => {
    const { token } = useContext(AuthContext);
    
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, completed, cancelled
    const [searchQuery, setSearchQuery] = useState('');
    
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null });

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/appointments/my-appointments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setAppointments(data.data);
            }
        } catch (error) {
            toast.error('Failed to load appointments');
        } finally {
            setIsLoading(false);
        }
    };

    const requestCancel = (id) => {
        setConfirmDialog({ isOpen: true, id });
    };

    const handleCancel = async () => {
        const id = confirmDialog.id;
        if (!id) return;

        try {
            const res = await fetch(`http://localhost:5000/api/appointments/${id}/cancel`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Appointment cancelled successfully');
                fetchAppointments();
            } else {
                toast.error(data.message || 'Failed to cancel appointment');
            }
        } catch (error) {
            toast.error('Network error. Try again.');
        }
    };

    const filteredAppointments = appointments.filter(apt => {
        // Tab filtering
        if (activeTab === 'upcoming' && !['PENDING', 'CONFIRMED', 'CHECKED_IN'].includes(apt.status)) return false;
        if (activeTab === 'completed' && apt.status !== 'COMPLETED') return false;
        if (activeTab === 'cancelled' && !['CANCELLED', 'NO_SHOW'].includes(apt.status)) return false;

        // Search filtering
        if (searchQuery) {
            const doctorName = `${apt.doctor_first_name} ${apt.doctor_last_name}`.toLowerCase();
            const deptName = apt.department_name.toLowerCase();
            const query = searchQuery.toLowerCase();
            return doctorName.includes(query) || deptName.includes(query) || `apt-${apt.id}`.includes(query);
        }

        return true;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
                    <p className="text-gray-500 mt-1">View and manage your consultation bookings.</p>
                </div>
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Search doctor or dept..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 w-full md:w-64 outline-none"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    <button 
                        onClick={() => setActiveTab('upcoming')}
                        className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === 'upcoming' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                        Upcoming
                    </button>
                    <button 
                        onClick={() => setActiveTab('completed')}
                        className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === 'completed' ? 'text-green-600 border-b-2 border-green-600 bg-green-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                        Completed
                    </button>
                    <button 
                        onClick={() => setActiveTab('cancelled')}
                        className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === 'cancelled' ? 'text-red-600 border-b-2 border-red-600 bg-red-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                        Cancelled
                    </button>
                </div>

                {/* List */}
                <div className="p-0">
                    <StateWrapper 
                        loading={isLoading} 
                        empty={filteredAppointments.length === 0 && !isLoading}
                        emptyMessage={`No ${activeTab} appointments`}
                    >
                        <div className="divide-y divide-gray-100">
                            {filteredAppointments.map(apt => (
                                <div key={apt.id} className="p-6 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0">
                                            {new Date(apt.appointment_date).getDate()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-gray-900 text-lg">Dr. {apt.doctor_first_name} {apt.doctor_last_name}</h3>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                    apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    apt.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                                                    apt.status === 'CHECKED_IN' ? 'bg-purple-100 text-purple-800' :
                                                    apt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {apt.status}
                                                </span>
                                            </div>
                                            <p className="text-gray-500 text-sm mb-3">{apt.department_name} • Appointment No: APT-{String(apt.id).padStart(6, '0')}</p>
                                            
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                <span className="flex items-center"><Calendar size={14} className="mr-1.5 opacity-70" /> {new Date(apt.appointment_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short' })}</span>
                                                <span className="flex items-center"><Clock size={14} className="mr-1.5 opacity-70" /> {apt.appointment_time}</span>
                                                <span className="flex items-center"><MapPin size={14} className="mr-1.5 opacity-70" /> Room {apt.doctor_id}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-row md:flex-col gap-2 shrink-0 md:items-end">
                                        <Link to={`/confirmation/${apt.id}`} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl flex items-center justify-center transition-colors text-sm flex-1 md:flex-none">
                                            <Eye size={16} className="mr-1.5" /> View Ticket
                                        </Link>
                                        
                                        {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                                            <button 
                                                onClick={() => requestCancel(apt.id)}
                                                className="px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-xl flex items-center justify-center transition-colors text-sm flex-1 md:flex-none"
                                            >
                                                <XCircle size={16} className="mr-1.5" /> Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </StateWrapper>
                </div>
            </div>

            <ConfirmDialog 
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ isOpen: false, id: null })}
                onConfirm={handleCancel}
                title="Cancel Appointment"
                message="Are you sure you want to cancel this appointment? This action cannot be undone."
                confirmText="Yes, Cancel it"
                isDestructive={true}
            />
        </div>
    );
};

export default Appointments;

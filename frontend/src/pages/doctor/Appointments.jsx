import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Search, Eye, Phone, PlayCircle, CheckCircle, XCircle, CalendarClock, User, Hash, Clock, FileText, ChevronRight, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorAppointments = () => {
    const { token } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL'); // Added filter
    const [filterDate, setFilterDate] = useState('ALL'); // Date filter
    const [shiftDates, setShiftDates] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            
            // 1. Fetch Appointments
            const appRes = await fetch('http://localhost:5000/api/appointments/doctor-appointments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const appData = await appRes.json();

            // 2. Fetch Doctor ID & Schedules
            let schedules = [];
            try {
                const docRes = await fetch('http://localhost:5000/api/doctors/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const docData = await docRes.json();
                if (docData.success && docData.data) {
                    const schedRes = await fetch(`http://localhost:5000/api/schedules/doctor/${docData.data.id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const schedData = await schedRes.json();
                    if (schedData.success) {
                        schedules = schedData.data.filter(s => s.status === 'ACTIVE');
                    }
                }
            } catch (err) {
                console.error("Failed to fetch schedules:", err);
            }

            if (appData.success) {
                setAppointments(appData.data);
                
                // 3. Generate Shift Dates (Next 21 Days of active schedule + any days with existing appointments)
                const activeDaysOfWeek = schedules.map(s => s.day_of_week);
                const today = new Date();
                const generatedDates = [];
                
                for(let i = 0; i < 21; i++) {
                    const d = new Date(today);
                    d.setDate(today.getDate() + i);
                    
                    // JS Date.getDay(): 0=Sun, 1=Mon... DB assumes: 1=Mon, ..., 7=Sun
                    const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay(); 
                    const dateStr = d.toISOString().split('T')[0];
                    
                    const hasAppts = appData.data.some(a => a.appointment_date.split('T')[0] === dateStr && a.status !== 'CANCELLED');
                    
                    if (activeDaysOfWeek.includes(dayOfWeek) || hasAppts) {
                        generatedDates.push(dateStr);
                    }
                }
                
                const uniqueDates = [...new Set(generatedDates)].sort();
                setShiftDates(uniqueDates);
                
                // Select the first available shift by default
                if (uniqueDates.length > 0 && filterDate === 'ALL') {
                    setFilterDate(uniqueDates[0]);
                }

            } else {
                toast.error(appData.message || 'Failed to fetch appointments');
            }
        } catch (error) {
            toast.error('Server error fetching data');
        } finally {
            if (!silent) setLoading(false);
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
                fetchAppointments(true); // Refresh list silently
            } else {
                toast.error(data.message || 'Failed to update status');
            }
        } catch (error) {
            toast.error('Error updating appointment');
        }
    };

    const handleCall = async (id) => {
        try {
            await handleUpdateStatus(id, 'CALLED');
        } catch (error) {
            console.error(error);
        }
    };

    // FILTER LOGIC
    // 1. Exclude Cancelled appointments entirely as requested
    const activeAppointments = appointments.filter(app => app.status !== 'CANCELLED');

    // 2. Search filtering
    const searchFiltered = activeAppointments.filter(app => 
        (app.patient_first_name + ' ' + app.patient_last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.queue_number?.toString().includes(searchTerm) ||
        app.id?.toString().includes(searchTerm)
    );

    // 3. Date filtering
    const dateFiltered = searchFiltered.filter(app => {
        if (filterDate === 'ALL') return true;
        return app.appointment_date.split('T')[0] === filterDate;
    });

    // 4. Status filtering
    const filteredAppointments = dateFiltered.filter(app => {
        if (filterStatus === 'ALL') return true;
        if (filterStatus === 'COMPLETED') return app.status === 'COMPLETED';
        return app.status !== 'COMPLETED'; // 'ACTIVE'
    });

    // Generate unique dates for tabs is now handled in state (shiftDates)

    const getStatusBadge = (status) => {
        const styles = {
            'PENDING': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.2)]',
            'CONFIRMED': 'bg-blue-500/10 text-blue-600 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]',
            'CHECKED_IN': 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]',
            'WAITING': 'bg-purple-500/10 text-purple-600 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]',
            'CALLED': 'bg-pink-500/10 text-pink-600 border-pink-500/20 shadow-[0_0_10px_rgba(236,72,153,0.2)] animate-pulse',
            'IN_CONSULTATION': 'bg-orange-500/10 text-orange-600 border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.2)] animate-pulse',
            'COMPLETED': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
            'NO_SHOW': 'bg-red-500/10 text-red-600 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
        };
        return (
            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border backdrop-blur-sm transition-all whitespace-nowrap inline-block text-center ${styles[status] || 'bg-slate-100 text-slate-800'}`}>
                {status.replace('_', ' ')}
            </span>
        );
    };

    return (
        <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-700 zoom-in-95">
            
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-theme-600 to-theme-900 opacity-90 transition-colors duration-500"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-theme-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob transition-colors duration-500"></div>
                
                <div className="relative p-8 z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-inner">
                                <CalendarClock className="text-theme-100" size={24} />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight">Appointments</h1>
                        </div>
                        <p className="text-theme-50 font-medium text-lg ml-0 md:ml-16 opacity-90">
                            Manage consultations, view active patients, and track your schedule.
                        </p>
                    </div>
                    
                    <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-200 group-focus-within:text-white transition-colors" size={20} />
                            <input 
                                type="text" 
                                placeholder="Search Name, Q-No, or Appt ID..." 
                                className="w-full md:w-80 pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 text-white placeholder-theme-100/50 rounded-2xl focus:bg-black/40 focus:ring-2 focus:ring-theme-400 focus:border-transparent outline-none transition-all backdrop-blur-md shadow-inner font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                
                {/* Date Tabs (Scrollable) */}
                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide flex-1">
                    {shiftDates.map(dateStr => {
                        const dateObj = new Date(dateStr);
                        const label = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                        
                        // Count active appointments for this shift
                        const count = activeAppointments.filter(a => a.appointment_date.split('T')[0] === dateStr).length;

                        return (
                            <button 
                                key={dateStr}
                                onClick={() => setFilterDate(dateStr)}
                                className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${filterDate === dateStr ? 'bg-theme-600 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
                            >
                                {label}
                                {count > 0 && (
                                    <span className={`px-2 py-0.5 rounded-md text-xs ${filterDate === dateStr ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Status Filters */}
                <div className="flex space-x-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 shrink-0">
                    <button 
                        onClick={() => setFilterStatus('ALL')}
                        className={`px-5 py-2 rounded-xl font-bold transition-all text-sm ${filterStatus === 'ALL' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                        All Valid
                    </button>
                    <button 
                        onClick={() => setFilterStatus('ACTIVE')}
                        className={`px-5 py-2 rounded-xl font-bold transition-all text-sm ${filterStatus === 'ACTIVE' ? 'bg-theme-500 text-white shadow-lg shadow-theme-500/30' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                        Active / Pending
                    </button>
                    <button 
                        onClick={() => setFilterStatus('COMPLETED')}
                        className={`px-5 py-2 rounded-xl font-bold transition-all text-sm ${filterStatus === 'COMPLETED' ? 'bg-theme-500 text-white shadow-lg shadow-theme-500/30' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                        Completed
                    </button>
                </div>
            </div>

            {/* List View */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 border-4 border-theme-500/30 border-t-theme-500 rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest animate-pulse">Loading Appointments...</p>
                </div>
            ) : filteredAppointments.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <CalendarClock size={48} className="text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">No Appointments Found</h3>
                    <p className="text-slate-500 max-w-sm text-lg">There are no appointments matching your current filters or search criteria. Note: Cancelled appointments are hidden.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredAppointments.map((app) => (
                        <div key={app.id} className="bg-white rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 group hover:-translate-y-1 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
                            {/* Decorative Left Border based on status */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2 ${
                                app.status === 'COMPLETED' ? 'bg-theme-500' : 
                                app.status === 'IN_CONSULTATION' ? 'bg-orange-500' : 
                                'bg-theme-400'
                            }`}></div>

                            <div className="flex flex-col md:flex-row gap-6 w-full lg:w-auto items-start md:items-center flex-1 ml-2">
                                
                                {/* Patient Info & Avatar */}
                                <div className="flex items-center gap-5 w-full md:w-80">
                                    <div className="w-16 h-16 rounded-[1rem] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 shadow-inner shrink-0 group-hover:from-theme-100 group-hover:to-theme-200 group-hover:text-theme-600 transition-colors">
                                        <User size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 tracking-tight mb-1 group-hover:text-theme-700 transition-colors">
                                            {app.patient_first_name} {app.patient_last_name}
                                        </h3>
                                        <div className="flex gap-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Hash size={14} className="text-theme-500"/> APT-{app.id}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Activity size={14} className="text-orange-500"/> Q-{app.queue_number || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-2xl w-full md:w-64 border border-slate-100">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-500 shrink-0">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 mb-0.5">{new Date(app.appointment_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric'})}</p>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{app.appointment_time}</p>
                                    </div>
                                </div>
                                
                                {/* Status Badge */}
                                <div className="mt-2 md:mt-0 lg:ml-auto shrink-0 flex justify-end min-w-[180px]">
                                    {getStatusBadge(app.status)}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="w-full lg:w-auto flex items-center justify-end gap-3 pt-4 lg:pt-0 border-t border-slate-100 lg:border-t-0 pl-2 mt-2 lg:mt-0">
                                <button 
                                    title="View Details" 
                                    onClick={() => setSelectedAppointment(app)}
                                    className="w-12 h-12 flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-white hover:text-slate-800 rounded-2xl transition-all shadow-sm border border-slate-100 hover:border-slate-300 hover:shadow-md"
                                >
                                    <Eye size={20} />
                                </button>
                                
                                {['PENDING', 'CONFIRMED', 'CHECKED_IN', 'WAITING'].includes(app.status) && (
                                    <button 
                                        title="Call Patient" 
                                        onClick={() => handleCall(app.id)}
                                        className="px-5 h-12 flex items-center justify-center text-indigo-700 font-bold bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all shadow-sm border border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/30 gap-2"
                                    >
                                        <Phone size={18} /> Call
                                    </button>
                                )}

                                {app.status === 'CALLED' && (
                                    <button 
                                        title="Start Consultation" 
                                        onClick={() => handleUpdateStatus(app.id, 'IN_CONSULTATION')}
                                        className="px-5 h-12 flex items-center justify-center text-orange-700 font-bold bg-orange-50 hover:bg-orange-500 hover:text-white rounded-2xl transition-all shadow-sm border border-orange-100 hover:shadow-lg hover:shadow-orange-500/30 gap-2"
                                    >
                                        <PlayCircle size={18} /> Start
                                    </button>
                                )}

                                {app.status === 'IN_CONSULTATION' && (
                                    <button 
                                        title="Complete Consultation" 
                                        onClick={() => handleUpdateStatus(app.id, 'COMPLETED')}
                                        className="px-5 h-12 flex items-center justify-center text-emerald-700 font-bold bg-emerald-50 hover:bg-emerald-500 hover:text-white rounded-2xl transition-all shadow-sm border border-emerald-100 hover:shadow-lg hover:shadow-emerald-500/30 gap-2"
                                    >
                                        <CheckCircle size={18} /> Finish
                                    </button>
                                )}

                                {['PENDING', 'CONFIRMED', 'CHECKED_IN', 'WAITING', 'CALLED', 'IN_CONSULTATION'].includes(app.status) && (
                                    <button 
                                        title="Mark No Show" 
                                        onClick={() => handleUpdateStatus(app.id, 'NO_SHOW')}
                                        className="w-12 h-12 flex items-center justify-center text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-2xl transition-all shadow-sm border border-rose-100 hover:shadow-md"
                                    >
                                        <XCircle size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View Details Modal */}
            {selectedAppointment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-theme-100 text-theme-600 flex items-center justify-center">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-800">Appointment Details</h2>
                                    <p className="text-slate-500 text-sm font-medium">ID: APT-{selectedAppointment.id}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedAppointment(null)}
                                className="w-10 h-10 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                {/* Patient Info */}
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Patient Information</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-800">{selectedAppointment.patient_first_name} {selectedAppointment.patient_last_name}</h3>
                                            <p className="text-sm font-bold text-theme-600">Queue No: {selectedAppointment.queue_number || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Date & Status */}
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Schedule & Status</p>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-slate-700">
                                            <Clock size={18} className="text-slate-400" />
                                            <span className="font-semibold">{new Date(selectedAppointment.appointment_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric'})}</span>
                                            <span className="bg-slate-100 px-2 py-0.5 rounded text-sm font-bold">{selectedAppointment.appointment_time}</span>
                                        </div>
                                        <div>
                                            {getStatusBadge(selectedAppointment.status)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Details (Reason / Notes) */}
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Activity size={16} className="text-theme-500"/> Reason for Visit
                                </h4>
                                <p className="text-slate-600 leading-relaxed">
                                    {selectedAppointment.reason || 'No specific reason provided by the patient during booking.'}
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button 
                                onClick={() => setSelectedAppointment(null)}
                                className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorAppointments;

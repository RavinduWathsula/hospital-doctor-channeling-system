import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, X, Trash2, Edit2, CalendarDays, Clock, Users, Activity, CheckCircle, Calendar } from 'lucide-react';

const daysOfWeek = [
    { id: 1, name: 'Monday', short: 'Mon' },
    { id: 2, name: 'Tuesday', short: 'Tue' },
    { id: 3, name: 'Wednesday', short: 'Wed' },
    { id: 4, name: 'Thursday', short: 'Thu' },
    { id: 5, name: 'Friday', short: 'Fri' },
    { id: 6, name: 'Saturday', short: 'Sat' },
    { id: 7, name: 'Sunday', short: 'Sun' }
];

const DoctorSchedules = () => {
    const { token } = useContext(AuthContext);
    const [schedules, setSchedules] = useState([]);
    const [doctorId, setDoctorId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        doctor_id: '',
        day_of_week: 1,
        start_time: '09:00',
        end_time: '17:00',
        slot_duration_minutes: 15,
        max_patients: 20,
        status: 'ACTIVE'
    });

    useEffect(() => {
        fetchDoctorProfile();
    }, []);

    useEffect(() => {
        if (doctorId) {
            fetchSchedules();
        }
    }, [doctorId]);

    const fetchDoctorProfile = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/doctors/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data) {
                setDoctorId(data.data.id);
            } else {
                toast.error('Could not load doctor profile');
            }
        } catch {
            toast.error('Error fetching profile');
        }
    };

    const fetchSchedules = () => {
        fetch(`http://localhost:5000/api/schedules/doctor/${doctorId}`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => { if (data.success) setSchedules(data.data); })
            .catch(() => toast.error('Error fetching schedules'));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.e ? e.target : e.target; // fallback
        setFormData({ ...formData, [name]: value });
    };

    const openCreateModal = () => {
        setIsEditMode(false);
        setEditId(null);
        setFormData({
            doctor_id: doctorId,
            day_of_week: 1,
            start_time: '09:00',
            end_time: '17:00',
            slot_duration_minutes: 15,
            max_patients: 20,
            status: 'ACTIVE'
        });
        setIsModalOpen(true);
    };

    const openEditModal = (schedule) => {
        setIsEditMode(true);
        setEditId(schedule.id);
        setFormData({
            doctor_id: schedule.doctor_id,
            day_of_week: schedule.day_of_week,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            slot_duration_minutes: schedule.slot_duration_minutes,
            max_patients: schedule.max_patients,
            status: schedule.status
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = isEditMode 
                ? `http://localhost:5000/api/schedules/${editId}` 
                : 'http://localhost:5000/api/schedules';
            const method = isEditMode ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
                toast.success(data.message);
                setIsModalOpen(false);
                fetchSchedules();
            } else {
                toast.error(data.message || 'Error saving schedule');
            }
        } catch {
            toast.error('Server error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this schedule?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/schedules/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Schedule deleted successfully');
                fetchSchedules();
            } else {
                toast.error(data.message);
            }
        } catch {
            toast.error('Server error deleting schedule');
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-800 opacity-90"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-pulse"></div>
                
                <div className="relative p-8 z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-inner">
                                <CalendarDays className="text-blue-300" size={24} />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight">My Schedules</h1>
                        </div>
                        <p className="text-blue-100/80 font-medium text-lg md:ml-16">
                            Define your working hours and availability for patients.
                        </p>
                    </div>
                    
                    <button onClick={openCreateModal} className="flex items-center px-6 py-3 bg-white text-blue-900 font-bold rounded-2xl hover:bg-blue-50 hover:scale-105 transition-all shadow-lg hover:shadow-xl">
                        <Plus size={20} className="mr-2" /> Add New Schedule
                    </button>
                </div>
            </div>

            {/* Schedules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schedules.map(s => {
                    const day = daysOfWeek.find(d => d.id === parseInt(s.day_of_week));
                    return (
                        <div key={s.id} className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-2xl border border-slate-100 transition-all duration-300 group relative overflow-hidden flex flex-col">
                            {/* Decorative background */}
                            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -mr-10 -mt-10 transition-all group-hover:scale-150 ${s.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                            
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 shadow-inner border border-blue-100/50">
                                        <span className="text-xl font-black">{day ? day.short : ''}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">{day ? day.name : 'Unknown'}</h3>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold mt-1 ${s.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {s.status === 'ACTIVE' ? <CheckCircle size={12} className="mr-1"/> : <X size={12} className="mr-1"/>}
                                            {s.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4 mb-8 relative z-10">
                                <div className="flex items-center text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <Clock size={18} className="text-indigo-500 mr-3" />
                                    <span className="font-semibold">{s.start_time} - {s.end_time}</span>
                                </div>
                            </div>
                            
                            <div className="mt-auto flex gap-3 relative z-10 border-t border-slate-100 pt-5">
                                <button onClick={() => openEditModal(s)} className="flex-1 flex items-center justify-center px-4 py-2.5 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-colors">
                                    <Edit2 size={16} className="mr-2" /> Edit
                                </button>
                                <button onClick={() => handleDelete(s.id)} className="w-12 flex items-center justify-center bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-600 hover:text-white transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}
                
                {schedules.length === 0 && (
                    <div className="col-span-full bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm flex flex-col items-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <CalendarDays size={48} className="text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">No Schedules Found</h3>
                        <p className="text-slate-500 max-w-sm text-lg mb-6">You haven't set up any working schedules yet. Add one to allow patients to book appointments.</p>
                        <button onClick={openCreateModal} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transition-all">Create First Schedule</button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-8 py-6 bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-between text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
                            <h2 className="text-2xl font-black relative z-10">{isEditMode ? 'Edit Schedule' : 'New Schedule'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors relative z-10">
                                <X size={18} />
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <div className="p-8 pb-6">
                            <form id="scheduleForm" onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Day of Week</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <select name="day_of_week" required value={formData.day_of_week} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none font-medium text-slate-700 transition-all appearance-none cursor-pointer">
                                            {daysOfWeek.map(d => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Start Time</label>
                                        <div className="relative">
                                            <input type="time" name="start_time" required value={formData.start_time} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none font-medium text-slate-700 transition-all cursor-pointer" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">End Time</label>
                                        <div className="relative">
                                            <input type="time" name="end_time" required value={formData.end_time} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none font-medium text-slate-700 transition-all cursor-pointer" />
                                        </div>
                                    </div>
                                </div>
                                

                                
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none font-medium text-slate-700 transition-all appearance-none cursor-pointer">
                                        <option value="ACTIVE">🟢 Active</option>
                                        <option value="INACTIVE">🔴 Inactive</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        
                        {/* Modal Footer */}
                        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-bold bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">Cancel</button>
                            <button type="submit" form="scheduleForm" className="px-6 py-2.5 text-white font-bold bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all">
                                {isEditMode ? 'Save Changes' : 'Create Schedule'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default DoctorSchedules;

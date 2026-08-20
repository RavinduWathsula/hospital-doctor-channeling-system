import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, X, Calendar as CalendarIcon, Clock, Users, Trash2, ArrowRight, Activity, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const daysOfWeek = [
    { id: 1, name: 'Monday', short: 'Mon' }, { id: 2, name: 'Tuesday', short: 'Tue' }, { id: 3, name: 'Wednesday', short: 'Wed' },
    { id: 4, name: 'Thursday', short: 'Thu' }, { id: 5, name: 'Friday', short: 'Fri' }, { id: 6, name: 'Saturday', short: 'Sat' }, { id: 7, name: 'Sunday', short: 'Sun' }
];

const Schedules = () => {
    const { token } = useContext(AuthContext);
    const [schedules, setSchedules] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(1);

    const [formData, setFormData] = useState({
        doctor_id: '', day_of_week: 1, start_time: '09:00', end_time: '17:00', slot_duration_minutes: 15, max_patients: 20
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [docsRes, schedsRes] = await Promise.all([
                fetch('http://localhost:5000/api/doctors', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://localhost:5000/api/schedules', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            const docs = await docsRes.json();
            const scheds = await schedsRes.json();
            if(docs.success) setDoctors(docs.data);
            if(scheds.success) setSchedules(scheds.data);
        } catch {
            toast.error('Failed to load schedule data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/schedules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if(data.success) {
                toast.success('Schedule created successfully');
                setIsModalOpen(false);
                fetchData();
                setSelectedDay(formData.day_of_week);
            } else {
                toast.error(data.message);
            }
        } catch { toast.error('Error creating schedule'); }
    };

    const handleDelete = async (id) => {
        if(!window.confirm('Are you sure you want to delete this schedule?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/schedules/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if(data.success) {
                toast.success('Schedule deleted');
                fetchData();
            } else {
                toast.error(data.message);
            }
        } catch { toast.error('Error deleting schedule'); }
    };

    const currentDaySchedules = schedules.filter(s => s.day_of_week === selectedDay);

    const getTimeIcon = (time) => {
        const hour = parseInt(time.split(':')[0]);
        if (hour < 12) return <Sun size={16} className="text-amber-500" />;
        if (hour < 18) return <Sun size={16} className="text-orange-500" />;
        return <Moon size={16} className="text-indigo-500" />;
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 mr-4">
                            <CalendarIcon size={24} />
                        </div>
                        Dynamic Roster
                    </h1>
                    <p className="text-slate-500 font-medium mt-2">Design and oversee the hospital's weekly operational schedule.</p>
                </div>
                
                <button 
                    onClick={() => {
                        setFormData({ doctor_id: '', day_of_week: selectedDay, start_time: '09:00', end_time: '17:00', slot_duration_minutes: 15, max_patients: 20 });
                        setIsModalOpen(true);
                    }} 
                    className="flex items-center justify-center px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 hover:shadow-slate-900/40 hover:-translate-y-1"
                >
                    <Plus size={20} className="mr-2" /> Assign Shift
                </button>
            </div>

            {/* Day Selector Navigation */}
            <div className="bg-white/60 backdrop-blur-xl p-2 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex overflow-x-auto hide-scrollbar space-x-2">
                {daysOfWeek.map(day => {
                    const isActive = selectedDay === day.id;
                    const shiftCount = schedules.filter(s => s.day_of_week === day.id).length;
                    return (
                        <button
                            key={day.id}
                            onClick={() => setSelectedDay(day.id)}
                            className={`flex-1 min-w-[120px] relative px-6 py-4 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 overflow-hidden group ${
                                isActive 
                                ? 'bg-slate-900 shadow-lg' 
                                : 'hover:bg-white hover:shadow-sm'
                            }`}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 opacity-50 blur-xl"></div>
                            )}
                            <span className={`text-sm font-bold tracking-widest uppercase relative z-10 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                {day.name}
                            </span>
                            <div className={`mt-2 px-3 py-1 rounded-full text-xs font-black relative z-10 transition-colors ${
                                isActive 
                                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/40' 
                                : shiftCount > 0 
                                    ? 'bg-indigo-50 text-indigo-600' 
                                    : 'bg-slate-100 text-slate-400'
                            }`}>
                                {shiftCount} {shiftCount === 1 ? 'Shift' : 'Shifts'}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Main Content Area */}
            {isLoading ? (
                <div className="p-20 text-center">
                    <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-bold tracking-wide">Loading schedules...</p>
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={selectedDay}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 gap-4"
                    >
                        {currentDaySchedules.length === 0 ? (
                            <div className="bg-white/50 backdrop-blur-xl border border-white border-dashed rounded-[3rem] p-20 flex flex-col items-center justify-center text-center shadow-sm">
                                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                                    <CalendarIcon size={40} className="text-slate-300" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-700 tracking-tight mb-2">No Shifts Scheduled</h3>
                                <p className="text-slate-500 font-medium max-w-sm">There are currently no doctors scheduled for {daysOfWeek.find(d => d.id === selectedDay).name}.</p>
                                <button 
                                    onClick={() => {
                                        setFormData({ doctor_id: '', day_of_week: selectedDay, start_time: '09:00', end_time: '17:00', slot_duration_minutes: 15, max_patients: 20 });
                                        setIsModalOpen(true);
                                    }}
                                    className="mt-8 px-8 py-3 bg-amber-50 text-amber-600 font-bold rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors"
                                >
                                    Add First Shift
                                </button>
                            </div>
                        ) : (
                            currentDaySchedules.map((schedule, index) => (
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    key={schedule.id} 
                                    className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:shadow-amber-500/10 transition-all flex flex-col md:flex-row md:items-center justify-between group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    
                                    <div className="flex items-center md:w-1/3 mb-4 md:mb-0">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center border border-indigo-100 shadow-inner mr-5 overflow-hidden">
                                                {schedule.profile_image ? (
                                                    <img src={schedule.profile_image} alt="Doctor" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-2xl font-black text-indigo-600">{schedule.first_name?.charAt(0) || 'D'}</span>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-50 border-2 border-white flex items-center justify-center shadow-sm">
                                                <Activity size={12} className="text-emerald-500" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-800">Dr. {schedule.first_name} {schedule.last_name}</h3>
                                            <span className="inline-block mt-1 px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg border border-indigo-100">
                                                {schedule.specialization || 'General'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center md:w-1/3 justify-start md:justify-center mb-4 md:mb-0 space-x-6">
                                        <div className="text-center">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Start Time</p>
                                            <div className="flex items-center text-lg font-black text-slate-700">
                                                {getTimeIcon(schedule.start_time)}
                                                <span className="ml-2">{schedule.start_time.substring(0,5)}</span>
                                            </div>
                                        </div>
                                        <div className="text-slate-300">
                                            <ArrowRight size={20} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">End Time</p>
                                            <div className="flex items-center text-lg font-black text-slate-700">
                                                {getTimeIcon(schedule.end_time)}
                                                <span className="ml-2">{schedule.end_time.substring(0,5)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:w-1/3 md:justify-end">
                                        <div className="mr-8 text-right hidden lg:block">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Capacity</p>
                                            <div className="flex items-center text-sm font-black text-blue-600">
                                                <Users size={16} className="mr-1.5" /> {schedule.max_patients} Patients
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(schedule.id)} 
                                            className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/40 transition-all"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Premium Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"></motion.div>
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl flex flex-col relative z-10 border border-slate-100 overflow-hidden"
                        >
                            <div className="flex justify-between items-center p-8 border-b border-slate-100 bg-slate-50/80">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center">
                                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mr-3 shadow-inner">
                                            <Clock size={20} />
                                        </div>
                                        Configure Shift
                                    </h2>
                                    <p className="text-slate-500 font-medium mt-1 text-sm ml-13">Assign a new operational window for a doctor.</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shadow-sm">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="p-8">
                                <form id="scheduleForm" onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Select Doctor *</label>
                                            <select required value={formData.doctor_id} onChange={(e) => setFormData({...formData, doctor_id: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all outline-none font-bold text-slate-700">
                                                <option value="">Choose a medical professional...</option>
                                                {doctors.filter(d => d.is_active).map(doc => (
                                                    <option key={doc.id} value={doc.id}>Dr. {doc.first_name} {doc.last_name} ({doc.specialization})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Day of Week *</label>
                                            <select required value={formData.day_of_week} onChange={(e) => setFormData({...formData, day_of_week: parseInt(e.target.value)})} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all outline-none font-bold text-slate-700">
                                                {daysOfWeek.map(day => <option key={day.id} value={day.id}>{day.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Start Time *</label>
                                            <input type="time" required value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all outline-none font-bold text-slate-700" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">End Time *</label>
                                            <input type="time" required value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all outline-none font-bold text-slate-700" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Slot Duration (Mins) *</label>
                                            <input type="number" required min="5" step="5" value={formData.slot_duration_minutes} onChange={(e) => setFormData({...formData, slot_duration_minutes: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all outline-none font-bold text-slate-700" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Max Patients *</label>
                                            <input type="number" required min="1" value={formData.max_patients} onChange={(e) => setFormData({...formData, max_patients: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all outline-none font-bold text-slate-700" />
                                        </div>
                                    </div>
                                </form>
                            </div>
                            
                            <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-end space-x-4">
                                <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 font-bold transition-colors shadow-sm">Cancel</button>
                                <button type="submit" form="scheduleForm" className="px-8 py-3 text-white bg-slate-900 rounded-xl hover:bg-slate-800 font-bold shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1">Publish Shift</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Schedules;

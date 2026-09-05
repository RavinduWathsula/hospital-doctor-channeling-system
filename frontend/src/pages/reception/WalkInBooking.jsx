import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { UserPlus, Calendar, Clock, Stethoscope, Search, CheckCircle, FileText, AlertTriangle, Activity, User, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const WalkInBooking = () => {
    const { token } = useContext(AuthContext);
    const [patients, setPatients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [departments, setDepartments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    
    // Default date to today
    const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
    const [appointmentTime, setAppointmentTime] = useState('');
    const [notes, setNotes] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [fetchingSlots, setFetchingSlots] = useState(false);

    useEffect(() => {
        fetchDepartments();
        fetchPatients();
    }, []);

    useEffect(() => {
        if (selectedDepartmentId) {
            fetchDoctors(selectedDepartmentId);
        } else {
            setDoctors([]);
            setSelectedDoctorId('');
        }
    }, [selectedDepartmentId]);

    useEffect(() => {
        if (selectedDoctorId && appointmentDate) {
            fetchAvailableSlots();
        } else {
            setAvailableSlots([]);
        }
    }, [selectedDoctorId, appointmentDate]);

    const fetchPatients = async () => {
        try {
            const res = await fetch('/api/patients', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setPatients(data.data);
            }
        } catch (error) {
            console.error("Error fetching patients", error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await fetch('/api/departments');
            const data = await res.json();
            if (data.success) {
                setDepartments(data.data);
            }
        } catch (error) {
            console.error("Error fetching departments", error);
        }
    };

    const fetchDoctors = async (deptId) => {
        try {
            const res = await fetch(`/api/doctors?department=${deptId}`);
            const data = await res.json();
            if (data.success) {
                setDoctors(data.data);
            }
        } catch (error) {
            console.error("Error fetching doctors", error);
        }
    };

    const fetchAvailableSlots = async () => {
        setFetchingSlots(true);
        try {
            const res = await fetch(`/api/slots?doctorId=${selectedDoctorId}&date=${appointmentDate}`);
            const data = await res.json();
            if (data.success) {
                setAvailableSlots(data.data);
            }
        } catch (error) {
            toast.error("Failed to load time slots");
        } finally {
            setFetchingSlots(false);
        }
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!selectedPatientId || !selectedDoctorId || !appointmentTime) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/appointments/walk-in', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    patient_id: selectedPatientId,
                    doctor_id: selectedDoctorId,
                    appointment_date: appointmentDate,
                    appointment_time: appointmentTime,
                    notes: `${isUrgent ? '[URGENT] ' : ''}${notes}`
                })
            });
            
            const data = await res.json();
            if (data.success) {
                toast.success(`Booking confirmed. Queue Number: ${data.data.queue_number}`);
                // Reset form partially
                setSelectedPatientId('');
                setAppointmentTime('');
                setNotes('');
                setIsUrgent(false);
                fetchAvailableSlots();
            } else {
                toast.error(data.message || "Failed to book walk-in appointment");
            }
        } catch (error) {
            toast.error("An error occurred during booking.");
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(p => 
        p.first_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone?.includes(searchQuery)
    );

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 relative">
            {/* Background Decorative Elements */}
            <div className="fixed top-0 right-0 -z-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl opacity-50 mix-blend-multiply pointer-events-none"></div>
            <div className="fixed bottom-0 left-0 -z-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl opacity-50 mix-blend-multiply pointer-events-none"></div>

            <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/60 overflow-hidden transition-all duration-300">
                
                {/* Header Section */}
                <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-900 px-10 py-12 overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white/10 rounded-full blur-3xl mix-blend-overlay animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-white/10 rounded-full blur-3xl mix-blend-overlay animate-pulse" style={{ animationDelay: '1s' }}></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center">
                            <div className="p-4 bg-white/20 rounded-2xl mr-6 backdrop-blur-md shadow-inner border border-white/30 transform hover:scale-105 transition-transform">
                                <Activity className="text-white" size={36} />
                            </div>
                            <div>
                                <h2 className="text-4xl font-black text-white tracking-tight mb-2 drop-shadow-md">Walk-In Booking</h2>
                                <p className="text-indigo-100/90 text-lg font-medium flex items-center">
                                    <span>Streamlined scheduling for arriving patients</span>
                                    <span className="mx-3 h-1.5 w-1.5 rounded-full bg-indigo-300"></span>
                                    <span className="text-emerald-300 font-semibold flex items-center">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-ping"></div>
                                        Live Queue Active
                                    </span>
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20">
                            <div className="px-4 py-2 bg-white/20 rounded-xl text-white font-semibold flex items-center shadow-sm">
                                <Clock size={16} className="mr-2 opacity-80" />
                                {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                        </div>
                    </div>
                </div>
                
                <form onSubmit={handleBooking} className="p-8 md:p-12 space-y-12">
                    
                    {/* Step 1: Patient Selection */}
                    <div className="relative group/step">
                        <div className="absolute left-7 top-14 bottom-[-3rem] w-0.5 bg-gradient-to-b from-indigo-200 via-purple-100 to-transparent -z-10 group-hover/step:from-indigo-400 transition-colors duration-500"></div>
                        <div className="flex items-center mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-200 border border-indigo-100 z-10 transform group-hover/step:scale-110 transition-transform duration-300">
                                1
                            </div>
                            <h3 className="text-3xl font-extrabold text-slate-800 ml-6 tracking-tight">Select Patient</h3>
                        </div>
                        
                        <div className="ml-20 bg-white/80 p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 backdrop-blur-sm">
                            <div className="relative mb-8 group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={22} />
                                <input 
                                    type="text" 
                                    placeholder="Search by name, phone number, or ID..."
                                    className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 outline-none text-slate-700 font-semibold text-lg"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button 
                                        type="button" 
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-full p-1 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            
                            <div className="max-h-[320px] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-5 pr-2 custom-scrollbar">
                                {filteredPatients.map(p => (
                                    <div 
                                        key={p.id}
                                        onClick={() => setSelectedPatientId(p.id)}
                                        className={`group/card relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center overflow-hidden ${
                                            selectedPatientId === p.id 
                                                ? 'bg-indigo-50/90 border-indigo-500 shadow-md transform scale-[1.02]' 
                                                : 'bg-white border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10'
                                        }`}
                                    >
                                        {selectedPatientId === p.id && (
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-bl-full -z-10"></div>
                                        )}
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl mr-5 transition-colors duration-300 ${
                                            selectedPatientId === p.id 
                                                ? 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-inner' 
                                                : 'bg-slate-100 text-slate-500 group-hover/card:bg-indigo-100 group-hover/card:text-indigo-600'
                                        }`}>
                                            {p.first_name.charAt(0)}{p.last_name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-extrabold text-lg transition-colors ${selectedPatientId === p.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                                                {p.first_name} {p.last_name}
                                            </p>
                                            <p className="text-sm text-slate-500 font-semibold mt-1 flex items-center">
                                                <User size={14} className="mr-1.5 opacity-70" />
                                                {p.phone || 'No phone number'}
                                            </p>
                                        </div>
                                        
                                        <div className={`ml-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                            selectedPatientId === p.id 
                                                ? 'bg-indigo-600 text-white shadow-md scale-100' 
                                                : 'bg-slate-100 text-slate-400 scale-0 group-hover/card:scale-100 opacity-0 group-hover/card:opacity-100'
                                        }`}>
                                            <CheckCircle size={24} className={selectedPatientId === p.id ? 'animate-in zoom-in duration-300' : ''} />
                                        </div>
                                    </div>
                                ))}
                                
                                {filteredPatients.length === 0 && (
                                    <div className="col-span-1 md:col-span-2 p-10 flex flex-col items-center justify-center text-slate-500 bg-slate-50/80 rounded-3xl border-2 border-dashed border-slate-200">
                                        <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-5">
                                            <UserPlus size={36} className="text-indigo-400" />
                                        </div>
                                        <p className="text-xl font-bold text-slate-700 mb-2">No patients found</p>
                                        <p className="text-slate-500 font-medium mb-6 text-center max-w-md">We couldn't find any patient matching "{searchQuery}". They might be new to the clinic.</p>
                                        <button type="button" className="px-6 py-3 bg-white border-2 border-indigo-100 hover:border-indigo-500 hover:bg-indigo-50 text-indigo-700 font-bold rounded-xl transition-all shadow-sm flex items-center group">
                                            <UserPlus size={18} className="mr-2 group-hover:scale-110 transition-transform" />
                                            Register New Patient
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Doctor Selection */}
                    <div className="relative group/step">
                        <div className="absolute left-7 top-14 bottom-[-3rem] w-0.5 bg-gradient-to-b from-purple-200 via-emerald-100 to-transparent -z-10 group-hover/step:from-purple-400 transition-colors duration-500"></div>
                        <div className="flex items-center mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-purple-200 border border-purple-100 z-10 transform group-hover/step:scale-110 transition-transform duration-300">
                                2
                            </div>
                            <h3 className="text-3xl font-extrabold text-slate-800 ml-6 tracking-tight">Select Doctor</h3>
                        </div>
                        
                        <div className="ml-20 bg-white/80 p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-500 backdrop-blur-sm">
                            <div className="mb-8">
                                <label className="flex items-center text-sm font-black text-slate-700 mb-4 uppercase tracking-widest">
                                    <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                                    1. Select Department
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {departments.map(d => (
                                        <div 
                                            key={d.id}
                                            onClick={() => {
                                                setSelectedDepartmentId(d.id);
                                                setSelectedDoctorId(''); // Reset doctor when changing department
                                            }}
                                            className={`cursor-pointer px-6 py-3 rounded-xl border-2 transition-all duration-300 font-bold ${
                                                selectedDepartmentId === d.id
                                                    ? 'bg-purple-100 border-purple-500 text-purple-700 shadow-md transform scale-[1.02]'
                                                    : 'bg-white border-slate-100 text-slate-600 hover:border-purple-300 hover:bg-purple-50 hover:-translate-y-0.5'
                                            }`}
                                        >
                                            {d.name}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={`transition-all duration-500 ${selectedDepartmentId ? 'opacity-100 translate-y-0' : 'opacity-50 pointer-events-none translate-y-4'}`}>
                                <label className="flex items-center text-sm font-black text-slate-700 mb-4 uppercase tracking-widest pt-6 border-t border-slate-100">
                                    <span className={`w-2 h-2 rounded-full mr-2 transition-colors ${selectedDepartmentId ? 'bg-purple-500' : 'bg-slate-300'}`}></span>
                                    2. Select Doctor
                                </label>
                                
                                {selectedDepartmentId ? (
                                    doctors.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {doctors.map(d => (
                                                <div 
                                                    key={d.id}
                                                    onClick={() => setSelectedDoctorId(d.id)}
                                                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all duration-300 flex items-center group/doc ${
                                                        selectedDoctorId === d.id
                                                            ? 'bg-purple-50 border-purple-500 shadow-md'
                                                            : 'bg-white border-slate-100 hover:border-purple-300 hover:bg-purple-50/50 hover:-translate-y-0.5'
                                                    }`}
                                                >
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg mr-4 transition-colors ${
                                                        selectedDoctorId === d.id ? 'bg-purple-600 text-white shadow-inner' : 'bg-purple-100 text-purple-600 group-hover/doc:bg-purple-200'
                                                    }`}>
                                                        {d.first_name.charAt(0)}{d.last_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className={`font-extrabold transition-colors ${selectedDoctorId === d.id ? 'text-purple-900' : 'text-slate-700'}`}>
                                                            Dr. {d.first_name} {d.last_name}
                                                        </p>
                                                    </div>
                                                    {selectedDoctorId === d.id && (
                                                        <div className="ml-auto w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white animate-in zoom-in">
                                                            <CheckCircle size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center">
                                            <Stethoscope size={32} className="text-slate-300 mb-3" />
                                            <p className="text-slate-500 font-bold">No doctors available in this department.</p>
                                        </div>
                                    )
                                ) : (
                                    <div className="p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center">
                                        <p className="text-slate-400 font-bold">Please select a department first to see available doctors.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Visit Details & Time */}
                    <div className="relative group/step">
                        <div className="flex items-center mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-200 border border-emerald-100 z-10 transform group-hover/step:scale-110 transition-transform duration-300">
                                3
                            </div>
                            <h3 className="text-3xl font-extrabold text-slate-800 ml-6 tracking-tight">Visit Details</h3>
                        </div>
                        
                        <div className="ml-20 bg-white/80 p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500 backdrop-blur-sm">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="group">
                                    <label className="flex items-center text-sm font-black text-slate-700 mb-3 uppercase tracking-widest">
                                        <Calendar size={16} className="text-emerald-500 mr-2" />
                                        Date
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="date" 
                                            className="w-full p-4 pl-5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 outline-none text-slate-700 font-bold text-lg cursor-pointer hover:border-slate-300 shadow-sm"
                                            value={appointmentDate}
                                            onChange={(e) => setAppointmentDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="group">
                                    <label className="flex items-center text-sm font-black text-slate-700 mb-3 uppercase tracking-widest">
                                        <Clock size={16} className="text-emerald-500 mr-2" />
                                        Time Slot
                                    </label>
                                    <div className="relative">
                                        <select 
                                            className="w-full p-4 pl-5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 outline-none text-slate-700 font-bold text-lg appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:border-slate-300 shadow-sm"
                                            value={appointmentTime}
                                            onChange={(e) => setAppointmentTime(e.target.value)}
                                            required
                                            disabled={fetchingSlots || !selectedDoctorId}
                                        >
                                            <option value="" disabled>
                                                {fetchingSlots ? 'Loading slots...' : !selectedDoctorId ? 'Select Doctor first' : 'Select a time slot'}
                                            </option>
                                            {availableSlots.map((slot, index) => (
                                                <option key={index} value={slot}>{slot}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-slate-400">
                                            <ChevronRight className="rotate-90 transform" size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Details */}
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1">
                                        <label className="flex items-center text-sm font-black text-slate-700 mb-3 uppercase tracking-widest">
                                            <FileText size={16} className="text-slate-400 mr-2" />
                                            Reason for Visit / Symptoms
                                        </label>
                                        <textarea
                                            placeholder="Briefly describe the symptoms or reason for the walk-in..."
                                            className="w-full p-4 rounded-xl border-2 border-slate-200 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-slate-700 font-medium resize-none"
                                            rows="3"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        ></textarea>
                                    </div>
                                    
                                    <div className="w-full md:w-64 flex flex-col justify-center">
                                        <div 
                                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center gap-3 ${
                                                isUrgent 
                                                    ? 'bg-red-50 border-red-500 shadow-md shadow-red-500/10' 
                                                    : 'bg-white border-slate-200 hover:border-red-300 hover:bg-red-50/50'
                                            }`}
                                            onClick={() => setIsUrgent(!isUrgent)}
                                        >
                                            <AlertTriangle size={32} className={`${isUrgent ? 'text-red-600 animate-pulse' : 'text-slate-400'}`} />
                                            <div>
                                                <p className={`font-black text-lg ${isUrgent ? 'text-red-700' : 'text-slate-600'}`}>Urgent Case</p>
                                                <p className="text-xs text-slate-500 font-semibold mt-1">Mark as high priority</p>
                                            </div>
                                            
                                            {/* Toggle Switch */}
                                            <div className={`w-12 h-6 rounded-full mt-1 relative transition-colors duration-300 ${isUrgent ? 'bg-red-500' : 'bg-slate-300'}`}>
                                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${isUrgent ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    </div>

                    {/* Submit Action */}
                    <div className="pt-10 mt-6 border-t-2 border-slate-100 flex flex-col sm:flex-row items-center justify-between ml-20 gap-6">
                        <p className="text-slate-500 font-semibold flex items-center text-sm bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                            System will auto-assign queue number
                        </p>
                        
                        <button 
                            type="submit" 
                            disabled={loading || !selectedPatientId || !selectedDoctorId || !appointmentTime}
                            className="group relative px-10 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 focus:ring-4 focus:ring-indigo-500/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center overflow-hidden w-full sm:w-auto justify-center"
                        >
                            <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 ease-in-out -skew-x-12 -ml-10 w-2/3"></div>
                            
                            {loading ? (
                                <span className="flex items-center drop-shadow-md">
                                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing Booking...
                                </span>
                            ) : (
                                <>
                                    <Stethoscope className="mr-3 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 drop-shadow-md" size={24} />
                                    <span className="drop-shadow-md tracking-wide">Confirm Walk-In Booking</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                    border: 2px solid #f8fafc;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    );
};

export default WalkInBooking;

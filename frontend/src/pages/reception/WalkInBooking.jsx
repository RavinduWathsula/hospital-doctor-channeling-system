import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { UserPlus, Calendar, Clock, Stethoscope, Search, CheckCircle } from 'lucide-react';
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
    
    const [loading, setLoading] = useState(false);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [fetchingSlots, setFetchingSlots] = useState(false);

    useEffect(() => {
        fetchDepartments();
        // We might want to only search patients when they type, but for a small clinic, fetching all is fine.
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
                    notes: notes
                })
            });
            
            const data = await res.json();
            if (data.success) {
                toast.success(`Booking confirmed. Queue Number: ${data.data.queue_number}`);
                // Reset form partially
                setSelectedPatientId('');
                setAppointmentTime('');
                setNotes('');
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
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 overflow-hidden transition-all duration-300">
                <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 px-8 py-10 overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="relative z-10 flex items-center">
                        <div className="p-3 bg-white/20 rounded-xl mr-5 backdrop-blur-sm">
                            <UserPlus className="text-white" size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-extrabold text-white tracking-tight">Walk-In Booking</h2>
                            <p className="text-indigo-100 mt-1 font-medium">Quickly schedule an appointment for walk-in patients</p>
                        </div>
                    </div>
                </div>
                
                <form onSubmit={handleBooking} className="p-8 space-y-10 bg-gradient-to-b from-gray-50/50 to-white">
                    {/* Patient Selection */}
                    <div className="relative">
                        <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 to-transparent -z-10"></div>
                        <div className="flex items-center mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl shadow-sm border border-indigo-200 z-10">
                                1
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 ml-4 tracking-tight">Select Patient</h3>
                        </div>
                        <div className="ml-16 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                            <div className="relative mb-6 group">
                                <Search className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="Search patient by name or phone..."
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 outline-none text-gray-700 font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="max-h-60 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 pr-2 custom-scrollbar">
                                {filteredPatients.map(p => (
                                    <div 
                                        key={p.id}
                                        onClick={() => setSelectedPatientId(p.id)}
                                        className={`group p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 flex items-center ${
                                            selectedPatientId === p.id 
                                                ? 'bg-indigo-50/80 border-indigo-500 shadow-md scale-[1.02]' 
                                                : 'bg-white border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 hover:-translate-y-0.5 hover:shadow-sm'
                                        }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold mr-4 transition-colors ${
                                            selectedPatientId === p.id ? 'bg-indigo-600 text-white shadow-inner' : 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200'
                                        }`}>
                                            {p.first_name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-bold text-base transition-colors ${selectedPatientId === p.id ? 'text-indigo-900' : 'text-gray-800'}`}>
                                                {p.first_name} {p.last_name}
                                            </p>
                                            <p className="text-sm text-gray-500 font-medium mt-0.5">{p.phone || 'No phone number'}</p>
                                        </div>
                                        {selectedPatientId === p.id && (
                                            <div className="ml-auto w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center animate-in zoom-in duration-200">
                                                <CheckCircle className="text-indigo-600" size={20} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {filteredPatients.length === 0 && (
                                    <div className="col-span-2 py-8 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <UserPlus size={40} className="mb-3 opacity-50" />
                                        <p className="text-sm font-medium">No patients found. Please register them first.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Doctor Selection */}
                    <div className="relative">
                        <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 to-transparent -z-10"></div>
                        <div className="flex items-center mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xl shadow-sm border border-purple-200 z-10">
                                2
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 ml-4 tracking-tight">Select Doctor</h3>
                        </div>
                        <div className="ml-16 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="group">
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider text-xs">Department</label>
                                <div className="relative">
                                    <select 
                                        className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 outline-none text-gray-700 font-medium appearance-none cursor-pointer"
                                        value={selectedDepartmentId}
                                        onChange={(e) => setSelectedDepartmentId(e.target.value)}
                                        required
                                    >
                                        <option value="">Choose a Department</option>
                                        {departments.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="group">
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider text-xs">Doctor</label>
                                <div className="relative">
                                    <select 
                                        className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 outline-none text-gray-700 font-medium appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        value={selectedDoctorId}
                                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                                        required
                                        disabled={!selectedDepartmentId}
                                    >
                                        <option value="">Choose a Doctor</option>
                                        {doctors.map(d => (
                                            <option key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Time Selection */}
                    <div className="relative">
                        <div className="flex items-center mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl shadow-sm border border-emerald-200 z-10">
                                3
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 ml-4 tracking-tight">Select Time</h3>
                        </div>
                        <div className="ml-16 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="group">
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider text-xs">Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-3.5 text-emerald-500 group-focus-within:text-emerald-600 transition-colors" size={20} />
                                    <input 
                                        type="date" 
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 outline-none text-gray-700 font-medium cursor-pointer"
                                        value={appointmentDate}
                                        onChange={(e) => setAppointmentDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="group">
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider text-xs">Time Slot</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-3.5 text-emerald-500 group-focus-within:text-emerald-600 transition-colors" size={20} />
                                    <select 
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 outline-none text-gray-700 font-medium appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        value={appointmentTime}
                                        onChange={(e) => setAppointmentTime(e.target.value)}
                                        required
                                        disabled={fetchingSlots || !selectedDoctorId}
                                    >
                                        <option value="">{fetchingSlots ? 'Loading available slots...' : 'Select a time slot'}</option>
                                        {availableSlots.map((slot, index) => (
                                            <option key={index} value={slot}>{slot}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 mt-4 border-t border-gray-100 flex justify-end ml-16">
                        <button 
                            type="submit" 
                            disabled={loading || !selectedPatientId || !selectedDoctorId || !appointmentTime}
                            className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-1 focus:ring-4 focus:ring-indigo-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -ml-8 w-1/2"></div>
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing Booking...
                                </span>
                            ) : (
                                <>
                                    <Stethoscope className="mr-3 group-hover:rotate-12 transition-transform duration-300" size={22} />
                                    Confirm Walk-In Booking
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            
            {/* Add custom styles for scrollbar in this page context */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #c7d2fe;
                    border-radius: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #818cf8;
                }
            `}</style>
        </div>
    );
};

export default WalkInBooking;

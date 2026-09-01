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
            const res = await fetch('http://localhost:5000/api/patients', {
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
            const res = await fetch('http://localhost:5000/api/departments');
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
            const res = await fetch(`http://localhost:5000/api/doctors?department=${deptId}`);
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
            const res = await fetch(`http://localhost:5000/api/slots?doctorId=${selectedDoctorId}&date=${appointmentDate}`);
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
            const res = await fetch('http://localhost:5000/api/appointments/walk-in', {
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
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center">
                    <UserPlus className="text-white mr-3" size={24} />
                    <h2 className="text-xl font-bold text-white">Walk-In Booking</h2>
                </div>
                
                <form onSubmit={handleBooking} className="p-6 space-y-8">
                    {/* Patient Selection */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2 text-sm">1</span>
                            Select Patient
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Search patient by name or phone..."
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="max-h-48 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3">
                                {filteredPatients.map(p => (
                                    <div 
                                        key={p.id}
                                        onClick={() => setSelectedPatientId(p.id)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center ${selectedPatientId === p.id ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'bg-white border-gray-200 hover:border-indigo-300'}`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold mr-3">
                                            {p.first_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800 text-sm">{p.first_name} {p.last_name}</p>
                                            <p className="text-xs text-gray-500">{p.phone || 'No phone'}</p>
                                        </div>
                                        {selectedPatientId === p.id && <CheckCircle className="ml-auto text-indigo-600" size={20} />}
                                    </div>
                                ))}
                                {filteredPatients.length === 0 && (
                                    <p className="text-gray-500 text-sm text-center col-span-2 py-4">No patients found. Please register them first.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Doctor Selection */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2 text-sm">2</span>
                            Select Doctor
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <select 
                                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={selectedDepartmentId}
                                    onChange={(e) => setSelectedDepartmentId(e.target.value)}
                                    required
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                                <select 
                                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={selectedDoctorId}
                                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                                    required
                                    disabled={!selectedDepartmentId}
                                >
                                    <option value="">Select Doctor</option>
                                    {doctors.map(d => (
                                        <option key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Time Selection */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2 text-sm">3</span>
                            Select Time
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input 
                                        type="date" 
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={appointmentDate}
                                        onChange={(e) => setAppointmentDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <select 
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={appointmentTime}
                                        onChange={(e) => setAppointmentTime(e.target.value)}
                                        required
                                        disabled={fetchingSlots || !selectedDoctorId}
                                    >
                                        <option value="">{fetchingSlots ? 'Loading slots...' : 'Select a time slot'}</option>
                                        {availableSlots.map((slot, index) => (
                                            <option key={index} value={slot}>{slot}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={loading || !selectedPatientId || !selectedDoctorId || !appointmentTime}
                            className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {loading ? (
                                <span className="animate-pulse">Booking...</span>
                            ) : (
                                <>
                                    <Stethoscope className="mr-2" size={20} />
                                    Confirm Walk-In Booking
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WalkInBooking;

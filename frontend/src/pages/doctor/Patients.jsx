import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Search, UserCircle, Phone, Mail, MapPin, CalendarDays, User, Users, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const DoctorPatients = () => {
    const { token } = useContext(AuthContext);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [doctorId, setDoctorId] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientHistory, setPatientHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const openPatientModal = async (patient) => {
        setSelectedPatient(patient);
        setLoadingHistory(true);
        try {
            const res = await fetch(`/api/prescriptions/patient?userId=${patient.user_id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setPatientHistory(data.data || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        fetchDoctorProfile();
    }, []);

    useEffect(() => {
        if (doctorId) {
            fetchPatients();
        }
    }, [doctorId]);

    const fetchDoctorProfile = async () => {
        try {
            const res = await fetch('/api/doctors/me', {
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

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/doctors/${doctorId}/patients`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setPatients(data.data);
            } else {
                toast.error(data.message || 'Failed to fetch patients');
            }
        } catch (error) {
            toast.error('Server error fetching patients');
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(p => 
        (p.first_name + ' ' + p.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone?.includes(searchTerm) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-theme-600 to-theme-900 opacity-90 transition-colors duration-500"></div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-theme-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob transition-colors duration-500"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-theme-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 transition-colors duration-500"></div>
                
                <div className="relative p-8 z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-inner">
                                <Users className="text-theme-100" size={24} />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">My Patients</h1>
                        </div>
                        <p className="text-theme-50 text-lg md:text-xl max-w-xl leading-relaxed opacity-90 md:ml-16">
                            Manage and view the complete medical history of your assigned patients.
                        </p>
                    </div>
                    
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search patients..." 
                            className="pl-11 pr-4 py-3 w-full bg-white/10 border border-white/20 rounded-2xl focus:bg-white/20 focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none transition-all placeholder-white/60 text-white font-medium backdrop-blur-sm shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="w-16 h-16 relative">
                        <div className="absolute inset-0 border-4 border-theme-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-theme-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPatients.length === 0 ? (
                        <div className="col-span-full bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm flex flex-col items-center">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <User size={48} className="text-slate-300" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2">No Patients Found</h3>
                            <p className="text-slate-500 max-w-sm text-lg">You don't have any patients matching that search, or no one has booked an appointment yet.</p>
                        </div>
                    ) : (
                        filteredPatients.map((patient) => (
                            <div key={patient.id} className="bg-white rounded-[2rem] shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 group relative overflow-hidden flex flex-col p-6 hover:-translate-y-1">
                                {/* Creative decorative background */}
                                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-theme-100/80 to-transparent rounded-bl-[100px] -z-0 transition-transform duration-500 group-hover:scale-110"></div>
                                
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-[1.25rem] bg-theme-50 text-theme-600 flex items-center justify-center text-2xl font-black shadow-inner border border-theme-100 group-hover:bg-theme-600 group-hover:text-white transition-colors duration-300">
                                                {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-slate-800 tracking-tight">{patient.first_name} {patient.last_name}</h3>
                                                <div className="mt-1 flex">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] uppercase tracking-widest font-bold bg-slate-100 text-slate-500">
                                                        ID: {patient.id}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4 mb-8 flex-1">
                                        <div className="flex items-center text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 shadow-inner group-hover:border-slate-200 transition-colors">
                                            <Phone size={18} className="text-emerald-500 mr-4" />
                                            <span className="font-bold text-sm tracking-wide">{patient.phone || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 shadow-inner group-hover:border-slate-200 transition-colors">
                                            <Mail size={18} className="text-teal-500 mr-4" />
                                            <span className="font-bold text-sm truncate">{patient.email}</span>
                                        </div>
                                        <div className="flex items-center text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 shadow-inner group-hover:border-slate-200 transition-colors">
                                            <CalendarDays size={18} className="text-blue-500 mr-4" />
                                            <span className="font-bold text-sm truncate">{patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 shadow-inner group-hover:border-slate-200 transition-colors">
                                            <MapPin size={18} className="text-orange-500 mr-4" />
                                            <span className="font-bold text-sm truncate">{patient.address || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto border-t border-slate-50 pt-6">
                                        <button onClick={() => openPatientModal(patient)} className="w-full flex items-center justify-center px-4 py-3.5 bg-white border border-theme-100 text-theme-700 font-black tracking-wide rounded-2xl hover:bg-theme-50 hover:border-theme-200 transition-all group/btn shadow-sm">
                                            <Activity size={18} className="mr-2 group-hover/btn:animate-pulse text-theme-500" /> View History
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Patient History Modal */}
            {selectedPatient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedPatient(null)}></div>
                    <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="px-8 py-6 bg-gradient-to-r from-theme-600 to-theme-800 flex items-center justify-between text-white relative overflow-hidden shrink-0">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black shadow-inner border border-white/20">
                                    {selectedPatient.first_name.charAt(0)}{selectedPatient.last_name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight">{selectedPatient.first_name} {selectedPatient.last_name}</h2>
                                    <p className="text-theme-100 font-medium">Patient Details & Medical History</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedPatient(null)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors relative z-10">
                                <span className="font-bold text-xl leading-none">&times;</span>
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar bg-slate-50/50">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Profile Sidebar */}
                                <div className="md:col-span-1 space-y-6">
                                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Contact Info</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <Phone size={16} className="text-theme-500 mt-1" />
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400">Phone</p>
                                                    <p className="font-semibold text-slate-700">{selectedPatient.phone || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <Mail size={16} className="text-theme-500 mt-1" />
                                                <div className="overflow-hidden">
                                                    <p className="text-xs font-bold text-slate-400">Email</p>
                                                    <p className="font-semibold text-slate-700 truncate" title={selectedPatient.email}>{selectedPatient.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <CalendarDays size={16} className="text-theme-500 mt-1" />
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400">Date of Birth</p>
                                                    <p className="font-semibold text-slate-700">{selectedPatient.date_of_birth ? new Date(selectedPatient.date_of_birth).toLocaleDateString() : 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <MapPin size={16} className="text-theme-500 mt-1" />
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400">Address</p>
                                                    <p className="font-semibold text-slate-700">{selectedPatient.address || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* History Content */}
                                <div className="md:col-span-2">
                                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 min-h-full">
                                        <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                                            <Activity size={20} className="text-theme-500" /> Past Prescriptions & Notes
                                        </h3>
                                        
                                        {loadingHistory ? (
                                            <div className="flex justify-center items-center h-40">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-600"></div>
                                            </div>
                                        ) : patientHistory.length > 0 ? (
                                            <div className="space-y-4">
                                                {patientHistory.map((record, index) => (
                                                    <div key={index} className="p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-theme-50/50 hover:border-theme-100 transition-colors">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-theme-100 text-theme-700">
                                                                    {new Date(record.created_at).toLocaleDateString()}
                                                                </span>
                                                                <span className="text-sm font-bold text-slate-500">
                                                                    Dr. {record.doctor_first_name} {record.doctor_last_name}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {record.notes && (
                                                            <div className="mb-4">
                                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Diagnosis / Notes</p>
                                                                <p className="text-sm font-medium text-slate-700 italic bg-white p-3 rounded-xl border border-slate-100">{record.notes}</p>
                                                            </div>
                                                        )}
                                                        {record.items && record.items.length > 0 && (
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Medications</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {record.items.map((item, i) => (
                                                                        <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 shadow-sm">
                                                                            <span className="w-2 h-2 rounded-full bg-theme-400 mr-2"></span>
                                                                            {item.medicine_name} ({item.dosage})
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                                                <Activity size={32} className="mx-auto text-slate-300 mb-3" />
                                                <p className="text-slate-500 font-medium">No medical history or prescriptions found.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorPatients;

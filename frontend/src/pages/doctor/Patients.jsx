import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Search, UserCircle, Phone, Mail, MapPin, CalendarDays, User, Users, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorPatients = () => {
    const { token } = useContext(AuthContext);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [doctorId, setDoctorId] = useState(null);

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

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const res = await fetch(`http://localhost:5000/api/doctors/${doctorId}/patients`, {
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
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 to-teal-800 opacity-90"></div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-400 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
                
                <div className="relative p-8 z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-inner">
                                <Users className="text-emerald-300" size={24} />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight">My Patients</h1>
                        </div>
                        <p className="text-emerald-100/80 font-medium text-lg md:ml-16">
                            Directory of patients who have booked appointments with you.
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
                        <div className="absolute inset-0 border-4 border-emerald-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
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
                            <div key={patient.id} className="bg-white rounded-3xl shadow-sm hover:shadow-2xl border border-slate-100 transition-all duration-300 group relative overflow-hidden flex flex-col p-6">
                                {/* Decorative background */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -mr-10 -mt-10 transition-all group-hover:scale-150 group-hover:opacity-20"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center text-emerald-600 shadow-inner border border-emerald-100/50">
                                                <span className="text-xl font-black">{patient.first_name.charAt(0)}{patient.last_name.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-800">{patient.first_name} {patient.last_name}</h3>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold mt-1 bg-slate-100 text-slate-600">
                                                    ID: {patient.id}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <Phone size={18} className="text-emerald-500 mr-3" />
                                            <span className="font-semibold">{patient.phone || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <Mail size={18} className="text-teal-500 mr-3" />
                                            <span className="font-semibold truncate">{patient.email}</span>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-1 flex items-center text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <CalendarDays size={18} className="text-blue-500 mr-3" />
                                                <span className="font-semibold text-sm truncate">{patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <MapPin size={18} className="text-orange-500 mr-3" />
                                            <span className="font-semibold text-sm truncate">{patient.address || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto flex gap-3 border-t border-slate-100 pt-5">
                                        <button className="flex-1 flex items-center justify-center px-4 py-2.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl hover:bg-emerald-600 hover:text-white transition-colors group/btn">
                                            <Activity size={16} className="mr-2 group-hover/btn:animate-pulse" /> View History
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default DoctorPatients;

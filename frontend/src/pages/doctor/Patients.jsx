import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Search, UserCircle, Phone, Mail, MapPin, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorPatients = () => {
    const { token } = useContext(AuthContext);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:5000/api/patients', {
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
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Patients</h1>
                    <p className="text-gray-500 text-sm mt-1">Directory of all registered patients.</p>
                </div>
                
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name, email or phone..." 
                        className="pl-10 pr-4 py-2 w-full md:w-72 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPatients.length === 0 ? (
                        <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-gray-500">No patients found matching your search.</p>
                        </div>
                    ) : (
                        filteredPatients.map((patient) => (
                            <div key={patient.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-bl-full -mr-4 -mt-4 z-0 transition-transform group-hover:scale-110"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-bold text-xl shadow-inner border border-teal-200">
                                            {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg">{patient.first_name} {patient.last_name}</h3>
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-medium">
                                                ID: {patient.id}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <p className="flex items-center">
                                            <Phone size={14} className="mr-2 text-teal-500" /> 
                                            {patient.phone || 'N/A'}
                                        </p>
                                        <p className="flex items-center">
                                            <Mail size={14} className="mr-2 text-teal-500" /> 
                                            <span className="truncate">{patient.email}</span>
                                        </p>
                                        <p className="flex items-center">
                                            <MapPin size={14} className="mr-2 text-teal-500" /> 
                                            {patient.address || 'N/A'}
                                        </p>
                                        <p className="flex items-center">
                                            <CalendarDays size={14} className="mr-2 text-teal-500" /> 
                                            DOB: {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>

                                    <div className="mt-6 flex gap-2">
                                        <button className="flex-1 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-sm font-semibold transition-colors">
                                            View History
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

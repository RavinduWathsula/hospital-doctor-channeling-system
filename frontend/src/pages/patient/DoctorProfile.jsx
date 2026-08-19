import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { MapPin, Briefcase, DollarSign, Award, ArrowLeft, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    const [doctor, setDoctor] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/doctors/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setDoctor(data.data);
                } else {
                    toast.error(data.message || 'Doctor not found');
                    navigate('/doctors');
                }
            } catch {
                toast.error('Failed to load profile');
                navigate('/doctors');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDoctor();
    }, [id, token, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!doctor) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors font-medium"
                >
                    <ArrowLeft size={20} className="mr-2" /> Back to Search
                </button>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header Banner */}
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
                    
                    <div className="px-8 pb-8">
                        {/* Profile Image & Basic Info */}
                        <div className="flex flex-col md:flex-row relative -mt-16 sm:-mt-20 mb-8 items-center md:items-end">
                            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-full p-2 shadow-lg">
                                <div className="w-full h-full rounded-full bg-blue-50 overflow-hidden flex items-center justify-center">
                                    {doctor.profile_image ? (
                                        <img src={doctor.profile_image} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl sm:text-5xl font-bold text-blue-500">{doctor.first_name.charAt(0)}</span>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 md:mt-0 md:ml-6 flex-1 text-center md:text-left">
                                <h1 className="text-3xl font-bold text-gray-900">Dr. {doctor.first_name} {doctor.last_name}</h1>
                                <p className="text-lg text-blue-600 font-medium mt-1">{doctor.specialization}</p>
                                <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mt-3 text-sm text-gray-600 font-medium">
                                    <span className="flex items-center"><MapPin size={16} className="mr-1 text-gray-400" /> {doctor.department_name} Dept</span>
                                    <span className="flex items-center"><Award size={16} className="mr-1 text-gray-400" /> {doctor.registration_number}</span>
                                </div>
                            </div>
                            <div className="mt-6 md:mt-0">
                                <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 w-full md:w-auto flex items-center justify-center">
                                    <Calendar size={18} className="mr-2" /> Book Appointment
                                </button>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-8">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">About Doctor</h2>
                                    <p className="text-gray-600 leading-relaxed">
                                        {doctor.biography || "No biography provided for this doctor yet."}
                                    </p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <div className="text-gray-500 text-sm font-medium mb-1 flex items-center">
                                            <Award size={16} className="mr-2" /> Qualifications
                                        </div>
                                        <div className="font-semibold text-gray-900">{doctor.qualification}</div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <div className="text-gray-500 text-sm font-medium mb-1 flex items-center">
                                            <Briefcase size={16} className="mr-2" /> Experience
                                        </div>
                                        <div className="font-semibold text-gray-900">{doctor.experience_years} Years</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                                        <DollarSign size={20} className="text-blue-600 mr-2" /> Consultation Fee
                                    </h3>
                                    <div className="text-3xl font-extrabold text-blue-600 mb-1">${doctor.consultation_fee}</div>
                                    <p className="text-sm text-gray-500">Per standard consultation</p>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <h3 className="font-bold text-gray-900 mb-4">Availability Status</h3>
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full mr-3 ${doctor.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span className="font-medium text-gray-700">
                                            {doctor.is_active ? 'Currently accepting appointments' : 'Not available for booking'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { UserCircle, Mail, Phone, MapPin, Award, Stethoscope, CreditCard, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorProfile = () => {
    const { token, user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:5000/api/doctors/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data) {
                setProfile(data.data);
            } else {
                toast.error(data.message || 'Failed to fetch profile');
            }
        } catch (error) {
            toast.error('Server error fetching profile');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-500">Profile data not found.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header background */}
                <div className="h-32 bg-gradient-to-r from-teal-500 to-emerald-400 relative">
                    <button className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg backdrop-blur-sm transition-colors text-sm font-medium flex items-center">
                        <Camera size={16} className="mr-2" /> Change Cover
                    </button>
                </div>
                
                <div className="px-8 pb-8 relative">
                    {/* Avatar */}
                    <div className="flex justify-between items-end -mt-12 mb-6">
                        <div className="relative">
                            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md">
                                <div className="w-full h-full bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-bold text-3xl">
                                    {profile.first_name?.charAt(0)}{profile.last_name?.charAt(0)}
                                </div>
                            </div>
                        </div>
                        <button className="px-6 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl font-semibold transition-colors shadow-sm">
                            Edit Profile
                        </button>
                    </div>

                    {/* Name & Specialization */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Dr. {profile.first_name} {profile.last_name}</h2>
                        <p className="text-teal-600 font-medium flex items-center mt-1">
                            <Stethoscope size={16} className="mr-1" /> {profile.specialization || 'General Practitioner'}
                        </p>
                    </div>

                    <hr className="my-6 border-gray-100" />

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Professional Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Professional Information</h3>
                            
                            <div className="flex items-start">
                                <Award className="text-teal-500 mt-0.5 mr-3" size={18} />
                                <div>
                                    <p className="text-sm text-gray-500">Qualifications</p>
                                    <p className="font-medium text-gray-800">{profile.qualifications || 'N/A'}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start">
                                <CreditCard className="text-teal-500 mt-0.5 mr-3" size={18} />
                                <div>
                                    <p className="text-sm text-gray-500">Consultation Fee</p>
                                    <p className="font-medium text-gray-800">LKR {profile.consultation_fee || '0.00'}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start">
                                <UserCircle className="text-teal-500 mt-0.5 mr-3" size={18} />
                                <div>
                                    <p className="text-sm text-gray-500">Experience</p>
                                    <p className="font-medium text-gray-800">{profile.experience_years || '0'} Years</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Contact Information</h3>
                            
                            <div className="flex items-start">
                                <Mail className="text-teal-500 mt-0.5 mr-3" size={18} />
                                <div>
                                    <p className="text-sm text-gray-500">Email Address</p>
                                    <p className="font-medium text-gray-800">{user?.email || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Phone className="text-teal-500 mt-0.5 mr-3" size={18} />
                                <div>
                                    <p className="text-sm text-gray-500">Phone Number</p>
                                    <p className="font-medium text-gray-800">{profile.phone || 'N/A'}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start">
                                <MapPin className="text-teal-500 mt-0.5 mr-3" size={18} />
                                <div>
                                    <p className="text-sm text-gray-500">Department/Room</p>
                                    <p className="font-medium text-gray-800">{profile.department_id ? `Dept ID: ${profile.department_id}` : 'N/A'}</p>
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

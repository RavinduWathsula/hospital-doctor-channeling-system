import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { UserCircle, Mail, Phone, MapPin, Award, Stethoscope, CreditCard, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorProfile = () => {
    const { token, user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Password Change State
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordLoading, setPasswordLoading] = useState(false);
    
    // Edit Profile State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editData, setEditData] = useState({});
    const [editLoading, setEditLoading] = useState(false);

    // Cover Image State
    const [coverImage, setCoverImage] = useState(() => localStorage.getItem('doctor_cover_image'));

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

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error('New passwords do not match');
        }
        
        setPasswordLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/me/password', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });
            const data = await res.json();
            
            if (data.success) {
                toast.success('Password changed successfully');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                toast.error(data.message || 'Failed to change password');
            }
        } catch (error) {
            toast.error('Server error while changing password');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleEditProfile = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/doctors/me', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    phone: editData.phone,
                    specialization: editData.specialization,
                    qualification: editData.qualification,
                    experienceYears: editData.experience_years,
                    consultationFee: editData.consultation_fee
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Profile updated successfully');
                setIsEditModalOpen(false);
                fetchProfile();
            } else {
                toast.error(data.message || 'Failed to update profile');
            }
        } catch (error) {
            toast.error('Server error updating profile');
        } finally {
            setEditLoading(false);
        }
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                localStorage.setItem('doctor_cover_image', reader.result);
                setCoverImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const openEditModal = () => {
        setEditData({
            phone: profile.phone || '',
            specialization: profile.specialization || '',
            qualification: profile.qualification || '',
            experience_years: profile.experience_years || 0,
            consultation_fee: profile.consultation_fee || ''
        });
        setIsEditModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-500"></div>
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
                <div 
                    className="h-32 bg-gradient-to-r from-theme-500 to-theme-400 relative bg-cover bg-center"
                    style={coverImage ? { backgroundImage: `url(${coverImage})` } : {}}
                >
                    <label className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg backdrop-blur-sm transition-colors text-sm font-medium flex items-center cursor-pointer">
                        <Camera size={16} className="mr-2" /> Change Cover
                        <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                    </label>
                </div>
                
                <div className="px-8 pb-8 relative">
                    {/* Avatar */}
                    <div className="flex justify-between items-end -mt-12 mb-6">
                        <div className="relative">
                            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md">
                                <div className="w-full h-full bg-theme-100 text-theme-600 rounded-full flex items-center justify-center font-bold text-3xl">
                                    {profile.first_name?.charAt(0)}{profile.last_name?.charAt(0)}
                                </div>
                            </div>
                        </div>
                        <button onClick={openEditModal} className="px-6 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl font-semibold transition-colors shadow-sm">
                            Edit Profile
                        </button>
                    </div>

                    {/* Name & Specialization */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Dr. {profile.first_name} {profile.last_name}</h2>
                        <p className="text-theme-600 font-medium flex items-center mt-1">
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
                                <Award className="text-theme-500 mt-0.5 mr-3" size={18} />
                                <div>
                                    <p className="text-sm text-gray-500">Qualifications</p>
                                    <p className="font-medium text-gray-800">{profile.qualification || 'N/A'}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start">
                                <CreditCard className="text-theme-500 mt-0.5 mr-3" size={18} />
                                <div>
                                    <p className="text-sm text-gray-500">Consultation Fee</p>
                                    <p className="font-medium text-gray-800">LKR {profile.consultation_fee || '0.00'}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start">
                                <UserCircle className="text-theme-500 mt-0.5 mr-3" size={18} />
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
                                <Mail className="text-theme-500 mt-0.5 mr-3" size={18} />
                                <div>
                                    <p className="text-sm text-gray-500">Email Address</p>
                                    <p className="font-medium text-gray-800">{user?.email || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Phone className="text-theme-500 mt-0.5 mr-3" size={18} />
                                <div>
                                    <p className="text-sm text-gray-500">Phone Number</p>
                                    <p className="font-medium text-gray-800">{profile.phone || 'N/A'}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start">
                                <MapPin className="text-theme-500 mt-0.5 mr-3" size={18} />
                                <div>
                                    <p className="text-sm text-gray-500">Department/Room</p>
                                    <p className="font-medium text-gray-800">{profile.department_id ? `Dept ID: ${profile.department_id}` : 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Settings: Change Password */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                <div className="p-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Security Settings</h3>
                    <form onSubmit={handlePasswordChange} className="max-w-md space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                            <input 
                                type="password" 
                                required 
                                value={passwordData.currentPassword}
                                onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-500"
                                placeholder="Enter your current password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input 
                                type="password" 
                                required 
                                minLength="6"
                                value={passwordData.newPassword}
                                onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-500"
                                placeholder="Enter a new secure password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <input 
                                type="password" 
                                required 
                                minLength="6"
                                value={passwordData.confirmPassword}
                                onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-500"
                                placeholder="Confirm your new password"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={passwordLoading}
                            className="px-6 py-3 bg-theme-600 hover:bg-theme-700 text-white rounded-xl font-bold shadow-md shadow-theme-500/20 transition-all disabled:opacity-70"
                        >
                            {passwordLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 bg-gradient-to-r from-theme-600 to-theme-800 flex items-center justify-between text-white">
                            <h2 className="text-2xl font-black">Edit Profile</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                                <span className="font-bold">X</span>
                            </button>
                        </div>
                        <div className="p-8">
                            <form onSubmit={handleEditProfile} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Specialization</label>
                                        <input type="text" value={editData.specialization} onChange={e => setEditData({...editData, specialization: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-theme-500 outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
                                        <input type="text" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-theme-500 outline-none" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Qualifications</label>
                                    <input type="text" value={editData.qualification} onChange={e => setEditData({...editData, qualification: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-theme-500 outline-none" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Experience (Years)</label>
                                        <input type="number" min="0" value={editData.experience_years} onChange={e => setEditData({...editData, experience_years: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-theme-500 outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Consultation Fee (LKR)</label>
                                        <input type="number" min="0" step="0.01" value={editData.consultation_fee} onChange={e => setEditData({...editData, consultation_fee: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-theme-500 outline-none" required />
                                    </div>
                                </div>
                                
                                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-bold bg-white border border-slate-300 rounded-xl hover:bg-slate-50">Cancel</button>
                                    <button type="submit" disabled={editLoading} className="px-6 py-2.5 text-white font-bold bg-theme-600 rounded-xl hover:bg-theme-700 disabled:opacity-70">
                                        {editLoading ? 'Saving...' : 'Save Profile'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorProfile;

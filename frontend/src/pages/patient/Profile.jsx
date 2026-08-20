import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { UserCircle, Save, Key, Shield, User } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
    const { token, user, login } = useContext(AuthContext); // Note: updating context is tricky if we don't have update user function, we'll reload instead

    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        blood_group: '',
        address: '',
        emergency_contact: '',
        medical_history: ''
    });
    
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/patients/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success && data.data) {
                    // Format date string for input type="date"
                    const formattedDob = data.data.date_of_birth 
                        ? new Date(data.data.date_of_birth).toISOString().split('T')[0] 
                        : '';
                        
                    setProfile({
                        ...data.data,
                        date_of_birth: formattedDob
                    });
                }
            } catch (error) {
                toast.error('Failed to load profile data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [token]);

    const handleProfileChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = (e) => {
        setPasswords({
            ...passwords,
            [e.target.name]: e.target.value
        });
    };

    const submitProfile = async (e) => {
        e.preventDefault();
        setIsSavingProfile(true);
        try {
            const res = await fetch('http://localhost:5000/api/patients/me', {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profile)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Profile updated successfully');
                // Could update auth context here if user names changed
            } else {
                toast.error(data.message || 'Failed to update profile');
            }
        } catch (error) {
            toast.error('Network error while updating profile');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const submitPassword = async (e) => {
        e.preventDefault();
        
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        
        if (passwords.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsSavingPassword(true);
        try {
            const res = await fetch('http://localhost:5000/api/patients/me/password', {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Password changed successfully');
                setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                toast.error(data.message || 'Failed to change password');
            }
        } catch (error) {
            toast.error('Network error while changing password');
        } finally {
            setIsSavingPassword(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mr-5 shadow-sm">
                    <UserCircle size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                    <p className="text-gray-500 mt-1">Manage your personal information and security preferences.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Personal Information */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center mb-6 pb-4 border-b border-gray-100">
                            <User className="text-blue-600 mr-3" size={24} />
                            <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                        </div>
                        
                        <form onSubmit={submitProfile}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                    <input 
                                        type="text" name="first_name" required
                                        value={profile.first_name || ''} onChange={handleProfileChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                    <input 
                                        type="text" name="last_name" required
                                        value={profile.last_name || ''} onChange={handleProfileChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <input 
                                        type="email" disabled
                                        value={profile.email || ''} 
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                    <input 
                                        type="tel" name="phone"
                                        value={profile.phone || ''} onChange={handleProfileChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                                    <input 
                                        type="date" name="date_of_birth"
                                        value={profile.date_of_birth || ''} onChange={handleProfileChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                    <select 
                                        name="gender"
                                        value={profile.gender || ''} onChange={handleProfileChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                                    <select 
                                        name="blood_group"
                                        value={profile.blood_group || ''} onChange={handleProfileChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                                    >
                                        <option value="">Select Blood Group</option>
                                        <option value="A+">A+</option><option value="A-">A-</option>
                                        <option value="B+">B+</option><option value="B-">B-</option>
                                        <option value="AB+">AB+</option><option value="AB-">AB-</option>
                                        <option value="O+">O+</option><option value="O-">O-</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                                    <input 
                                        type="text" name="emergency_contact" placeholder="Name & Phone"
                                        value={profile.emergency_contact || ''} onChange={handleProfileChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                    <textarea 
                                        name="address" rows="2"
                                        value={profile.address || ''} onChange={handleProfileChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                                    ></textarea>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Medical History (Optional)</label>
                                    <textarea 
                                        name="medical_history" rows="3" placeholder="Any allergies, previous surgeries, or chronic conditions..."
                                        value={profile.medical_history || ''} onChange={handleProfileChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                                    ></textarea>
                                </div>
                            </div>
                            
                            <div className="flex justify-end pt-4 border-t border-gray-100">
                                <button 
                                    type="submit"
                                    disabled={isSavingProfile}
                                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 flex items-center transition-all disabled:opacity-70"
                                >
                                    {isSavingProfile ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    ) : (
                                        <Save size={18} className="mr-2" />
                                    )}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Security */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 sticky top-6">
                        <div className="flex items-center mb-6 pb-4 border-b border-gray-100">
                            <Shield className="text-green-600 mr-3" size={24} />
                            <h2 className="text-xl font-bold text-gray-900">Security</h2>
                        </div>
                        
                        <form onSubmit={submitPassword}>
                            <div className="space-y-5 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                    <input 
                                        type="password" name="currentPassword" required
                                        value={passwords.currentPassword} onChange={handlePasswordChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 bg-gray-50/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                    <input 
                                        type="password" name="newPassword" required minLength={6}
                                        value={passwords.newPassword} onChange={handlePasswordChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 bg-gray-50/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                    <input 
                                        type="password" name="confirmPassword" required minLength={6}
                                        value={passwords.confirmPassword} onChange={handlePasswordChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 bg-gray-50/50"
                                    />
                                </div>
                            </div>
                            
                            <button 
                                type="submit"
                                disabled={isSavingPassword || !passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword}
                                className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSavingPassword ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                ) : (
                                    <Key size={18} className="mr-2" />
                                )}
                                Update Password
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

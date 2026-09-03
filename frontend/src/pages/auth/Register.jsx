import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, Stethoscope, User } from 'lucide-react';

const Register = () => {
    const { register, error, isLoading, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [localError, setLocalError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [role, setRole] = useState('PATIENT');
    const [departments, setDepartments] = useState([]);
    
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
        nic: '', dateOfBirth: '', gender: '', phone: '', address: '', emergencyContact: '',
        registrationNumber: '', specialization: '', departmentId: '', qualification: '', experienceYears: '', consultationFee: ''
    });

    useEffect(() => {
        if (user) {
            const userRole = user.role?.toUpperCase()?.trim();
            switch (userRole) {
                case 'PATIENT': navigate('/patient/dashboard', { replace: true }); break;
                case 'DOCTOR': navigate('/doctor/dashboard', { replace: true }); break;
                case 'RECEPTIONIST': navigate('/reception/dashboard', { replace: true }); break;
                case 'ADMIN': navigate('/admin/dashboard', { replace: true }); break;
                default: navigate('/', { replace: true });
            }
        }
    }, [user, navigate]);

    useEffect(() => {
        if (role === 'DOCTOR' && departments.length === 0) {
            fetch('/api/departments')
                .then(res => res.json())
                .then(data => { if(data.success) setDepartments(data.data); })
                .catch(console.error);
        }
    }, [role, departments.length]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (formData.password !== formData.confirmPassword) {
            return setLocalError("Passwords do not match");
        }

        try {
            await register({ ...formData, role });
            // Redirect to login page to sign in manually
            navigate('/login');
        } catch (err) {
            setLocalError(err.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 py-12 relative font-sans selection:bg-blue-200">
            {/* Global Background Blurs */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/40 blur-[100px] animate-pulse"></div>
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/40 blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-cyan-400/40 blur-[100px] animate-pulse"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNFMkU4RjAiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PC9zdmc+')] opacity-60"></div>
            </div>
            <Link to="/" className="absolute top-6 left-6 md:top-10 md:left-10 text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2 font-semibold z-20 bg-white/70 backdrop-blur-xl px-5 py-2.5 rounded-full shadow-lg border border-white hover:shadow-xl hover:-translate-y-1 duration-300">
                <ArrowLeft size={18} />
                <span>Back to Home</span>
            </Link>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-3xl relative z-10 group"
            >
                {/* Pulsing glow behind the box */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 animate-pulse"></div>
                
                {/* Gradient Border Wrapper */}
                <div className="relative p-[2px] bg-gradient-to-br from-white via-blue-200 to-indigo-300 rounded-[2.5rem] shadow-2xl shadow-blue-900/20">
                    {/* Inner content box */}
                    <div className="bg-white/80 backdrop-blur-2xl rounded-[2.4rem] overflow-hidden w-full h-full relative z-10">
                        <div className="p-8 md:p-10">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create an Account</h2>
                                <p className="text-gray-500 mt-2">Join Smart Hospital to manage your healthcare journey</p>
                            </div>
                            
                            {/* Role Toggle */}
                            <div className="flex justify-center mb-10">
                                <div className="bg-slate-100 p-1.5 rounded-2xl inline-flex relative shadow-inner">
                                    <button
                                        type="button"
                                        onClick={() => setRole('PATIENT')}
                                        className={`relative z-10 flex items-center px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${role === 'PATIENT' ? 'text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <User size={18} className="mr-2" /> Patient
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('DOCTOR')}
                                        className={`relative z-10 flex items-center px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${role === 'DOCTOR' ? 'text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <Stethoscope size={18} className="mr-2" /> Doctor
                                    </button>
                                    {/* Animated Pill */}
                                    <div 
                                        className="absolute top-1.5 bottom-1.5 w-1/2 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-out z-0"
                                        style={{ transform: role === 'PATIENT' ? 'translateX(0)' : 'translateX(100%)', left: '6px', width: 'calc(50% - 6px)' }}
                                    ></div>
                                </div>
                            </div>

                            {(error || localError) && (
                                <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100 flex items-center">
                                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                    {localError || error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Personal Details - Common */}
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Personal Details</h3>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                                <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                                                <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                            </div>
                                        </div>

                                        {role === 'PATIENT' ? (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">NIC *</label>
                                                    <input type="text" name="nic" required value={formData.nic} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                                        <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                                        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                            <option value="">Select</option>
                                                            <option value="MALE">Male</option>
                                                            <option value="FEMALE">Female</option>
                                                            <option value="OTHER">Other</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Medical Reg No. *</label>
                                                    <input type="text" name="registrationNumber" required value={formData.registrationNumber} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialization *</label>
                                                    <input type="text" name="specialization" required value={formData.specialization} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Cardiologist" />
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Account & Contact Details - Common */}
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Account & Contact</h3>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                                            <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                                                <div className="relative">
                                                    <input type={showPassword ? "text" : "password"} name="password" minLength="6" required value={formData.password} onChange={handleChange} className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors">
                                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                                                <div className="relative">
                                                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" minLength="6" required value={formData.confirmPassword} onChange={handleChange} className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors">
                                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                                                <input type="text" name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                            </div>
                                            {role === 'PATIENT' ? (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                                                    <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                                </div>
                                            ) : (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                                                    <select name="departmentId" required value={formData.departmentId} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                        <option value="">Select Department</option>
                                                        {departments.map(dept => (
                                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {role === 'DOCTOR' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years) *</label>
                                                <input type="number" name="experienceYears" required min="0" value={formData.experienceYears} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Consult Fee ($) *</label>
                                                <input type="number" name="consultationFee" required min="0" step="0.01" value={formData.consultationFee} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications</label>
                                            <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. MBBS, MD" />
                                        </div>
                                    </div>
                                )}

                                {role === 'PATIENT' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                        <textarea name="address" rows="2" value={formData.address} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                                    </div>
                                )}

                                <div className="pt-4 border-t">
                                    <button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 transform transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'Registering...' : `Register as ${role === 'DOCTOR' ? 'Doctor' : 'Patient'}`}
                                    </button>
                                </div>
                            </form>

                            <div className="mt-8 text-center text-sm text-gray-500">
                                Already have an account? <Link to="/login" className="font-bold text-blue-600 hover:text-blue-800 transition-colors">Sign In here</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;

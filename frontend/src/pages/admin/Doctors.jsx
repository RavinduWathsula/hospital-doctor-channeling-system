import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Plus, X, Search, ShieldCheck, UserPlus, Stethoscope, BadgeDollarSign, Building2, CheckCircle, XCircle, Sparkles, Star, HeartPulse } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Doctors = () => {
    const { token } = useContext(AuthContext);
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDocId, setCurrentDocId] = useState(null);
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    
    // Form state
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: '', phone: '', profileImage: '',
        registrationNumber: '', specialization: '', departmentId: '', qualification: '',
        experienceYears: '', consultationFee: '', biography: ''
    });

    useEffect(() => {
        fetchDoctors();
        fetchDepartments();
    }, []);

    const fetchDoctors = () => {
        setIsLoading(true);
        fetch('http://localhost:5000/api/doctors', { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => { if(data.success) setDoctors(data.data); })
            .catch(() => toast.error('Error fetching doctors'))
            .finally(() => setIsLoading(false));
    };

    const fetchDepartments = () => {
        fetch('http://localhost:5000/api/departments', { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => { if(data.success) setDepartments(data.data); })
            .catch(() => toast.error('Error fetching departments'));
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            const res = await fetch(`http://localhost:5000/api/doctors/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            const data = await res.json();
            if(data.success) {
                toast.success('Doctor status updated');
                setDoctors(doctors.map(d => d.id === id ? { ...d, is_active: !currentStatus } : d));
            } else toast.error(data.message);
        } catch { toast.error('Error updating status'); }
    };

    const openModal = (doc = null) => {
        if (doc) {
            setCurrentDocId(doc.id);
            setProfileImagePreview(doc.profile_image || null);
            setProfileImageFile(null);
            setFormData({
                firstName: doc.first_name || '', lastName: doc.last_name || '', email: doc.email || '', 
                password: '', phone: doc.phone || '', profileImage: doc.profile_image || '',
                registrationNumber: doc.registration_number || '', specialization: doc.specialization || '', 
                departmentId: doc.department_id || '', qualification: doc.qualification || '',
                experienceYears: doc.experience_years || '', consultationFee: doc.consultation_fee || '', biography: doc.biography || ''
            });
        } else {
            setCurrentDocId(null);
            setProfileImagePreview(null);
            setProfileImageFile(null);
            setFormData({
                firstName: '', lastName: '', email: '', password: '', phone: '', profileImage: '',
                registrationNumber: '', specialization: '', departmentId: '', qualification: '',
                experienceYears: '', consultationFee: '', biography: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImageFile(file);
            setProfileImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = currentDocId ? 'PUT' : 'POST';
            const url = currentDocId ? `http://localhost:5000/api/doctors/${currentDocId}` : 'http://localhost:5000/api/doctors';
            
            const payload = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'password' && currentDocId && !formData[key]) return; // Skip empty password on update
                if (key !== 'profileImage') payload.append(key, formData[key]);
            });
            
            if (profileImageFile) {
                payload.append('profileImage', profileImageFile);
            }

            const res = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${token}` }, // Browser automatically sets Content-Type to multipart/form-data with boundary
                body: payload
            });
            const data = await res.json();
            if(data.success) {
                toast.success(`Doctor ${currentDocId ? 'updated' : 'created'} successfully`);
                setIsModalOpen(false);
                fetchDoctors();
            } else {
                toast.error(data.message || `Error ${currentDocId ? 'updating' : 'creating'} doctor`);
            }
        } catch {
            toast.error('Server error');
        }
    };

    const filtered = doctors.filter(d => (d.first_name + ' ' + d.last_name + ' ' + d.specialization + ' ' + d.registration_number).toLowerCase().includes(search.toLowerCase()));

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 mr-4">
                            <Stethoscope size={24} />
                        </div>
                        Medical Staff Directory
                    </h1>
                    <p className="text-slate-500 font-medium mt-2">Manage hospital medical professionals, specialties, and access.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search size={18} className="text-slate-400" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search doctors..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                            className="w-full sm:w-80 pl-11 pr-4 py-3 bg-white/70 backdrop-blur-xl border border-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)]" 
                        />
                    </div>
                    <button 
                        onClick={() => openModal()} 
                        className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:-translate-y-0.5"
                    >
                        <UserPlus size={20} className="mr-2" /> Add Doctor
                    </button>
                </div>
            </div>

            {/* Doctors Grid */}
            {isLoading ? (
                <div className="p-20 text-center">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-bold tracking-wide">Loading directory...</p>
                </div>
            ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-white/50 backdrop-blur-xl border border-white border-dashed rounded-[3rem] shadow-sm">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Stethoscope size={32} className="text-slate-400" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-700 tracking-tight mb-2">No Doctors Found</h3>
                            <p className="text-slate-500 font-medium">Try adjusting your search criteria.</p>
                        </div>
                    ) : filtered.map(doctor => (
                        <motion.div variants={cardVariants} key={doctor.id} className="bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group flex flex-col relative overflow-hidden border border-slate-200 hover:border-indigo-200">
                            {/* Colorful Accent Top Border */}
                            <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${doctor.is_active ? 'from-blue-500 to-indigo-500' : 'from-rose-400 to-pink-500'}`}></div>
                            
                            {/* Soft Gradient Background Element */}
                            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl group-hover:bg-indigo-100 transition-colors duration-500"></div>
                            
                            {/* Header: Avatar & Name */}
                            <div className="flex items-start justify-between mb-6 relative z-10 pt-2">
                                <div className="flex items-center">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center text-indigo-600 font-black text-2xl shadow-sm border border-indigo-100/50 mr-4 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                                            {doctor.profile_image ? (
                                                <img src={doctor.profile_image} alt="Doctor" className="w-full h-full object-cover" />
                                            ) : (
                                                doctor.first_name.charAt(0)
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">Dr. {doctor.first_name} {doctor.last_name}</h3>
                                        <p className="text-xs font-bold text-indigo-700 bg-indigo-100/60 px-2.5 py-1 rounded-lg inline-block mt-1.5 border border-indigo-200">{doctor.specialization}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Doctor Details Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-6 relative z-10 flex-1">
                                <div className="flex items-center text-sm font-bold text-slate-700 bg-blue-50/80 px-4 py-3 rounded-2xl border border-blue-200/60 hover:bg-blue-100 transition-colors">
                                    <Building2 size={16} className="text-blue-500 mr-2.5" />
                                    {doctor.department_name || 'N/A'}
                                </div>
                                <div className="flex items-center text-sm font-bold text-slate-700 bg-emerald-50/80 px-4 py-3 rounded-2xl border border-emerald-200/60 hover:bg-emerald-100 transition-colors">
                                    <BadgeDollarSign size={16} className="text-emerald-500 mr-2.5" />
                                    ${parseFloat(doctor.consultation_fee).toFixed(2)}
                                </div>
                                <div className="flex items-center text-sm font-bold text-slate-700 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200 col-span-2 hover:bg-slate-100 transition-colors">
                                    <ShieldCheck size={16} className="text-slate-400 mr-2.5" />
                                    Reg No: <span className="text-slate-900 ml-1.5 bg-white px-2 py-0.5 rounded border border-slate-200">{doctor.registration_number}</span>
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="pt-5 mt-auto border-t border-slate-100 relative z-10 flex justify-between items-center">
                                <div className={`flex items-center px-3 py-1.5 rounded-full border bg-white ${doctor.is_active ? 'border-emerald-200' : 'border-rose-200'}`}>
                                    <div className="relative flex h-2.5 w-2.5 mr-2.5">
                                      {doctor.is_active ? (
                                          <>
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                          </>
                                      ) : (
                                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                                      )}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${doctor.is_active ? 'text-emerald-700' : 'text-rose-700'}`}>
                                        {doctor.is_active ? 'Active' : 'Suspended'}
                                    </span>
                                </div>
                                <div className="flex space-x-2">
                                    <button 
                                        onClick={() => openModal(doctor)}
                                        className="group relative overflow-hidden px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm flex items-center bg-white text-indigo-600 border border-indigo-200 hover:border-indigo-300 hover:shadow-md"
                                    >
                                        <div className="absolute inset-0 w-0 bg-indigo-50 transition-all duration-300 ease-out group-hover:w-full"></div>
                                        <span className="relative z-10">Edit</span>
                                    </button>
                                    <button 
                                        onClick={() => toggleStatus(doctor.id, doctor.is_active)}
                                        className={`group relative overflow-hidden px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm flex items-center border ${
                                            doctor.is_active 
                                            ? 'bg-white text-rose-600 border-rose-200 hover:border-rose-300 hover:shadow-md' 
                                            : 'bg-white text-emerald-600 border-emerald-200 hover:border-emerald-300 hover:shadow-md'
                                        }`}
                                    >
                                        <div className={`absolute inset-0 w-0 transition-all duration-300 ease-out group-hover:w-full ${
                                            doctor.is_active ? 'bg-rose-50' : 'bg-emerald-50'
                                        }`}></div>
                                        <div className="relative flex items-center z-10">
                                            {doctor.is_active ? (
                                                <>
                                                    <XCircle size={16} className="mr-1.5 transition-transform duration-300 group-hover:rotate-90" />
                                                    <span>Deactivate</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle size={16} className="mr-1.5 transition-transform duration-300 group-hover:scale-110" />
                                                    <span>Activate</span>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Split-Layout Premium Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"></motion.div>
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl flex flex-col md:flex-row relative z-10 overflow-hidden h-[90vh] md:h-[80vh]"
                        >
                            {/* Left Side: Gradient Banner */}
                            <div className="w-full md:w-2/5 bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 p-12 text-white flex flex-col relative overflow-hidden hidden md:flex">
                                <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
                                
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-lg">
                                        <Sparkles size={32} className="text-white" />
                                    </div>
                                    <h2 className="text-4xl font-black mb-4 tracking-tight leading-tight">Onboard a New Specialist</h2>
                                    <p className="text-indigo-100 font-medium text-lg mb-12">Expand your hospital's capabilities by adding top-tier medical talent to the directory.</p>
                                    
                                    <div className="space-y-6">
                                        <div className="flex items-start">
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-4 shrink-0">
                                                <ShieldCheck size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold">Instant System Access</h4>
                                                <p className="text-sm text-indigo-200 mt-1">They will securely receive their credentials via email.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-4 shrink-0">
                                                <UserPlus size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold">Global Directory Sync</h4>
                                                <p className="text-sm text-indigo-200 mt-1">Their profile instantly appears on the patient booking portal.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Form */}
                            <div className="w-full md:w-3/5 flex flex-col bg-white">
                                <div className="flex justify-between items-center p-8 border-b border-slate-100 bg-white sticky top-0 z-20">
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight md:hidden">Onboard Specialist</h2>
                                    <div className="hidden md:block">
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Step 1 of 1</p>
                                        <p className="text-lg font-black text-slate-800">Complete Profile Details</p>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shadow-sm">
                                        <X size={20} />
                                    </button>
                                </div>
                                
                                <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                                    <form id="addDoctorForm" onSubmit={handleSubmit} className="space-y-8">
                                        
                                        {/* Avatar Preview Upload Section */}
                                        <div className="flex items-center space-x-6 pb-8 border-b border-slate-100">
                                            <label className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center flex-col cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors group overflow-hidden relative">
                                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                                {profileImagePreview ? (
                                                    <img src={profileImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <>
                                                        <UserPlus size={24} className="text-slate-400 group-hover:text-indigo-500 mb-1" />
                                                        <span className="text-[10px] font-bold text-slate-500 group-hover:text-indigo-600 uppercase tracking-wider">Upload</span>
                                                    </>
                                                )}
                                            </label>
                                            <div>
                                                <h3 className="font-black text-slate-800 text-lg">Profile Picture</h3>
                                                <p className="text-sm font-medium text-slate-500 mb-2">A professional photo helps patients trust their doctor.</p>
                                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">Optional</span>
                                            </div>
                                        </div>

                                        {/* Core Details */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">First Name *</label>
                                                <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-700" placeholder="John" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Last Name *</label>
                                                <input type="text" name="lastName" required value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-700" placeholder="Doe" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Email (Login ID) *</label>
                                                <input type="email" name="email" required autoComplete="off" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-700" placeholder="dr.doe@hospital.com" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Contact Phone *</label>
                                                <input type="text" name="phone" required value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-700" placeholder="+1 (555) 000-0000" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">
                                                    {currentDocId ? 'New Password (leave blank to keep current)' : 'Temporary Password *'}
                                                </label>
                                                <input type="password" name="password" required={!currentDocId} autoComplete="new-password" value={formData.password} onChange={handleInputChange} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-700" placeholder={currentDocId ? "Enter new password..." : "Provide a secure initial password..."} />
                                            </div>
                                        </div>

                                        {/* Professional Details */}
                                        <div className="pt-6 border-t border-slate-100">
                                            <div className="flex items-center mb-6">
                                                <HeartPulse className="text-indigo-500 mr-2" size={20} />
                                                <h3 className="font-black text-slate-800 text-lg">Professional Credentials</h3>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="md:col-span-2">
                                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Department *</label>
                                                    <select name="departmentId" required value={formData.departmentId} onChange={handleInputChange} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-700">
                                                        <option value="">Select Department...</option>
                                                        {departments.filter(d => d.is_active).map(dept => (
                                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Specialization *</label>
                                                    <input type="text" name="specialization" required value={formData.specialization} onChange={handleInputChange} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-700" placeholder="e.g. Chief Surgeon" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Medical Reg No. *</label>
                                                    <input type="text" name="registrationNumber" required value={formData.registrationNumber} onChange={handleInputChange} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-700" placeholder="MED-12345" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Consult Fee ($) *</label>
                                                    <input type="number" name="consultationFee" required min="0" step="0.01" value={formData.consultationFee} onChange={handleInputChange} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-700" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Years Experience</label>
                                                    <input type="number" name="experienceYears" min="0" value={formData.experienceYears} onChange={handleInputChange} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-700" />
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                
                                <div className="p-6 border-t border-slate-100 bg-white flex justify-end space-x-4 sticky bottom-0 z-20">
                                    <button onClick={() => setIsModalOpen(false)} className="px-6 py-4 text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 font-bold transition-colors">Cancel</button>
                                    <button type="submit" form="addDoctorForm" className="px-8 py-4 text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 font-bold shadow-xl shadow-indigo-600/30 transition-all hover:-translate-y-1">
                                        {currentDocId ? 'Save Changes' : 'Register Doctor'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Doctors;

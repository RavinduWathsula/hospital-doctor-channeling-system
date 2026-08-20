import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Plus, X, Search, ShieldCheck, UserPlus, FileText, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import StateWrapper from '../../components/ui/StateWrapper';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Doctors = () => {
    const { token } = useContext(AuthContext);
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
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
                fetchDoctors();
            } else toast.error(data.message);
        } catch { toast.error('Error updating status'); }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/doctors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if(data.success) {
                toast.success('Doctor created successfully');
                setIsModalOpen(false);
                fetchDoctors();
                setFormData({
                    firstName: '', lastName: '', email: '', password: '', phone: '', profileImage: '',
                    registrationNumber: '', specialization: '', departmentId: '', qualification: '',
                    experienceYears: '', consultationFee: '', biography: ''
                });
            } else {
                toast.error(data.message || 'Error creating doctor');
            }
        } catch {
            toast.error('Server error');
        }
    };

    const filtered = doctors.filter(d => (d.first_name + ' ' + d.last_name + ' ' + d.specialization + ' ' + d.registration_number).toLowerCase().includes(search.toLowerCase()));

    const tableVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const rowVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Doctors Directory</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage hospital medical staff, specialties, and access.</p>
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
                            className="w-full sm:w-64 pl-11 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm" 
                        />
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:-translate-y-0.5"
                    >
                        <UserPlus size={20} className="mr-2" /> Add Doctor
                    </button>
                </div>
            </div>

            {/* Main Table Container */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden relative">
                
                {isLoading ? (
                    <div className="p-12 text-center">
                        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-500 font-medium">Loading doctors directory...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50/50 backdrop-blur-md text-slate-500 uppercase tracking-widest text-xs font-bold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-5">Profile</th>
                                    <th className="px-6 py-5">Name & Specialization</th>
                                    <th className="px-6 py-5">Reg. No</th>
                                    <th className="px-6 py-5">Department</th>
                                    <th className="px-6 py-5">Fee</th>
                                    <th className="px-6 py-5">Status</th>
                                    <th className="px-6 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <motion.tbody 
                                variants={tableVariants}
                                initial="hidden"
                                animate="show"
                            >
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-16 text-center">
                                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner rotate-3">
                                                <Search size={32} className="text-slate-400" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-800 mb-1">No doctors found</h3>
                                            <p className="text-slate-500">There are no doctors matching your current search criteria.</p>
                                        </td>
                                    </tr>
                                ) : filtered.map(d => (
                                    <motion.tr variants={rowVariants} key={d.id} className="border-b border-slate-50 hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-50 overflow-hidden shadow-sm border border-indigo-50 flex items-center justify-center">
                                                {d.profile_image ? (
                                                    <img src={d.profile_image} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-lg font-black text-indigo-700">{d.first_name.charAt(0)}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800 text-base mb-0.5 group-hover:text-indigo-600 transition-colors">Dr. {d.first_name} {d.last_name}</div>
                                            <div className="text-slate-500 text-xs font-semibold">{d.specialization}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-600">
                                            <span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs border border-slate-200">{d.registration_number}</span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-700">{d.department_name}</td>
                                        <td className="px-6 py-4 font-bold text-emerald-600">${parseFloat(d.consultation_fee).toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${
                                                d.is_active 
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                                                : 'bg-rose-50 text-rose-600 border border-rose-200'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${d.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                                {d.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => toggleStatus(d.id, d.is_active)} 
                                                className={`inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                                    d.is_active 
                                                    ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 hover:shadow-md' 
                                                    : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:shadow-md'
                                                }`}
                                            >
                                                {d.is_active ? (
                                                    <><XCircle size={16} className="mr-1.5" /> Deactivate</>
                                                ) : (
                                                    <><CheckCircle size={16} className="mr-1.5" /> Activate</>
                                                )}
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </motion.tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Premium Add Doctor Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        ></motion.div>
                        
                        {/* Modal Dialog */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.5, bounce: 0 }}
                            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative z-10 border border-slate-100"
                        >
                            <div className="flex justify-between items-center p-8 border-b border-slate-100 bg-slate-50/50">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 shadow-inner">
                                            <UserPlus size={20} />
                                        </div>
                                        Add New Doctor
                                    </h2>
                                    <p className="text-slate-500 text-sm mt-1 ml-13">Create a new medical staff profile and grant portal access.</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shadow-sm">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="p-8 overflow-y-auto custom-scrollbar">
                                <form id="doctorForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                                    {/* Personal Info */}
                                    <div className="space-y-5">
                                        <h3 className="font-bold text-indigo-900 uppercase tracking-widest text-xs flex items-center">
                                            <span className="w-6 h-px bg-indigo-200 mr-2"></span> Personal Details
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">First Name *</label>
                                                <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Last Name *</label>
                                                <input type="text" name="lastName" required value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Email Address *</label>
                                            <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Initial Password *</label>
                                            <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Phone Number</label>
                                            <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none" />
                                        </div>
                                    </div>

                                    {/* Professional Info */}
                                    <div className="space-y-5">
                                        <h3 className="font-bold text-indigo-900 uppercase tracking-widest text-xs flex items-center">
                                            <span className="w-6 h-px bg-indigo-200 mr-2"></span> Professional Details
                                        </h3>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Registration Number *</label>
                                            <input type="text" name="registrationNumber" required value={formData.registrationNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Department *</label>
                                            <select name="departmentId" required value={formData.departmentId} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none">
                                                <option value="">Select Department</option>
                                                {departments.map(dep => (
                                                    <option key={dep.id} value={dep.id}>{dep.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Specialization & Qualification *</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <input type="text" name="specialization" required value={formData.specialization} onChange={handleInputChange} placeholder="Cardiology" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none" />
                                                <input type="text" name="qualification" required value={formData.qualification} onChange={handleInputChange} placeholder="MBBS, MD" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Experience (Years) *</label>
                                                <input type="number" name="experienceYears" required min="0" value={formData.experienceYears} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Consultation Fee ($) *</label>
                                                <input type="number" name="consultationFee" required min="0" step="0.01" value={formData.consultationFee} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            
                            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-4">
                                <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 font-bold transition-colors shadow-sm">Cancel</button>
                                <button type="submit" form="doctorForm" className="px-8 py-3 text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 font-bold shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5">Create Profile</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
export default Doctors;

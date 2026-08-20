import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Building, Plus, X, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Departments = () => {
    const { token } = useContext(AuthContext);
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentDept, setCurrentDept] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', isActive: true });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = () => {
        setIsLoading(true);
        fetch('http://localhost:5000/api/departments', { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => { if(data.success) setDepartments(data.data); })
            .catch(() => toast.error('Error fetching departments'))
            .finally(() => setIsLoading(false));
    };

    const openModal = (dept = null) => {
        if(dept) {
            setCurrentDept(dept);
            setFormData({ name: dept.name, description: dept.description, isActive: dept.is_active });
        } else {
            setCurrentDept(null);
            setFormData({ name: '', description: '', isActive: true });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = currentDept ? 'PUT' : 'POST';
            const url = currentDept ? `http://localhost:5000/api/departments/${currentDept.id}` : 'http://localhost:5000/api/departments';
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            if(data.success) {
                toast.success(data.message);
                setIsModalOpen(false);
                fetchDepartments();
            } else {
                toast.error(data.message);
            }
        } catch { toast.error('Error saving department'); }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        show: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
                        <Building className="text-blue-600 mr-3" size={32} /> Hospital Departments
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Manage hospital wings, specialties, and clinics.</p>
                </div>
                
                <button 
                    onClick={() => openModal()} 
                    className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-0.5"
                >
                    <Plus size={20} className="mr-2" /> Add Department
                </button>
            </div>

            {/* Main Content */}
            {isLoading ? (
                <div className="p-12 text-center bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-white">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium">Loading hospital structure...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {departments.map((dept, index) => (
                        <motion.div 
                            variants={cardVariants}
                            initial="hidden"
                            animate="show"
                            key={dept.id} 
                            transition={{ delay: index * 0.05 }}
                            className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all group flex flex-col h-full"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-50">
                                    <Building size={24} />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${dept.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                    {dept.is_active ? 'OPERATIONAL' : 'CLOSED'}
                                </span>
                            </div>
                            
                            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">{dept.name}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">
                                {dept.description || 'No description provided for this department. Please update to add details regarding specialties.'}
                            </p>
                            
                            <div className="pt-4 border-t border-slate-100/60 mt-auto">
                                <button 
                                    onClick={() => openModal(dept)}
                                    className="w-full py-3 rounded-xl bg-slate-50 text-slate-600 font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center justify-center border border-slate-100"
                                >
                                    <Edit2 size={16} className="mr-2" /> Manage Structure
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        ></motion.div>
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.5, bounce: 0 }}
                            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg flex flex-col relative z-10 border border-slate-100 overflow-hidden"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                                <div>
                                    <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3 shadow-inner">
                                            <Building size={16} />
                                        </div>
                                        {currentDept ? 'Edit Department' : 'New Department'}
                                    </h2>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                            
                            <div className="p-6">
                                <form id="deptForm" onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Department Name *</label>
                                        <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none" placeholder="e.g. Cardiology" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Description</label>
                                        <textarea rows="4" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none resize-none" placeholder="Describe the specialties..." />
                                    </div>
                                    <div className="flex items-center mt-2">
                                        <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                                        <label htmlFor="isActive" className="ml-2 text-sm font-bold text-slate-700">Department is Operational</label>
                                    </div>
                                </form>
                            </div>
                            
                            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
                                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 font-bold transition-colors">Cancel</button>
                                <button type="submit" form="deptForm" className="px-5 py-2.5 text-white bg-blue-600 rounded-xl hover:bg-blue-500 font-bold shadow-md shadow-blue-600/20 transition-all">Save Department</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Departments;

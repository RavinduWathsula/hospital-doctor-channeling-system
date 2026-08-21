import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Building, Plus, X, Edit2, HeartPulse, Brain, Baby, Activity, Eye, Sparkles, Stethoscope, BriefcaseMedical, Users, Calendar, Clock, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const getDeptStyling = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('cardio')) return { Icon: HeartPulse, color: 'text-rose-600', bg: 'bg-rose-100', border: 'border-rose-200', gradient: 'from-rose-400 to-pink-500' };
    if (lower.includes('neuro')) return { Icon: Brain, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200', gradient: 'from-purple-400 to-violet-500' };
    if (lower.includes('pedia')) return { Icon: Baby, color: 'text-sky-600', bg: 'bg-sky-100', border: 'border-sky-200', gradient: 'from-sky-400 to-cyan-500' };
    if (lower.includes('ortho')) return { Icon: Activity, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200', gradient: 'from-amber-400 to-orange-500' };
    if (lower.includes('derma')) return { Icon: Sparkles, color: 'text-pink-600', bg: 'bg-pink-100', border: 'border-pink-200', gradient: 'from-pink-400 to-rose-400' };
    if (lower.includes('ophthalm')) return { Icon: Eye, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200', gradient: 'from-emerald-400 to-teal-500' };
    if (lower.includes('dentist')) return { Icon: BriefcaseMedical, color: 'text-teal-600', bg: 'bg-teal-100', border: 'border-teal-200', gradient: 'from-teal-400 to-emerald-500' };
    if (lower.includes('psychiatry')) return { Icon: Brain, color: 'text-indigo-600', bg: 'bg-indigo-100', border: 'border-indigo-200', gradient: 'from-indigo-400 to-blue-500' };
    
    // Default
    return { Icon: Building, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200', gradient: 'from-blue-500 to-indigo-500' };
};
const Departments = () => {
    const { token } = useContext(AuthContext);
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Add/Edit Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentDept, setCurrentDept] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', isActive: true });

    // Details Drawer State
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [viewingDept, setViewingDept] = useState(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [deptStats, setDeptStats] = useState(null);
    const [deptDoctors, setDeptDoctors] = useState([]);
    const [deptSchedules, setDeptSchedules] = useState([]);

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

    const fetchDepartmentDetails = async (dept) => {
        setViewingDept(dept);
        setIsDetailsOpen(true);
        setIsLoadingDetails(true);
        try {
            const [statsRes, docsRes, schedsRes] = await Promise.all([
                fetch(`http://localhost:5000/api/reports/analytics?departmentId=${dept.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://localhost:5000/api/doctors', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://localhost:5000/api/schedules', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            const statsData = await statsRes.json();
            const docsData = await docsRes.json();
            const schedsData = await schedsRes.json();

            if (statsData.success) {
                setDeptStats(statsData.data);
            }
            
            let filteredDocs = [];
            if (docsData.success) {
                filteredDocs = docsData.data.filter(d => d.department_id === dept.id);
                setDeptDoctors(filteredDocs);
            }

            if (schedsData.success) {
                // Filter schedules to only include doctors in this department
                const docIds = filteredDocs.map(d => d.id);
                setDeptSchedules(schedsData.data.filter(s => docIds.includes(s.doctor_id)));
            }

        } catch (error) {
            toast.error('Error loading department details');
        } finally {
            setIsLoadingDetails(false);
        }
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
                    {departments.map((dept, index) => {
                        const style = getDeptStyling(dept.name);
                        const { Icon } = style;
                        return (
                            <motion.div 
                                variants={cardVariants}
                                initial="hidden"
                                animate="show"
                                key={dept.id} 
                                transition={{ delay: index * 0.05 }}
                                onClick={() => fetchDepartmentDetails(dept)}
                                className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 group flex flex-col h-full relative overflow-hidden cursor-pointer"
                            >
                                {/* Colorful Accent Top Border */}
                                <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${style.gradient} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
                                
                                {/* Background Glow */}
                                <div className={`absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${style.bg}`}></div>
                                
                                <div className="flex items-start justify-between mb-4 relative z-10 pt-2">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border ${style.bg} ${style.color} ${style.border} group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon size={26} />
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${dept.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                        {dept.is_active ? 'Operational' : 'Closed'}
                                    </span>
                                </div>
                                
                                <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2 relative z-10 group-hover:text-slate-900">{dept.name}</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 flex-1 relative z-10">
                                    {dept.description || 'No description provided for this department. Please update to add details regarding specialties.'}
                                </p>
                                
                                <div className="pt-4 border-t border-slate-100 relative z-10 mt-auto">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openModal(dept);
                                        }}
                                        className="w-full py-3.5 rounded-xl bg-white text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-center border border-slate-200 hover:border-slate-300 shadow-sm"
                                    >
                                        <Edit2 size={16} className="mr-2" /> Manage Structure
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
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

            {/* Department Details Side Drawer */}
            <AnimatePresence>
                {isDetailsOpen && viewingDept && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsDetailsOpen(false)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40"
                        ></motion.div>
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 250 }}
                            className="fixed inset-y-0 right-0 w-full max-w-2xl bg-[#f8fafc] shadow-[auto_0_50px_rgba(0,0,0,0.2)] z-50 flex flex-col border-l border-white overflow-hidden"
                        >
                            {(() => {
                                const style = getDeptStyling(viewingDept.name);
                                const { Icon } = style;
                                return (
                                    <>
                                        {/* Premium Drawer Header with Mesh Gradient feel */}
                                        <div className={`pt-12 pb-24 px-10 bg-gradient-to-br ${style.gradient} text-white relative overflow-hidden shrink-0 shadow-inner`}>
                                            {/* Decorative Background Elements */}
                                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/20 rounded-full blur-3xl -mr-32 -mt-32 mix-blend-overlay"></div>
                                            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-black/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
                                            
                                            <div className="relative z-10 flex justify-between items-start">
                                                <div className="flex items-center">
                                                    <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center mr-6 border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                                                        <Icon size={40} className="text-white drop-shadow-md" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-4xl font-black tracking-tighter drop-shadow-sm mb-1">{viewingDept.name}</h2>
                                                        <div className="flex items-center space-x-3 mt-2">
                                                            <span className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black tracking-widest border border-white/30 uppercase shadow-sm">
                                                                <span className={`w-2 h-2 rounded-full bg-white mr-2 ${viewingDept.is_active ? 'animate-pulse' : 'opacity-50'}`}></span>
                                                                {viewingDept.is_active ? 'OPERATIONAL' : 'CLOSED'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => setIsDetailsOpen(false)} 
                                                    className="w-12 h-12 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-all backdrop-blur-md border border-white/10 hover:scale-105"
                                                >
                                                    <X size={24} className="text-white" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar relative z-20 -mt-12 space-y-8">
                                            {isLoadingDetails ? (
                                                <div className="flex flex-col items-center justify-center h-64 bg-white/50 backdrop-blur-xl rounded-3xl border border-white shadow-xl">
                                                    <div className={`w-12 h-12 border-4 border-slate-100 border-t-current ${style.color} rounded-full animate-spin mb-4 shadow-sm`}></div>
                                                    <p className="text-slate-500 font-bold tracking-wide uppercase text-sm">Aggregating Insights...</p>
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Floating Overview Stats */}
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all flex items-center group">
                                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-5 ${style.bg} ${style.color} border ${style.border} group-hover:scale-110 transition-transform duration-500`}>
                                                                <Users size={28} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Appointments</p>
                                                                <p className="text-3xl font-black text-slate-800 tracking-tight">{deptStats?.stats?.totalAppointments || 0}</p>
                                                            </div>
                                                        </div>
                                                        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all flex items-center group">
                                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-5 bg-indigo-50 text-indigo-500 border border-indigo-100 group-hover:scale-110 transition-transform duration-500`}>
                                                                <Stethoscope size={28} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Doctors on Staff</p>
                                                                <p className="text-3xl font-black text-slate-800 tracking-tight">{deptDoctors.length}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Premium Patient Trends Chart */}
                                                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative group">
                                                        <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${style.gradient} opacity-80`}></div>
                                                        <div className="p-8">
                                                            <div className="flex items-center justify-between mb-8">
                                                                <div>
                                                                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Patient Activity</h3>
                                                                    <p className="text-sm font-bold text-slate-400 mt-1">30-day appointment volume trends</p>
                                                                </div>
                                                                <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center ${style.bg} ${style.color} shadow-inner`}>
                                                                    <Activity size={24} />
                                                                </div>
                                                            </div>
                                                            
                                                            {deptStats?.trendData && deptStats.trendData.length > 0 ? (
                                                                <div className="h-72 w-full -ml-4">
                                                                    <ResponsiveContainer width="100%" height="100%">
                                                                        <AreaChart data={deptStats.trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                                            <defs>
                                                                                <linearGradient id={`colorApps_${viewingDept.id}`} x1="0" y1="0" x2="0" y2="1">
                                                                                    <stop offset="5%" stopColor={style.color.replace('text-', '')} stopOpacity={0.4}/>
                                                                                    <stop offset="95%" stopColor={style.color.replace('text-', '')} stopOpacity={0}/>
                                                                                </linearGradient>
                                                                            </defs>
                                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                                                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#cbd5e1', fontWeight: 700 }} dy={10} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                                                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#cbd5e1', fontWeight: 700 }} dx={-10} />
                                                                            <Tooltip 
                                                                                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', padding: '12px 20px' }}
                                                                                itemStyle={{ fontWeight: '900', color: '#1e293b' }}
                                                                                labelStyle={{ fontWeight: '700', color: '#94a3b8', marginBottom: '4px' }}
                                                                            />
                                                                            <Area type="monotone" dataKey="appointments" stroke="currentColor" strokeWidth={4} fillOpacity={1} fill={`url(#colorApps_${viewingDept.id})`} className={style.color} activeDot={{ r: 6, strokeWidth: 0, fill: 'currentColor' }} />
                                                                        </AreaChart>
                                                                    </ResponsiveContainer>
                                                                </div>
                                                            ) : (
                                                                <div className="h-48 flex flex-col items-center justify-center text-slate-300 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
                                                                    <Activity size={40} className="mb-3 opacity-40" />
                                                                    <p className="font-bold text-sm uppercase tracking-widest">Insufficient Data</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Refined Doctors Roster */}
                                                    <div>
                                                        <div className="flex items-center justify-between mb-6 px-2">
                                                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Active Specialists</h3>
                                                            <span className="px-4 py-1.5 bg-slate-200/50 text-slate-600 text-xs font-black rounded-full uppercase tracking-widest">{deptDoctors.length} Assigned</span>
                                                        </div>
                                                        
                                                        <div className="space-y-4">
                                                            {deptDoctors.length === 0 ? (
                                                                <div className="bg-white p-10 rounded-3xl border border-slate-200 border-dashed text-center shadow-sm">
                                                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                                        <Users size={24} className="text-slate-400" />
                                                                    </div>
                                                                    <p className="text-slate-500 font-bold">No doctors currently assigned to this department.</p>
                                                                </div>
                                                            ) : (
                                                                deptDoctors.map((doc, index) => {
                                                                    const docSchedules = deptSchedules.filter(s => s.doctor_id === doc.id);
                                                                    
                                                                    return (
                                                                        <motion.div 
                                                                            initial={{ opacity: 0, y: 10 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            transition={{ delay: index * 0.1 }}
                                                                            key={doc.id} 
                                                                            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex flex-col md:flex-row md:items-center justify-between group"
                                                                        >
                                                                            <div className="flex items-center mb-6 md:mb-0">
                                                                                <div className={`relative w-16 h-16 rounded-[1.25rem] bg-gradient-to-br ${style.gradient} flex items-center justify-center text-white font-black text-2xl shadow-inner mr-5 overflow-hidden group-hover:scale-105 transition-transform duration-300`}>
                                                                                    {doc.profile_image ? (
                                                                                        <img src={doc.profile_image} alt="Doctor" className="w-full h-full object-cover" />
                                                                                    ) : (
                                                                                        doc.first_name.charAt(0)
                                                                                    )}
                                                                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                                                </div>
                                                                                <div>
                                                                                    <h4 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-slate-900">Dr. {doc.first_name} {doc.last_name}</h4>
                                                                                    <p className="text-sm font-bold text-slate-400 mt-0.5">{doc.specialization}</p>
                                                                                </div>
                                                                            </div>
                                                                            
                                                                            <div className="md:w-1/2">
                                                                                {docSchedules.length > 0 ? (
                                                                                    <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                                                                                        {docSchedules.map(sched => {
                                                                                            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                                                                                            const dayName = days[sched.day_of_week - 1];
                                                                                            return (
                                                                                                <div key={sched.id} className="flex items-center bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl border border-slate-200/60 transition-colors">
                                                                                                    <div className={`w-6 h-6 rounded-md ${style.bg} ${style.color} flex items-center justify-center mr-2 shadow-sm`}>
                                                                                                        <span className="text-[10px] font-black">{dayName}</span>
                                                                                                    </div>
                                                                                                    <div className="flex items-center text-slate-600 font-bold text-xs tracking-wide">
                                                                                                        <Clock size={12} className="mr-1.5 opacity-50" />
                                                                                                        {sched.start_time.substring(0,5)} - {sched.end_time.substring(0,5)}
                                                                                                    </div>
                                                                                                </div>
                                                                                            );
                                                                                        })}
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="flex justify-start md:justify-end">
                                                                                        <div className="bg-rose-50/80 px-4 py-2 rounded-xl border border-rose-100 flex items-center">
                                                                                            <Calendar size={14} className="text-rose-400 mr-2" />
                                                                                            <span className="text-xs font-black text-rose-500 uppercase tracking-wider">No shifts assigned</span>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </motion.div>
                                                                    );
                                                                })
                                                            )}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </>
                                );
                            })()}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Departments;

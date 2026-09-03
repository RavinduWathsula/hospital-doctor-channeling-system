import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Users, Activity, Building, CalendarCheck, ShieldCheck, TrendingUp, Clock, ArrowRight, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, icon, gradient, shadow, to }) => {
    const CardContent = (
        <motion.div 
            whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
            className={`relative p-8 rounded-[2rem] overflow-hidden flex flex-col justify-between h-full bg-gradient-to-br ${gradient} ${shadow} border border-white/20 backdrop-blur-xl group cursor-pointer`}
        >
            {/* Background pattern */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-white/20 transition-all duration-700"></div>
            
            <div className="relative z-10 flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner border border-white/30 text-white group-hover:rotate-12 transition-transform duration-500">
                    {icon}
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight size={16} className="text-white" />
                </div>
            </div>
            
            <div className="relative z-10">
                <p className="text-5xl font-black text-white tracking-tighter mb-1 drop-shadow-md">{value}</p>
                <p className="text-sm font-bold tracking-widest text-white/80 uppercase">{title}</p>
            </div>
        </motion.div>
    );

    if (to) {
        return <Link to={to} className="block h-full outline-none">{CardContent}</Link>;
    }
    return CardContent;
};

const Dashboard = () => {
    const { token, user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const mockRevenueData = [
        { name: 'Mon', revenue: 4000 },
        { name: 'Tue', revenue: 3000 },
        { name: 'Wed', revenue: 5000 },
        { name: 'Thu', revenue: 2780 },
        { name: 'Fri', revenue: 6890 },
        { name: 'Sat', revenue: 2390 },
        { name: 'Sun', revenue: 3490 },
    ];

    const mockRecentActivity = [
        { id: 1, action: 'New Patient Registered', details: 'Emma Thompson created an account', time: '5 mins ago', type: 'patient' },
        { id: 2, action: 'Appointment Booked', details: 'Dr. Sarah Wilson - Cardiology', time: '12 mins ago', type: 'appointment' },
        { id: 3, action: 'Payment Processed', details: '$150.00 Consultation Fee', time: '1 hr ago', type: 'payment' },
        { id: 4, action: 'Doctor Onboarded', details: 'Dr. James Lee joined Neurology', time: '3 hrs ago', type: 'doctor' },
    ];

    useEffect(() => {
        fetch('/api/reports/dashboard-stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if(data.success) setStats(data.data);
            else toast.error('Failed to fetch stats');
        })
        .catch(() => toast.error('Error connecting to server'))
        .finally(() => setLoading(false));
    }, [token]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: "spring", bounce: 0.4 } }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-4 border-indigo-100 rounded-full shadow-inner"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                    <ShieldCheck className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-600 animate-pulse" size={24} />
                </div>
            </div>
        );
    }

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 pb-12 font-sans selection:bg-indigo-200">
            {/* Hero Command Center */}
            <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[3rem] bg-[#0f172a] p-12 text-white shadow-2xl shadow-indigo-900/30 border border-slate-700/50">
                {/* Abstract Background Elements */}
                <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[120%] bg-gradient-to-l from-indigo-500/30 to-transparent skew-x-12 blur-3xl opacity-60"></div>
                    <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[80%] bg-gradient-to-r from-blue-500/20 to-transparent -skew-x-12 blur-3xl opacity-50"></div>
                    
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-40"></div>
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-black tracking-widest text-emerald-300 uppercase mb-6 shadow-lg shadow-emerald-500/10">
                            <span className="relative flex h-2.5 w-2.5 mr-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            System Operational
                        </div>
                        <h1 className="text-5xl sm:text-6xl font-black mb-4 tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-blue-200">
                            Admin Command Center
                        </h1>
                        <p className="text-slate-400 font-medium text-xl leading-relaxed">
                            Welcome back, <span className="text-white font-bold">{user?.first_name || 'Admin'}</span>. You have full oversight of hospital operations, staff directory, and patient flow today.
                        </p>
                    </div>
                    
                    {/* Quick Status Block */}
                    <div className="flex-shrink-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl flex items-center space-x-6 hover:bg-white/10 transition-colors duration-500">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <TrendingUp size={32} className="text-white" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Weekly Growth</p>
                            <p className="text-3xl font-black text-white">+12.5%</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Premium Statistics Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Patients" 
                    value={stats?.totalPatients || 0} 
                    icon={<Users size={28} strokeWidth={2.5} />} 
                    gradient="from-[#3b82f6] to-[#2563eb]" 
                    shadow="shadow-blue-500/30"
                    to="/admin/patients"
                />
                <StatCard 
                    title="Total Doctors" 
                    value={stats?.totalDoctors || 0} 
                    icon={<Stethoscope size={28} strokeWidth={2.5} />} 
                    gradient="from-[#6366f1] to-[#4f46e5]" 
                    shadow="shadow-indigo-500/30"
                    to="/admin/doctors"
                />
                <StatCard 
                    title="Departments" 
                    value={stats?.totalDepartments || 0} 
                    icon={<Building size={28} strokeWidth={2.5} />} 
                    gradient="from-[#8b5cf6] to-[#7c3aed]" 
                    shadow="shadow-purple-500/30"
                    to="/admin/departments"
                />
                <StatCard 
                    title="Completed Appts" 
                    value={stats?.completedAppointments || 0} 
                    icon={<CalendarCheck size={28} strokeWidth={2.5} />} 
                    gradient="from-[#10b981] to-[#059669]" 
                    shadow="shadow-emerald-500/30"
                    to="/admin/appointments"
                />
            </motion.div>

            {/* Advanced Analytics & Activity Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Patient Activity Chart (Image Concept Design) */}
                <motion.div variants={itemVariants} className="xl:col-span-2 relative bg-white rounded-[2rem] shadow-[0_10px_40px_rgb(0,0,0,0.06)] flex flex-col overflow-hidden border-l-[12px] border-l-pink-400">
                    <div className="p-8 lg:p-10 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <h2 className="text-3xl font-black text-[#1e293b] tracking-tight mb-2">Patient Activity</h2>
                                <p className="text-[#94a3b8] font-bold text-base tracking-wide">30-day appointment volume trends</p>
                            </div>
                            <div className="w-14 h-14 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center shadow-sm">
                                <Activity size={26} strokeWidth={2.5} />
                            </div>
                        </div>
                        
                        <div className="h-[300px] w-full mt-auto">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={mockRevenueData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPink" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f472b6" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#f472b6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#cbd5e1', fontSize: 13, fontWeight: 700 }} 
                                        dy={15} 
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#cbd5e1', fontSize: 13, fontWeight: 700 }} 
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            borderRadius: '16px', 
                                            border: 'none', 
                                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', 
                                            padding: '12px 20px',
                                            backgroundColor: '#fff'
                                        }}
                                        itemStyle={{ fontWeight: 800, color: '#0f172a' }}
                                        formatter={(value) => [value, 'Patients']}
                                        labelStyle={{ color: '#94a3b8', fontWeight: 700, marginBottom: '4px' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="revenue" 
                                        stroke="#1e293b" 
                                        strokeWidth={4} 
                                        fillOpacity={1} 
                                        fill="url(#colorPink)" 
                                        activeDot={{ r: 7, strokeWidth: 4, stroke: '#fff', fill: '#1e293b', style: { filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.3))' } }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </motion.div>

                {/* Timeline / Live Feed */}
                <motion.div variants={itemVariants} className="bg-white rounded-[3rem] p-8 lg:p-10 shadow-[0_20px_50px_rgb(0,0,0,0.05)] border border-slate-100 flex flex-col relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-slate-50 rounded-full blur-3xl opacity-60 translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Live Activity</h2>
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                        </span>
                    </div>

                    <div className="relative flex-1 z-10 pl-4 mt-2">
                        {/* Vertical line connecting timeline items */}
                        <div className="absolute top-4 bottom-8 left-[23px] w-0.5 bg-slate-100"></div>
                        
                        <div className="space-y-8">
                            {mockRecentActivity.map((activity, index) => (
                                <div key={activity.id} className="relative flex items-start group">
                                    <div className={`absolute -left-4 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md border ${
                                        activity.type === 'patient' ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white border-blue-500 shadow-blue-500/20' :
                                        activity.type === 'appointment' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white border-emerald-500 shadow-emerald-500/20' :
                                        activity.type === 'payment' ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white border-amber-400 shadow-amber-500/20' :
                                        'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-indigo-500 shadow-indigo-500/20'
                                    } group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 z-10`}>
                                        <Clock size={18} strokeWidth={2.5} />
                                    </div>
                                    <div className="pl-12 bg-white/50 backdrop-blur-sm rounded-xl p-3 -mt-2 -ml-2 group-hover:bg-slate-50 transition-colors w-full border border-transparent group-hover:border-slate-100">
                                        <p className="text-sm font-black text-slate-800 tracking-tight">{activity.action}</p>
                                        <p className="text-xs font-semibold text-slate-500 mt-1">{activity.details}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Link to="/admin/reports" className="mt-8 w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold tracking-wide transition-all shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 text-center text-sm relative z-10 flex justify-center items-center group">
                        <span>View All Activity Logs</span>
                        <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Dashboard;

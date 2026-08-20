import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Users, Activity, Building, CalendarCheck, ShieldCheck, TrendingUp, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, icon, color, bg, ring, to }) => {
    const CardContent = (
        <motion.div 
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className={`bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col justify-center transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative overflow-hidden group ${to ? 'cursor-pointer hover:border-indigo-200' : ''}`}
        >
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${bg}`}></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`w-14 h-14 rounded-2xl ${bg} ${color} flex items-center justify-center ring-1 ${ring} shadow-inner group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <p className="text-4xl font-black text-slate-800 tracking-tight">{value}</p>
            </div>
            <p className="text-sm text-slate-500 font-bold tracking-wide uppercase relative z-10">{title}</p>
        </motion.div>
    );

    if (to) {
        return <Link to={to} className="block outline-none focus:ring-2 focus:ring-indigo-500 rounded-[2rem]">{CardContent}</Link>;
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
        fetch('http://localhost:5000/api/reports/dashboard-stats', {
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
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    if (loading) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 pb-10">
            {/* Hero Welcome Section */}
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden group">
                <div className="absolute -top-32 -right-32 w-[30rem] h-[30rem] bg-indigo-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
                
                <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                    <ShieldCheck size={180} strokeWidth={1} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                        <span className="inline-flex items-center px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold tracking-widest uppercase mb-6 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
                            System Online
                        </span>
                        <h1 className="text-4xl sm:text-5xl font-black mb-3 tracking-tight">Admin Command Center</h1>
                        <p className="text-indigo-200 font-medium text-lg max-w-xl leading-relaxed">
                            Welcome back, <span className="text-white font-bold">{user?.first_name || 'Admin'}</span>. Oversee hospital operations, manage staff, and monitor system health.
                        </p>
                    </div>
                    <div className="mt-8 md:mt-0 hidden lg:block">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex items-center space-x-6">
                            <div>
                                <p className="text-indigo-200 text-sm font-bold uppercase tracking-wider mb-1">System Status</p>
                                <p className="text-2xl font-black text-white flex items-center"><TrendingUp size={24} className="mr-2 text-emerald-400" /> Optimal</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Statistics Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Patients" value={stats?.totalPatients || 0} 
                    icon={<Users size={28} strokeWidth={2.5} />} 
                    color="text-blue-600" bg="bg-blue-50/80" ring="ring-blue-100" 
                    to="/admin/patients"
                />
                <StatCard 
                    title="Total Doctors" value={stats?.totalDoctors || 0} 
                    icon={<Activity size={28} strokeWidth={2.5} />} 
                    color="text-indigo-600" bg="bg-indigo-50/80" ring="ring-indigo-100" 
                    to="/admin/doctors"
                />
                <StatCard 
                    title="Departments" value={stats?.totalDepartments || 0} 
                    icon={<Building size={28} strokeWidth={2.5} />} 
                    color="text-purple-600" bg="bg-purple-50/80" ring="ring-purple-100" 
                    to="/admin/departments"
                />
                <StatCard 
                    title="Completed Appts" value={stats?.completedAppointments || 0} 
                    icon={<CalendarCheck size={28} strokeWidth={2.5} />} 
                    color="text-emerald-600" bg="bg-emerald-50/80" ring="ring-emerald-100" 
                    to="/admin/appointments"
                />
            </motion.div>

            {/* Charts & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <motion.div variants={itemVariants} className="lg:col-span-2 bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Revenue Trends</h2>
                        <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full border border-indigo-100">Last 7 Days</span>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} tickFormatter={(val) => `$${val}`} dx={-10} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', padding: '12px 20px', fontWeight: 'bold' }}
                                    formatter={(value) => [`$${value}`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-8">Live Feed</h2>
                    <div className="space-y-6 flex-1">
                        {mockRecentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-start group">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 shrink-0 shadow-sm border ${
                                    activity.type === 'patient' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                    activity.type === 'appointment' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    activity.type === 'payment' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    'bg-indigo-50 text-indigo-600 border-indigo-100'
                                } group-hover:scale-110 transition-transform`}>
                                    <Clock size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{activity.action}</p>
                                    <p className="text-xs font-semibold text-slate-500 mt-0.5">{activity.details}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Link to="/admin/reports" className="mt-6 w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl font-bold transition-colors text-center text-sm">
                        View All Activity
                    </Link>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Dashboard;

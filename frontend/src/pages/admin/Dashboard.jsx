import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Users, Activity, Building, CalendarCheck, ShieldCheck, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, color, bg, ring }) => (
    <motion.div 
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col justify-center transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative overflow-hidden group"
    >
        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${bg}`}></div>
        <div className="flex items-center justify-between mb-4 relative z-10">
            <div className={`w-14 h-14 rounded-2xl ${bg} ${color} flex items-center justify-center ring-1 ${ring} shadow-inner`}>
                {icon}
            </div>
            <p className="text-4xl font-black text-slate-800 tracking-tight">{value}</p>
        </div>
        <p className="text-sm text-slate-500 font-bold tracking-wide uppercase relative z-10">{title}</p>
    </motion.div>
);

const Dashboard = () => {
    const { token, user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <motion.div 
            className="space-y-8 pb-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
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
                            Welcome back, <span className="text-white font-bold">{user?.first_name || 'Admin'}</span>. Oversee hospital operations, manage staff, and monitor system health from your dashboard.
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
            <motion.div variants={itemVariants}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Overview Statistics</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        title="Total Patients" 
                        value={stats?.totalPatients || 0} 
                        icon={<Users size={28} strokeWidth={2.5} />} 
                        color="text-blue-600" bg="bg-blue-50/80" ring="ring-blue-100" 
                    />
                    <StatCard 
                        title="Total Doctors" 
                        value={stats?.totalDoctors || 0} 
                        icon={<Activity size={28} strokeWidth={2.5} />} 
                        color="text-indigo-600" bg="bg-indigo-50/80" ring="ring-indigo-100" 
                    />
                    <StatCard 
                        title="Departments" 
                        value={stats?.totalDepartments || 0} 
                        icon={<Building size={28} strokeWidth={2.5} />} 
                        color="text-purple-600" bg="bg-purple-50/80" ring="ring-purple-100" 
                    />
                    <StatCard 
                        title="Completed Appts" 
                        value={stats?.appointments?.completed || 0} 
                        icon={<CalendarCheck size={28} strokeWidth={2.5} />} 
                        color="text-emerald-600" bg="bg-emerald-50/80" ring="ring-emerald-100" 
                    />
                </div>
            </motion.div>
            
            {/* Can add charts or recent activity lists here in the future */}
        </motion.div>
    );
};

export default Dashboard;

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Activity, Download, CalendarCheck, Users, Banknote, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Reports = () => {
    const { token } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    
    // Mock Data for ultra-premium showcase
    const revenueData = [
        { name: 'Jan', total: 15000 }, { name: 'Feb', total: 22000 }, { name: 'Mar', total: 18000 },
        { name: 'Apr', total: 27000 }, { name: 'May', total: 32000 }, { name: 'Jun', total: 28000 },
        { name: 'Jul', total: 35000 }, { name: 'Aug', total: 42000 },
    ];

    const departmentData = [
        { name: 'Cardiology', value: 400 },
        { name: 'Neurology', value: 300 },
        { name: 'Pediatrics', value: 300 },
        { name: 'Orthopedics', value: 200 },
    ];

    const appointmentsData = [
        { name: 'Mon', completed: 45, cancelled: 10 },
        { name: 'Tue', completed: 52, cancelled: 8 },
        { name: 'Wed', completed: 48, cancelled: 12 },
        { name: 'Thu', completed: 61, cancelled: 5 },
        { name: 'Fri', completed: 55, cancelled: 7 },
        { name: 'Sat', completed: 30, cancelled: 2 },
        { name: 'Sun', completed: 25, cancelled: 1 },
    ];

    useEffect(() => {
        // Simulate fetch
        setTimeout(() => setLoading(false), 1000);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl shadow-2xl">
                    <p className="text-white font-bold mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm font-semibold mb-1" style={{ color: entry.color }}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                            <span>{entry.name}: {entry.name === 'total' ? '$' : ''}{entry.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
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
        <div className="space-y-6 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
                        <Activity className="text-indigo-600 mr-3" size={32} /> Analytics & Reports
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Deep insights into hospital performance and financials.</p>
                </div>
                
                <div className="flex space-x-3">
                    <button className="flex items-center px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                        <Filter size={18} className="mr-2" /> Filter
                    </button>
                    <button className="flex items-center px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30 hover:-translate-y-0.5">
                        <Download size={18} className="mr-2" /> Export PDF
                    </button>
                </div>
            </div>

            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Revenue Master Chart */}
                <motion.div variants={cardVariants} className="lg:col-span-2 bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mr-4 border border-indigo-100 shadow-inner">
                                <Banknote size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">Revenue Growth</h2>
                                <p className="text-sm font-bold text-slate-500">Year to Date Overview</p>
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-indigo-600">$219,000</h3>
                    </div>
                    
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} tickFormatter={val => `$${val/1000}k`} />
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={5} fillOpacity={1} fill="url(#colorTotal)" activeDot={{ r: 8, strokeWidth: 0, fill: '#4f46e5' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Department Distribution */}
                <motion.div variants={cardVariants} className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
                    
                    <div className="flex items-center mb-6 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-blue-400 mr-4 border border-slate-700 shadow-inner">
                            <Users size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight">Patient Distribution</h2>
                            <p className="text-sm font-bold text-slate-400">By Department</p>
                        </div>
                    </div>

                    <div className="h-[250px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={departmentData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                                    {departmentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4 relative z-10">
                        {departmentData.map((entry, index) => (
                            <div key={index} className="flex items-center">
                                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                <span className="text-xs font-bold text-slate-300">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Appointments Overview */}
                <motion.div variants={cardVariants} className="lg:col-span-3 bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
                    <div className="flex items-center mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mr-4 border border-emerald-100 shadow-inner">
                            <CalendarCheck size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Appointment Velocity</h2>
                            <p className="text-sm font-bold text-slate-500">Completed vs Cancelled</p>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={appointmentsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Bar dataKey="completed" fill="#10b981" radius={[8, 8, 0, 0]} barSize={20} />
                                <Bar dataKey="cancelled" fill="#ef4444" radius={[8, 8, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
                
            </motion.div>
        </div>
    );
};

export default Reports;

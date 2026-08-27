import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Calendar as CalendarIcon, Clock, User, CheckCircle, XCircle, Search, Filter, MoreHorizontal, Activity, Stethoscope, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Appointments = () => {
    const { token } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus]);

    useEffect(() => {
        const fetchAppointments = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('http://localhost:5000/api/appointments', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                
                if (response.ok && data.success) {
                    const formattedAppointments = data.data.map(apt => ({
                        id: `APT-${apt.id.toString().padStart(4, '0')}`,
                        rawId: apt.id,
                        patient: `${apt.patient_first_name} ${apt.patient_last_name}`,
                        doctor: `Dr. ${apt.doctor_first_name} ${apt.doctor_last_name}`,
                        dept: apt.department_name || 'General',
                        date: new Date(apt.appointment_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
                        time: apt.appointment_time,
                        status: apt.status
                    }));
                    setAppointments(formattedAppointments);
                } else {
                    toast.error(data.message || 'Failed to fetch appointments');
                }
            } catch (error) {
                console.error('Error fetching appointments:', error);
                toast.error('An error occurred while fetching appointments');
            } finally {
                setIsLoading(false);
            }
        };

        if (token) fetchAppointments();
    }, [token]);

    const getStatusTheme = (status) => {
        switch (status) {
            case 'CONFIRMED': return { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-200', dot: 'bg-emerald-500', gradient: 'from-emerald-400 via-teal-400 to-emerald-400' };
            case 'PENDING': return { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-200', dot: 'bg-amber-500', gradient: 'from-amber-400 via-orange-400 to-amber-400' };
            case 'COMPLETED': return { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-200', dot: 'bg-blue-500', gradient: 'from-blue-400 via-indigo-400 to-blue-400' };
            case 'CANCELLED': return { bg: 'bg-rose-500/10', text: 'text-rose-600', border: 'border-rose-200', dot: 'bg-rose-500', gradient: 'from-rose-400 via-pink-400 to-rose-400' };
            default: return { bg: 'bg-slate-500/10', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-500', gradient: 'from-slate-400 via-gray-400 to-slate-400' };
        }
    };

    const filteredAppointments = appointments.filter(apt => {
        const matchesSearch = apt.patient.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              apt.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              apt.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || apt.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAppointments = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.98 },
        show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, type: "spring", bounce: 0.3 } }
    };

    return (
        <div className="space-y-8 pb-12 font-sans">
            {/* Ultra Premium Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-10 lg:p-12 text-white shadow-2xl shadow-indigo-900/20 border border-slate-700/50"
            >
                {/* Abstract Background Accents */}
                <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] right-[-5%] w-[40%] h-[120%] bg-gradient-to-l from-emerald-500/20 to-transparent skew-x-12 blur-3xl"></div>
                    <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[80%] bg-gradient-to-r from-teal-500/10 to-transparent -skew-x-12 blur-3xl"></div>
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-xs font-black tracking-widest text-emerald-400 uppercase mb-6 shadow-sm">
                            <Activity size={14} className="mr-2" /> Central Booking System
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
                            Master Appointments
                        </h1>
                        <p className="text-slate-400 font-medium text-lg lg:text-xl leading-relaxed">
                            Global oversight of all hospital bookings, schedules, and patient flow.
                        </p>
                    </div>
                    
                    {/* Search & Filter Bar */}
                    <div className="flex-shrink-0 w-full lg:w-auto flex flex-col sm:flex-row gap-4 bg-white/5 backdrop-blur-xl p-3 rounded-3xl border border-white/10">
                        <div className="relative flex-1 sm:w-64">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search size={18} className="text-slate-400" />
                            </div>
                            <input 
                                type="text"
                                placeholder="Search bookings..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/10 border border-transparent text-white placeholder-slate-400 text-sm rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white/15 transition-all"
                            />
                        </div>
                        <button className="flex items-center justify-center px-6 py-3.5 bg-white text-slate-900 font-bold rounded-2xl shadow-lg shadow-white/10 hover:bg-slate-100 hover:scale-105 transition-all active:scale-95">
                            <Filter size={18} className="mr-2" /> Filters
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Status Tabs */}
            <div className="flex space-x-2 overflow-x-auto hide-scrollbar pb-2">
                {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-6 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all ${
                            filterStatus === status
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                        }`}
                    >
                        {status === 'ALL' ? 'All Bookings' : status.charAt(0) + status.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="flex h-[40vh] items-center justify-center">
                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                        <CalendarIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-emerald-500 animate-pulse" size={24} />
                    </div>
                </div>
            ) : (
                <motion.div 
                    variants={containerVariants} 
                    initial="hidden" 
                    animate="show" 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <AnimatePresence>
                        {currentAppointments.length > 0 ? (
                            currentAppointments.map((apt) => {
                                const theme = getStatusTheme(apt.status);
                                return (
                                    <motion.div 
                                        variants={cardVariants}
                                        layout
                                        key={apt.id} 
                                        className="group relative rounded-[2.5rem] p-[2px] hover:-translate-y-2 transition-all duration-300"
                                    >
                                        {/* Glowing shadow effect on hover */}
                                        <div className={`absolute -inset-1 bg-gradient-to-r ${theme.gradient} rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-40 transition duration-500`}></div>
                                        
                                        {/* Dynamic Gradient Border matching status */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} rounded-[2.5rem] opacity-30 group-hover:opacity-100 transition duration-500`}></div>
                                        
                                        {/* Inner Card Content */}
                                        <div className="relative bg-white rounded-[2.4rem] p-8 shadow-sm flex flex-col h-full z-10 w-full">
                                        {/* Status Badge & ID */}
                                        <div className="flex justify-between items-center mb-8">
                                            <div className="flex flex-col">
                                                <span className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-1">Booking Ref</span>
                                                <span className="text-slate-800 font-black text-lg tracking-tight">{apt.id}</span>
                                            </div>
                                            <div className={`flex items-center px-4 py-2 rounded-2xl border ${theme.bg} ${theme.border}`}>
                                                <span className={`w-2 h-2 rounded-full ${theme.dot} mr-2 shadow-sm`}></span>
                                                <span className={`text-xs font-bold tracking-wide ${theme.text}`}>{apt.status}</span>
                                            </div>
                                        </div>

                                        {/* Patient & Doctor Info */}
                                        <div className="space-y-6 flex-1">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-100 border border-indigo-100 flex items-center justify-center text-indigo-500 mr-4 shrink-0 group-hover:scale-110 transition-transform">
                                                    <User size={20} strokeWidth={2.5} />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Patient</p>
                                                    <p className="font-black text-slate-800 text-base">{apt.patient}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 border border-emerald-100 flex items-center justify-center text-emerald-500 mr-4 shrink-0 group-hover:scale-110 transition-transform">
                                                    <Stethoscope size={20} strokeWidth={2.5} />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Medical Professional</p>
                                                    <p className="font-black text-slate-800 text-base">{apt.doctor}</p>
                                                    <p className="text-slate-500 text-xs font-semibold">{apt.dept}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Date & Time Footer */}
                                        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center text-slate-600 bg-slate-50 px-4 py-2 rounded-xl">
                                                <CalendarIcon size={16} className="text-slate-400 mr-2" />
                                                <span className="text-sm font-bold">{apt.date}</span>
                                            </div>
                                            <div className="flex items-center text-slate-600 bg-slate-50 px-4 py-2 rounded-xl">
                                                <Clock size={16} className="text-slate-400 mr-2" />
                                                <span className="text-sm font-bold">{apt.time}</span>
                                            </div>
                                        </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-20 text-center bg-white/50 backdrop-blur-sm border border-slate-100 rounded-[3rem] shadow-sm">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search size={32} className="text-slate-400" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-2">No Bookings Found</h3>
                                <p className="text-slate-500 font-medium">Try adjusting your search or filters.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
            
            {/* Pagination Controls */}
            {!isLoading && totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-12 mb-8">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-white text-slate-700 font-bold shadow-sm border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <ChevronLeft size={18} className="mr-1" /> Prev
                    </button>
                    
                    <div className="flex items-center space-x-1">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center transition-all ${
                                    currentPage === i + 1 
                                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-white text-slate-700 font-bold shadow-sm border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all active:scale-95"
                    >
                        Next <ChevronRight size={18} className="ml-1" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Appointments;

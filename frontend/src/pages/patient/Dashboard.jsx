import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Bell, Users, ArrowRight, Activity, ActivityIcon, PlusCircle, FileText, ChevronRight } from 'lucide-react';
import StateWrapper from '../../components/ui/StateWrapper';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { token, user } = useContext(AuthContext);
    
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [recentAppointments, setRecentAppointments] = useState([]);
    const [todaysAppointmentsCount, setTodaysAppointmentsCount] = useState(0);
    const [queueData, setQueueData] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch Appointments
                const aptRes = await fetch('http://localhost:5000/api/appointments/my-appointments', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const aptData = await aptRes.json();
                if (aptData.success) {
                    const upcoming = aptData.data.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED' || a.status === 'CHECKED_IN');
                    const recent = aptData.data.filter(a => a.status === 'COMPLETED' || a.status === 'CANCELLED' || a.status === 'NO_SHOW').slice(0, 3);
                    
                    setUpcomingAppointments(upcoming);
                    setRecentAppointments(recent);
                    
                    const todayStr = new Date().toDateString();
                    const todays = upcoming.filter(a => new Date(a.appointment_date).toDateString() === todayStr);
                    setTodaysAppointmentsCount(todays.length);
                }

                // Fetch Queue
                const qRes = await fetch('http://localhost:5000/api/queues/patient', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const qData = await qRes.json();
                if (qData.success && qData.data) {
                    setQueueData(qData.data);
                }

                // Fetch Notifications
                const notifRes = await fetch('http://localhost:5000/api/notifications/my', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const notifData = await notifRes.json();
                if (notifData.success) {
                    setUnreadCount(notifData.data.filter(n => !n.is_read).length);
                }

            } catch (error) {
                console.error("Failed to fetch dashboard data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [token]);

    if (isLoading && upcomingAppointments.length === 0) {
        return <StateWrapper loading={true} />;
    }

    const nextAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;
    const isToday = nextAppointment && new Date(nextAppointment.appointment_date).toDateString() === new Date().toDateString();

    // Animation Variants
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
            className="space-y-8 max-w-7xl mx-auto pb-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants} className="pt-2">
                <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
                    Welcome back, <span className="text-teal-600">{user?.first_name || 'Patient'}</span>! 👋
                </h1>
                <p className="text-slate-500 mt-2 text-lg font-medium">Here is a summary of your healthcare journey.</p>
            </motion.div>

            {/* Top Stats Cards with Glassmorphism */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                {[
                    { title: 'Upcoming Appt', value: upcomingAppointments.length, icon: Calendar, color: 'text-teal-600', bg: 'bg-teal-50/80', ring: 'ring-teal-100' },
                    { title: "Today's Appt", value: todaysAppointmentsCount, icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50/80', ring: 'ring-indigo-100' },
                    { title: 'Queue Number', value: queueData?.my_queue_number || '--', icon: Users, color: 'text-orange-600', bg: 'bg-orange-50/80', ring: 'ring-orange-100' },
                    { title: 'Current Queue', value: queueData?.current_queue || '--', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50/80', ring: 'ring-emerald-100' },
                    { title: 'Unread Alerts', value: unreadCount, icon: Bell, color: 'text-rose-600', bg: 'bg-rose-50/80', ring: 'ring-rose-100', dot: unreadCount > 0 }
                ].map((stat, idx) => (
                    <motion.div 
                        key={idx}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col justify-center transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative overflow-hidden group"
                    >
                        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${stat.bg}`}></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center ring-1 ${stat.ring} shadow-inner`}>
                                <stat.icon size={22} strokeWidth={2.5} />
                                {stat.dot && <span className="absolute top-2 right-2 w-3 h-3 bg-rose-500 rounded-full ring-2 ring-white"></span>}
                            </div>
                            <p className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</p>
                        </div>
                        <p className="text-sm text-slate-500 font-bold tracking-wide uppercase">{stat.title}</p>
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Next Appointment Premium Hero */}
                    <motion.div variants={itemVariants}>
                        {nextAppointment ? (
                            <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-indigo-800 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-teal-500/20 relative overflow-hidden group">
                                {/* Decorative animated background elements */}
                                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
                                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-400 opacity-20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
                                
                                <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                                    <ActivityIcon size={160} strokeWidth={1} />
                                </div>

                                <div className="relative z-10">
                                    <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold tracking-widest uppercase mb-6 shadow-sm">
                                        {isToday ? "Today's Appointment" : "Upcoming Appointment"}
                                    </span>
                                    <h2 className="text-4xl sm:text-5xl font-black mb-3 tracking-tight">Dr. {nextAppointment.doctor_first_name} {nextAppointment.doctor_last_name}</h2>
                                    <p className="text-teal-100 font-medium text-lg mb-8 flex items-center">
                                        <span className="w-2 h-2 bg-teal-300 rounded-full mr-3"></span>
                                        {nextAppointment.department_name} Department
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-6 text-base font-semibold bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 w-fit">
                                        <div className="flex items-center text-white">
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-3">
                                                <Calendar size={18} />
                                            </div>
                                            {new Date(nextAppointment.appointment_date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                        </div>
                                        <div className="w-px bg-white/20 hidden sm:block"></div>
                                        <div className="flex items-center text-white">
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-3">
                                                <Clock size={18} />
                                            </div>
                                            {nextAppointment.appointment_time}
                                        </div>
                                    </div>

                                    <div className="mt-10">
                                        <Link to={`/patient/appointments`} className="inline-flex items-center px-8 py-4 bg-white text-teal-700 font-extrabold rounded-2xl hover:bg-teal-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-[1.02]">
                                            View Details <ArrowRight size={20} className="ml-3" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col items-center justify-center h-[28rem]">
                                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-50 rounded-[2rem] shadow-inner flex items-center justify-center text-teal-600 mb-8 rotate-3">
                                    <Calendar size={48} strokeWidth={1.5} />
                                </div>
                                <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">No upcoming appointments</h2>
                                <p className="text-slate-500 mb-10 max-w-md text-lg">You don't have any appointments scheduled. Book a consultation with our top specialists today.</p>
                                <Link to="/patient/doctors" className="px-10 py-4 bg-teal-600 text-white font-bold rounded-2xl hover:bg-teal-500 transition-all shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:-translate-y-1">
                                    Find a Doctor
                                </Link>
                            </div>
                        )}
                    </motion.div>

                    {/* Recent Appointments */}
                    <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Recent Appointments</h3>
                            <Link to="/patient/appointments" className="flex items-center text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors bg-teal-50 px-4 py-2 rounded-full">
                                View all <ChevronRight size={16} className="ml-1" />
                            </Link>
                        </div>
                        
                        {recentAppointments.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                <FileText size={32} className="mx-auto mb-3 opacity-20" />
                                <span className="font-medium">No recent appointments found.</span>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentAppointments.map((apt, i) => (
                                    <motion.div 
                                        key={apt.id} 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * i }}
                                        className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-3xl hover:border-teal-200 hover:shadow-md transition-all group"
                                    >
                                        <div className="flex items-center">
                                            <div className="w-14 h-14 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center text-slate-700 font-black text-xl mr-5 group-hover:from-teal-50 group-hover:to-teal-100 group-hover:text-teal-700 transition-colors border border-slate-200 group-hover:border-teal-200 shadow-sm">
                                                {new Date(apt.appointment_date).getDate()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-lg group-hover:text-teal-700 transition-colors">Dr. {apt.doctor_first_name} {apt.doctor_last_name}</h4>
                                                <p className="text-sm font-medium text-slate-500">{apt.department_name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                apt.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' : 
                                                'bg-rose-100 text-rose-700 ring-1 ring-rose-200'
                                            }`}>
                                                {apt.status === 'COMPLETED' ? <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></div> : null}
                                                {apt.status}
                                            </span>
                                            <p className="text-xs font-semibold text-slate-400 mt-2">{new Date(apt.appointment_date).toLocaleDateString()}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                </div>

                {/* Sidebar Content Area */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Quick Actions */}
                    <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl -z-10 opacity-60"></div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-6">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { to: '/patient/doctors', icon: Users, label: 'Find Doctor', color: 'text-blue-500', bg: 'bg-blue-50', hover: 'hover:border-blue-200 hover:shadow-blue-500/10' },
                                { to: '/patient/doctors', icon: PlusCircle, label: 'Book Appt', color: 'text-teal-500', bg: 'bg-teal-50', hover: 'hover:border-teal-200 hover:shadow-teal-500/10' },
                                { to: '/patient/appointments', icon: FileText, label: 'My Appts', color: 'text-indigo-500', bg: 'bg-indigo-50', hover: 'hover:border-indigo-200 hover:shadow-indigo-500/10' },
                                { to: '/patient/queue', icon: Activity, label: 'View Queue', color: 'text-orange-500', bg: 'bg-orange-50', hover: 'hover:border-orange-200 hover:shadow-orange-500/10' },
                            ].map((action, idx) => (
                                <Link key={idx} to={action.to} className={`flex flex-col items-center justify-center p-5 bg-white border border-slate-100 rounded-3xl transition-all hover:-translate-y-1 shadow-sm hover:shadow-lg group ${action.hover}`}>
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${action.bg} ${action.color}`}>
                                        <action.icon size={24} strokeWidth={2.5} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 text-center tracking-wide">{action.label}</span>
                                </Link>
                            ))}
                        </div>
                    </motion.div>

                    {/* Support Banner */}
                    <motion.div variants={itemVariants} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-8 text-center text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl"></div>
                        
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-[1.5rem] border border-white/20 flex items-center justify-center text-teal-300 mx-auto mb-6 relative z-10 shadow-inner">
                            <Activity size={36} strokeWidth={1.5} />
                        </div>
                        <h4 className="text-2xl font-black mb-3 tracking-tight relative z-10">Need Medical Help?</h4>
                        <p className="text-slate-300 text-sm mb-8 font-medium leading-relaxed relative z-10">Our support team is available 24/7 to assist you with any inquiries or emergencies.</p>
                        <button className="w-full py-4 bg-teal-500 text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl hover:bg-teal-400 transition-all shadow-[0_0_15px_rgba(20,184,166,0.4)] hover:shadow-[0_0_25px_rgba(20,184,166,0.6)] relative z-10">
                            Contact Support
                        </button>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;

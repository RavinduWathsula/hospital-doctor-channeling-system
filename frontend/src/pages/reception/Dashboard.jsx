import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { CalendarCheck, Users, CheckCircle, CheckSquare, Clock, MonitorPlay, UserPlus, Building2, TrendingUp, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import StateWrapper from '../../components/ui/StateWrapper';

const ReceptionDashboard = () => {
    const { token, user } = useContext(AuthContext);
    const [stats, setStats] = useState({
        todayAppointments: 0,
        waitingPatients: 0,
        checkedInPatients: 0,
        completedConsultations: 0,
    });
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        if (token) fetchDashboardData();
        
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, [token]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const today = new Date().toISOString().split('T')[0];
            
            const appRes = await fetch('http://localhost:5000/api/appointments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const appData = await appRes.json();
            
            let todayApps = 0;
            let checkedIn = 0;
            let completed = 0;

            if (appData.success && appData.data) {
                const todays = appData.data.filter(a => a.appointment_date.split('T')[0] === today);
                todayApps = todays.length;
                checkedIn = todays.filter(a => a.status === 'WAITING' || a.status === 'CHECKED_IN').length;
                completed = todays.filter(a => a.status === 'COMPLETED').length;
            }

            const qRes = await fetch('http://localhost:5000/api/queues', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const qData = await qRes.json();
            
            let waiting = 0;
            if (qData.success && qData.data) {
                waiting = qData.data.reduce((acc, q) => acc + (q.waitingPatients?.length || 0), 0);
            }

            setStats({
                todayAppointments: todayApps,
                waitingPatients: waiting,
                checkedInPatients: checkedIn,
                completedConsultations: completed,
            });

        } catch (error) {
            console.error("Error fetching dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && stats.todayAppointments === 0) {
        return <StateWrapper loading={true} />;
    }

    const quickActions = [
        { name: 'Walk-In Booking', path: '/reception/walk-in', icon: <UserPlus size={26} />, color: 'from-pink-500 to-rose-500', bgLight: 'bg-rose-50', text: 'text-rose-600' },
        { name: 'TV Display', path: '/reception/tv-display', icon: <MonitorPlay size={26} />, color: 'from-blue-500 to-cyan-500', bgLight: 'bg-cyan-50', text: 'text-cyan-600' },
        { name: 'Check-In', path: '/reception/check-in', icon: <CheckSquare size={26} />, color: 'from-indigo-500 to-purple-500', bgLight: 'bg-indigo-50', text: 'text-indigo-600' },
        { name: 'Register Patient', path: '/reception/patients', icon: <Users size={26} />, color: 'from-emerald-400 to-teal-500', bgLight: 'bg-teal-50', text: 'text-teal-600' },
        { name: 'Live Queue', path: '/reception/queue', icon: <Clock size={26} />, color: 'from-amber-400 to-orange-500', bgLight: 'bg-orange-50', text: 'text-orange-600' },
        { name: 'Appointments', path: '/reception/appointments', icon: <CalendarCheck size={26} />, color: 'from-violet-500 to-fuchsia-500', bgLight: 'bg-fuchsia-50', text: 'text-fuchsia-600' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            {/* Header Section with dynamic greeting */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl -mb-10 pointer-events-none"></div>
                
                <div className="relative z-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                        {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{user?.first_name || 'Front Desk'}</span>!
                    </h1>
                    <p className="text-gray-500 font-medium text-lg flex items-center">
                        <Activity className="mr-2 text-indigo-500 animate-pulse" size={20} />
                        Hospital operations are running smoothly today.
                    </p>
                </div>
                <div className="relative z-10 mt-4 md:mt-0 px-6 py-3 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center">
                    <Clock className="text-indigo-600 mr-3" size={20} />
                    <span className="font-semibold text-gray-800 tracking-wide">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                </div>
            </div>
            
            {/* Stats Grid - Glassmorphism style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 group-hover:rotate-12 duration-500 text-blue-600">
                        <CalendarCheck size={100} />
                    </div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                            <CalendarCheck size={26} />
                        </div>
                        <TrendingUp size={20} className="text-green-500" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-4xl font-black text-gray-800 mb-1">{stats.todayAppointments}</h3>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Today's Appts</p>
                    </div>
                </div>
                
                <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 group-hover:rotate-12 duration-500 text-indigo-600">
                        <CheckSquare size={100} />
                    </div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                            <CheckSquare size={26} />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-4xl font-black text-gray-800 mb-1">{stats.checkedInPatients}</h3>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Checked In</p>
                    </div>
                </div>
                
                <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 group-hover:rotate-12 duration-500 text-orange-600">
                        <Users size={100} />
                    </div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600 flex items-center justify-center shadow-inner">
                            <Users size={26} />
                        </div>
                        <span className="flex h-3 w-3 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                        </span>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-4xl font-black text-gray-800 mb-1">{stats.waitingPatients}</h3>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Waiting Area</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 group-hover:rotate-12 duration-500 text-green-600">
                        <CheckCircle size={100} />
                    </div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-100 to-green-50 text-green-600 flex items-center justify-center shadow-inner">
                            <CheckCircle size={26} />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-4xl font-black text-gray-800 mb-1">{stats.completedConsultations}</h3>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Completed</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Quick Actions Grid */}
                <div className="xl:col-span-2">
                    <h2 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center">
                        <span className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center mr-3 shadow-md">⚡</span>
                        Quick Actions Hub
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                        {quickActions.map((action, idx) => (
                            <Link 
                                key={idx}
                                to={action.path} 
                                className="group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 border border-gray-100 hover:border-transparent transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center text-center overflow-hidden"
                            >
                                {/* Animated background hover effect */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                                
                                <div className={`w-16 h-16 rounded-2xl ${action.bgLight} ${action.text} flex items-center justify-center mb-4 group-hover:bg-white/20 group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-sm relative z-10`}>
                                    {action.icon}
                                </div>
                                <h3 className="font-bold text-gray-800 group-hover:text-white transition-colors duration-300 relative z-10 text-lg">{action.name}</h3>
                                
                                {/* Bottom Accent line */}
                                <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${action.color} transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300`}></div>
                            </Link>
                        ))}
                    </div>
                </div>
                
                {/* Premium Info Panel */}
                <div className="xl:col-span-1">
                    <div className="h-full bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500 opacity-20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
                        
                        <div className="flex-1 relative z-10 flex flex-col justify-center">
                            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-xl">
                                <Building2 size={40} className="text-indigo-300" />
                            </div>
                            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200 mb-4 leading-tight">
                                Streamlining Hospital Operations
                            </h2>
                            <p className="text-indigo-200/80 text-lg leading-relaxed mb-8">
                                Use the quick actions hub to rapidly register new patients, book walk-ins, and manage the live queue to minimize wait times.
                            </p>
                            
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 mt-auto">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-indigo-300 uppercase tracking-widest font-bold mb-1">System Status</p>
                                        <p className="font-semibold text-white">All services operational</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <div className="w-3 h-3 bg-green-400 rounded-full animate-ping absolute"></div>
                                        <div className="w-3 h-3 bg-green-500 rounded-full relative z-10"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceptionDashboard;

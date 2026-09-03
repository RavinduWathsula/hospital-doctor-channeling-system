import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { CalendarCheck, Users, Activity, CheckCircle, Clock, Sparkles, ChevronRight, ArrowRight, UserCheck, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import StateWrapper from '../../components/ui/StateWrapper';

const DoctorDashboard = () => {
    const { token, user } = useContext(AuthContext);
    const [stats, setStats] = useState({
        todayAppointments: 0,
        waitingPatients: 0,
        completedConsultations: 0,
    });
    const [currentPatient, setCurrentPatient] = useState(null);
    const [todaySchedule, setTodaySchedule] = useState(null);
    const [loading, setLoading] = useState(true);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Date formatting for the greeting
    const today = new Date();
    const formattedDate = new Intl.DateTimeFormat('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
    }).format(today);

    useEffect(() => {
        if (token && user) {
            fetchDashboardData();
        }
    }, [token, user]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const localToday = new Date();
            const todayStr = localToday.toLocaleDateString('en-CA'); // 'YYYY-MM-DD' in local time
            
            // Fetch Appointments
            const appRes = await fetch('/api/appointments/doctor-appointments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const appData = await appRes.json();
            let todayAppsCount = 0;
            let completedCount = 0;

            if (appData.success && appData.data) {
                const todays = appData.data.filter(a => {
                    if (!a.appointment_date) return false;
                    const appDate = new Date(a.appointment_date);
                    return appDate.toLocaleDateString('en-CA') === todayStr;
                });
                todayAppsCount = todays.length;
                completedCount = todays.filter(a => a.status === 'COMPLETED').length;
            }

            // Fetch Queue
            const qRes = await fetch('/api/queues/doctor', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const qData = await qRes.json();
            let waitingCount = 0;
            let current = null;
            if (qData.success && qData.data) {
                waitingCount = qData.data.waitingPatients?.length || 0;
                current = qData.data.currentPatient;
            }

            setStats({
                todayAppointments: todayAppsCount,
                waitingPatients: waitingCount,
                completedConsultations: completedCount,
            });
            setCurrentPatient(current);

            // Fetch Doctor details for Schedule
            const docRes = await fetch('/api/doctors/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const docData = await docRes.json();
            if (docData.success && docData.data) {
                const doctorId = docData.data.id;
                
                // Fetch Schedule
                const schedRes = await fetch(`/api/schedules/doctor/${doctorId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const schedData = await schedRes.json();
                if (schedData.success && schedData.data) {
                    const dayOfWeek = new Date().getDay() || 7; // 1-7
                    const todaysSched = schedData.data.find(s => s.day_of_week === dayOfWeek && s.status === 'ACTIVE');
                    setTodaySchedule(todaysSched);
                }
            }

        } catch (error) {
            console.error("Error fetching dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !todaySchedule && !currentPatient && stats.todayAppointments === 0) {
        return <StateWrapper loading={true} />;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            {/* Dynamic Premium Greeting Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-theme-900 shadow-2xl mb-8 group transition-all duration-500 hover:shadow-theme-900/50">
                <div className="absolute inset-0 bg-gradient-to-r from-theme-600 via-theme-700 to-theme-900 opacity-90 transition-colors duration-500"></div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-theme-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse transition-colors duration-500"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-theme-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse transition-colors duration-500" style={{ animationDelay: '2s' }}></div>
                
                <div className="relative p-8 md:p-12 z-10 flex flex-col md:flex-row items-center justify-between">
                    <div className="text-center md:text-left">
                        <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                <Sparkles className="text-theme-100 animate-pulse" size={24} />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{getGreeting()}, Dr. {user?.first_name}</h1>
                        </div>
                        <p className="text-theme-50 text-lg md:text-xl max-w-xl leading-relaxed opacity-90 md:ml-16">
                            Welcome back. Here is your schedule and patient summary for today.
                        </p>
                    </div>
                    <div className="mt-8 md:mt-0 hidden md:block">
                        <div className="w-32 h-32 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(var(--color-theme-500),0.3)] group-hover:scale-110 transition-transform duration-500">
                            <Stethoscope size={56} className="text-theme-100 drop-shadow-lg group-hover:text-white transition-colors" />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Stats Grid - Glassmorphic / Modern */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Booked', value: stats.todayAppointments, icon: CalendarCheck, gradient: 'from-blue-500 to-blue-700', bg: 'bg-blue-50', text: 'text-blue-600' },
                    { label: 'In Waiting Room', value: stats.waitingPatients, icon: Users, gradient: 'from-amber-500 to-amber-700', bg: 'bg-amber-50', text: 'text-amber-600' },
                    { label: 'Completed Today', value: stats.completedConsultations, icon: CheckCircle, gradient: 'from-emerald-500 to-emerald-700', bg: 'bg-emerald-50', text: 'text-emerald-600' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 group hover:-translate-y-2 overflow-hidden relative flex flex-col justify-between">
                        <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full -z-0 transition-transform duration-700 group-hover:scale-125 opacity-50 ${stat.bg}`}></div>
                        <div className="relative z-10 flex justify-between items-start mb-6">
                            <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-all duration-500 text-white bg-gradient-to-br ${stat.gradient}`}>
                                <stat.icon size={32} />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                            <h3 className="text-5xl font-black text-slate-800 tracking-tighter">{stat.value}</h3>
                        </div>
                    </div>
                ))}

                <div className="bg-gradient-to-br from-theme-500 via-theme-600 to-theme-800 rounded-[2rem] p-6 shadow-lg shadow-theme-500/30 text-white relative overflow-hidden group hover:shadow-theme-500/50 hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between">
                    <div className="absolute -right-6 -bottom-6 opacity-20 group-hover:scale-125 group-hover:rotate-12 transition-all duration-700">
                        <Clock size={140} />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-xs font-black uppercase tracking-widest text-theme-100 mb-6 flex items-center"><Clock size={16} className="mr-2"/> Shift Details</h3>
                        {todaySchedule ? (
                            <div>
                                <p className="text-4xl font-black tracking-tighter mb-3 drop-shadow-md">{todaySchedule.start_time.substring(0, 5)} <span className="text-theme-300 text-2xl font-bold">to</span> {todaySchedule.end_time.substring(0, 5)}</p>
                                <span className="inline-block bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-black tracking-widest uppercase shadow-inner border border-white/10">
                                    {todaySchedule.slot_duration_minutes} MIN / SLOT
                                </span>
                            </div>
                        ) : (
                            <div className="flex flex-col justify-center mt-2">
                                <p className="text-3xl font-black text-white mb-2 tracking-tight drop-shadow-md">Off Duty</p>
                                <p className="text-theme-100 text-sm font-medium">No active schedule for today.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Current Patient - Masterpiece UI */}
                <div className="lg:col-span-7 bg-white rounded-[2rem] shadow-sm hover:shadow-lg transition-shadow duration-500 border border-slate-100 overflow-hidden flex flex-col h-[420px] relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-theme-50 rounded-bl-full -z-0"></div>
                    <div className="px-8 py-6 border-b border-slate-50 bg-white/50 backdrop-blur-xl flex items-center justify-between z-10 relative">
                        <h2 className="text-xl font-black text-slate-800 flex items-center tracking-tight">
                            <Activity className="mr-3 text-theme-500" size={24} /> 
                            Active Consultation
                        </h2>
                        {currentPatient && (
                            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-theme-700 bg-theme-100 px-4 py-1.5 rounded-full shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-theme-500 animate-ping"></span> In Progress
                            </span>
                        )}
                    </div>
                    
                    {currentPatient ? (
                        <div className="flex-1 flex items-center p-8 relative z-10">
                            <div className="relative w-full flex flex-col md:flex-row items-center gap-10">
                                <div className="w-40 h-40 bg-gradient-to-br from-theme-400 to-theme-700 rounded-[2.5rem] flex items-center justify-center text-5xl font-black text-white shadow-2xl shadow-theme-500/40 transform -rotate-3 hover:rotate-3 transition-transform duration-500 border-4 border-white">
                                    {currentPatient.first_name.charAt(0)}{currentPatient.last_name.charAt(0)}
                                </div>
                                
                                <div className="flex-1 text-center md:text-left">
                                    <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200 mb-4 shadow-sm">
                                        Queue #{currentPatient.queue_number}
                                    </span>
                                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-3 drop-shadow-sm">
                                        {currentPatient.first_name} {currentPatient.last_name}
                                    </h3>
                                    <p className="text-slate-500 font-bold text-lg flex items-center justify-center md:justify-start gap-2 mb-8 bg-slate-50 inline-flex px-4 py-2 rounded-xl">
                                        <Clock size={20} className="text-theme-500" />
                                        Scheduled for {currentPatient.appointment_time}
                                    </p>
                                    
                                    <Link to="/doctor/queue" className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 hover:bg-theme-600 text-white rounded-2xl font-black tracking-wide transition-all duration-300 shadow-xl shadow-slate-900/20 hover:shadow-theme-600/40 hover:-translate-y-1 w-full md:w-auto">
                                        Manage Consultation <ArrowRight size={20} className="ml-3" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
                            <div className="w-28 h-28 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border border-slate-100 transform rotate-3">
                                <UserCheck className="text-slate-300" size={56} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Ready for Next Patient</h3>
                            <p className="text-slate-500 max-w-sm mb-8 font-medium">The consultation room is empty. Call the next patient from your live queue when you are ready.</p>
                            <Link to="/doctor/queue" className="inline-flex items-center justify-center px-8 py-4 bg-white border border-slate-200 hover:border-theme-200 text-slate-700 hover:text-theme-700 rounded-2xl font-black tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-theme-500/10 hover:-translate-y-1">
                                Open Live Queue
                            </Link>
                        </div>
                    )}
                </div>

                {/* Quick Actions & Info */}
                <div className="lg:col-span-5 bg-white rounded-[2rem] shadow-sm hover:shadow-lg transition-shadow duration-500 border border-slate-100 p-8 h-[420px] flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-theme-50 rounded-bl-full -z-0 opacity-50"></div>
                    <h2 className="text-xl font-black text-slate-800 mb-8 tracking-tight relative z-10">Quick Navigation</h2>
                    <div className="grid grid-cols-2 gap-4 flex-1 relative z-10">
                        <Link to="/doctor/appointments" className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-blue-50 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all duration-300 group hover:-translate-y-1 hover:shadow-md">
                            <div className="w-14 h-14 bg-white text-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 transform -rotate-3 group-hover:rotate-0">
                                <CalendarCheck size={24} />
                            </div>
                            <h3 className="font-bold text-slate-700 group-hover:text-blue-900 transition-colors tracking-tight">Appointments</h3>
                        </Link>
                        
                        <Link to="/doctor/queue" className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-emerald-50 rounded-3xl border border-slate-100 hover:border-emerald-200 transition-all duration-300 group hover:-translate-y-1 hover:shadow-md">
                            <div className="w-14 h-14 bg-white text-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 transform rotate-3 group-hover:rotate-0">
                                <Clock size={24} />
                            </div>
                            <h3 className="font-bold text-slate-700 group-hover:text-emerald-900 transition-colors tracking-tight">Live Queue</h3>
                        </Link>

                        <Link to="/doctor/patients" className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-amber-50 rounded-3xl border border-slate-100 hover:border-amber-200 transition-all duration-300 group hover:-translate-y-1 hover:shadow-md">
                            <div className="w-14 h-14 bg-white text-amber-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 transform rotate-3 group-hover:rotate-0">
                                <Users size={24} />
                            </div>
                            <h3 className="font-bold text-slate-700 group-hover:text-amber-900 transition-colors tracking-tight">My Patients</h3>
                        </Link>

                        <Link to="/doctor/schedules" className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-purple-50 rounded-3xl border border-slate-100 hover:border-purple-200 transition-all duration-300 group hover:-translate-y-1 hover:shadow-md">
                            <div className="w-14 h-14 bg-white text-purple-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 transform -rotate-3 group-hover:rotate-0">
                                <CalendarCheck size={24} />
                            </div>
                            <h3 className="font-bold text-slate-700 group-hover:text-purple-900 transition-colors tracking-tight">Schedules</h3>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;

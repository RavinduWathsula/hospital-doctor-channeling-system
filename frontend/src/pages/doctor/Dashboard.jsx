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
            const appRes = await fetch('http://localhost:5000/api/appointments/doctor-appointments', {
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
            const qRes = await fetch('http://localhost:5000/api/queues/doctor', {
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
            const docRes = await fetch('http://localhost:5000/api/doctors/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const docData = await docRes.json();
            if (docData.success && docData.data) {
                const doctorId = docData.data.id;
                
                // Fetch Schedule
                const schedRes = await fetch(`http://localhost:5000/api/schedules/doctor/${doctorId}`, {
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
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-900 opacity-90"></div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
                
                <div className="relative p-8 md:p-12 z-10 flex flex-col md:flex-row items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-emerald-100 mb-3 text-sm font-semibold uppercase tracking-wider">
                            <Sparkles size={16} className="text-emerald-300" />
                            {formattedDate}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                            Good day, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-teal-100">Dr. {user?.first_name} {user?.last_name}</span>
                        </h1>
                        <p className="text-emerald-50 text-lg md:text-xl max-w-xl leading-relaxed opacity-90">
                            You have <strong className="text-white">{stats.todayAppointments} appointments</strong> scheduled for today. Your expertise is making a difference.
                        </p>
                    </div>
                    <div className="mt-8 md:mt-0 hidden md:block">
                        <div className="w-32 h-32 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                            <Stethoscope size={56} className="text-emerald-100 drop-shadow-lg" />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Stats Grid - Glassmorphic / Modern */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group hover:-translate-y-1 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 group-hover:rotate-6 transition-transform">
                            <CalendarCheck size={28} />
                        </div>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Total Booked</p>
                        <h3 className="text-4xl font-black text-slate-800 tracking-tight">{stats.todayAppointments}</h3>
                    </div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group hover:-translate-y-1 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-amber-500/30 group-hover:-rotate-6 transition-transform">
                            <Users size={28} />
                        </div>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">In Waiting Room</p>
                        <h3 className="text-4xl font-black text-slate-800 tracking-tight">{stats.waitingPatients}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group hover:-translate-y-1 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                            <CheckCircle size={28} />
                        </div>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Completed Today</p>
                        <h3 className="text-4xl font-black text-slate-800 tracking-tight">{stats.completedConsultations}</h3>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-700 rounded-2xl p-6 shadow-lg shadow-teal-500/20 text-white relative overflow-hidden group hover:shadow-teal-500/40 hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute -right-6 -bottom-6 opacity-20 group-hover:scale-110 transition-transform duration-500">
                        <Clock size={120} />
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-100 mb-1 flex items-center"><Clock size={16} className="mr-1.5"/> Shift Details</h3>
                            {todaySchedule ? (
                                <>
                                    <p className="text-3xl font-black tracking-tight">{todaySchedule.start_time.substring(0, 5)} - {todaySchedule.end_time.substring(0, 5)}</p>
                                    <div className="mt-3 inline-block bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-semibold">
                                        {todaySchedule.slot_duration_minutes} min / slot
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col justify-center h-full pt-4">
                                    <p className="text-xl font-bold text-white mb-1">Off Duty</p>
                                    <p className="text-teal-100 text-sm">No active schedule for today.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Current Patient - Masterpiece UI */}
                <div className="lg:col-span-7 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[400px]">
                    <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-800 flex items-center">
                            <Activity className="mr-2 text-rose-500" size={24} /> 
                            Active Consultation
                        </h2>
                        {currentPatient && (
                            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> In Progress
                            </span>
                        )}
                    </div>
                    
                    {currentPatient ? (
                        <div className="flex-1 flex items-center p-8 relative">
                            {/* Decorative background circle */}
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-slate-50 rounded-full -z-0"></div>
                            
                            <div className="relative z-10 w-full flex flex-col md:flex-row items-center gap-8">
                                <div className="w-32 h-32 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-[2rem] flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-teal-500/30 transform rotate-3 hover:rotate-0 transition-transform">
                                    {currentPatient.first_name.charAt(0)}{currentPatient.last_name.charAt(0)}
                                </div>
                                
                                <div className="flex-1 text-center md:text-left">
                                    <div className="inline-block px-4 py-1.5 bg-slate-900 text-white text-sm font-bold rounded-xl mb-3 shadow-md">
                                        Queue #{currentPatient.queue_number}
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                                        {currentPatient.first_name} {currentPatient.last_name}
                                    </h3>
                                    <p className="text-slate-500 font-medium text-lg flex items-center justify-center md:justify-start gap-2 mb-6">
                                        <Clock size={18} className="text-slate-400" />
                                        Scheduled for {currentPatient.appointment_time}
                                    </p>
                                    
                                    <Link to="/doctor/queue" className="inline-flex items-center justify-center px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:-translate-y-0.5 w-full md:w-auto">
                                        Manage Consultation <ArrowRight size={18} className="ml-2" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <UserCheck className="text-slate-300" size={48} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700 mb-2">Ready for Next Patient</h3>
                            <p className="text-slate-500 max-w-sm mb-6">The consultation room is empty. Call the next patient from your live queue when you are ready.</p>
                            <Link to="/doctor/queue" className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-slate-200 hover:border-emerald-500 text-slate-700 hover:text-emerald-700 rounded-xl font-bold transition-all hover:shadow-md">
                                Open Live Queue
                            </Link>
                        </div>
                    )}
                </div>

                {/* Quick Actions & Info */}
                <div className="lg:col-span-5 bg-white rounded-3xl shadow-sm border border-slate-100 p-8 h-[400px] flex flex-col">
                    <h2 className="text-xl font-black text-slate-800 mb-6">Quick Navigation</h2>
                    <div className="grid grid-cols-2 gap-4 flex-1">
                        <Link to="/doctor/appointments" className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-teal-50 rounded-2xl border border-slate-100 hover:border-teal-200 transition-all group">
                            <div className="w-12 h-12 bg-white text-teal-600 rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all">
                                <CalendarCheck size={22} />
                            </div>
                            <h3 className="font-bold text-slate-800 group-hover:text-teal-900 transition-colors">Appointments</h3>
                        </Link>
                        
                        <Link to="/doctor/queue" className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-emerald-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all group">
                            <div className="w-12 h-12 bg-white text-emerald-600 rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                <Clock size={22} />
                            </div>
                            <h3 className="font-bold text-slate-800 group-hover:text-emerald-900 transition-colors">Live Queue</h3>
                        </Link>

                        <Link to="/doctor/patients" className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group">
                            <div className="w-12 h-12 bg-white text-blue-600 rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <Users size={22} />
                            </div>
                            <h3 className="font-bold text-slate-800 group-hover:text-blue-900 transition-colors">My Patients</h3>
                        </Link>

                        <Link to="/doctor/schedules" className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-indigo-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all group">
                            <div className="w-12 h-12 bg-white text-indigo-600 rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <CalendarCheck size={22} />
                            </div>
                            <h3 className="font-bold text-slate-800 group-hover:text-indigo-900 transition-colors">Schedules</h3>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;

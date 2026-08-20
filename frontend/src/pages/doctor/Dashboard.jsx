import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { CalendarCheck, Users, Activity, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

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

    useEffect(() => {
        if (token && user) {
            fetchDashboardData();
        }
    }, [token, user]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const today = new Date().toISOString().split('T')[0];
            
            // Fetch Appointments
            const appRes = await fetch('http://localhost:5000/api/appointments/doctor-appointments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const appData = await appRes.json();
            let todayAppsCount = 0;
            let completedCount = 0;

            if (appData.success && appData.data) {
                const todays = appData.data.filter(a => a.appointment_date.split('T')[0] === today);
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Welcome, Dr. {user?.firstName} {user?.lastName}</h1>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center">
                    <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mr-4">
                        <CalendarCheck size={28} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Today's Appointments</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.todayAppointments}</h3>
                    </div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center">
                    <div className="w-14 h-14 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mr-4">
                        <Users size={28} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Waiting Patients</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.waitingPatients}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center">
                    <div className="w-14 h-14 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mr-4">
                        <CheckCircle size={28} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Completed</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.completedConsultations}</h3>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-6 shadow-md text-white">
                    <h3 className="text-lg font-semibold mb-2 flex items-center"><Clock size={20} className="mr-2"/> Today's Schedule</h3>
                    {todaySchedule ? (
                        <div>
                            <p className="text-3xl font-bold">{todaySchedule.start_time} - {todaySchedule.end_time}</p>
                            <p className="text-teal-100 mt-1">{todaySchedule.slot_duration_minutes} min slots</p>
                        </div>
                    ) : (
                        <div className="flex items-center h-full pb-4">
                            <p className="text-teal-100 font-medium">No active schedule for today.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Patient */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center">
                            <Activity className="mr-2 text-teal-600" size={20} /> Current Patient
                        </h2>
                    </div>
                    
                    {currentPatient ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-teal-50/50 rounded-xl border border-teal-100">
                            <div className="w-20 h-20 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-sm">
                                {currentPatient.first_name.charAt(0)}{currentPatient.last_name.charAt(0)}
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-1">{currentPatient.first_name} {currentPatient.last_name}</h3>
                            <p className="text-teal-700 font-medium mb-4">Queue Number: {currentPatient.queue_number}</p>
                            <p className="text-sm text-gray-500 mb-6">Scheduled for {currentPatient.appointment_time}</p>
                            
                            <Link to="/doctor/appointments" className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-colors shadow-md">
                                Manage Consultation
                            </Link>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <Users className="text-gray-300 mb-3" size={48} />
                            <p className="text-gray-500 font-medium">No patient is currently in consultation.</p>
                            <p className="text-sm text-gray-400 mt-1">Select a patient from the queue to start.</p>
                            <Link to="/doctor/queue" className="mt-4 px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 shadow-sm">
                                View Queue
                            </Link>
                        </div>
                    )}
                </div>

                {/* Quick Actions & Info */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Quick Links</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link to="/doctor/appointments" className="p-4 border border-gray-100 rounded-xl hover:border-teal-300 hover:bg-teal-50/30 transition-all group flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <CalendarCheck size={24} />
                            </div>
                            <h3 className="font-semibold text-gray-800">All Appointments</h3>
                            <p className="text-xs text-gray-500 mt-1">View and manage today's list</p>
                        </Link>
                        
                        <Link to="/doctor/queue" className="p-4 border border-gray-100 rounded-xl hover:border-teal-300 hover:bg-teal-50/30 transition-all group flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Clock size={24} />
                            </div>
                            <h3 className="font-semibold text-gray-800">Live Queue</h3>
                            <p className="text-xs text-gray-500 mt-1">Call next waiting patient</p>
                        </Link>

                        <Link to="/doctor/patients" className="p-4 border border-gray-100 rounded-xl hover:border-teal-300 hover:bg-teal-50/30 transition-all group flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Users size={24} />
                            </div>
                            <h3 className="font-semibold text-gray-800">My Patients</h3>
                            <p className="text-xs text-gray-500 mt-1">View patient histories</p>
                        </Link>

                        <Link to="/doctor/schedules" className="p-4 border border-gray-100 rounded-xl hover:border-teal-300 hover:bg-teal-50/30 transition-all group flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <CalendarCheck size={24} />
                            </div>
                            <h3 className="font-semibold text-gray-800">Schedules</h3>
                            <p className="text-xs text-gray-500 mt-1">Manage weekly availability</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;

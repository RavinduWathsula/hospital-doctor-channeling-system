import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Bell, Users, ArrowRight, Activity, ActivityIcon, PlusCircle, FileText } from 'lucide-react';

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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const nextAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;
    const isToday = nextAppointment && new Date(nextAppointment.appointment_date).toDateString() === new Date().toDateString();

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.firstName}! 👋</h1>
                <p className="text-gray-500 mt-2">Here is a summary of your healthcare journey.</p>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Calendar size={24} />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Upcoming Appointment</p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Clock size={24} />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{todaysAppointmentsCount}</p>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Today's Appointment</p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                            <Users size={24} />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{queueData?.my_queue_number || '--'}</p>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Queue Number</p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                            <Activity size={24} />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{queueData?.current_queue || '--'}</p>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Current Queue</p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center relative">
                            <Bell size={24} />
                            {unreadCount > 0 && <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-red-50"></span>}
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Unread Notifications</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Next Appointment Hero */}
                    {nextAppointment ? (
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <ActivityIcon size={120} />
                            </div>
                            <div className="relative z-10">
                                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
                                    {isToday ? "Today's Appointment" : "Upcoming Appointment"}
                                </span>
                                <h2 className="text-3xl font-bold mb-2">Dr. {nextAppointment.doctor_first_name} {nextAppointment.doctor_last_name}</h2>
                                <p className="text-blue-100 mb-6">{nextAppointment.department_name} Department</p>
                                
                                <div className="flex flex-wrap gap-6 text-sm">
                                    <div className="flex items-center">
                                        <Calendar className="mr-2 opacity-80" size={18} />
                                        <span className="font-medium">{new Date(nextAppointment.appointment_date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="mr-2 opacity-80" size={18} />
                                        <span className="font-medium">{nextAppointment.appointment_time}</span>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <Link to={`/patient/appointments`} className="inline-flex items-center px-6 py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-sm">
                                        View Details <ArrowRight size={18} className="ml-2" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
                                <Calendar size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">No upcoming appointments</h2>
                            <p className="text-gray-500 mb-8 max-w-md">You don't have any appointments scheduled. Book a consultation with our top specialists today.</p>
                            <Link to="/patient/doctors" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20">
                                Find a Doctor
                            </Link>
                        </div>
                    )}

                    {/* Recent Appointments */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Recent Appointments</h3>
                            <Link to="/patient/appointments" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                                View all
                            </Link>
                        </div>
                        
                        {recentAppointments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No recent appointments found.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentAppointments.map(apt => (
                                    <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center text-gray-600 font-bold mr-4">
                                                {new Date(apt.appointment_date).getDate()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">Dr. {apt.doctor_first_name} {apt.doctor_last_name}</h4>
                                                <p className="text-sm text-gray-500">{apt.department_name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                apt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {apt.status}
                                            </span>
                                            <p className="text-xs text-gray-500 mt-1">{new Date(apt.appointment_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* Sidebar Content Area */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Link to="/patient/doctors" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-colors group">
                                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400 group-hover:text-blue-600 mb-3 transition-colors">
                                    <Users size={20} />
                                </div>
                                <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 text-center">Find Doctor</span>
                            </Link>
                            <Link to="/patient/doctors" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-colors group">
                                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400 group-hover:text-blue-600 mb-3 transition-colors">
                                    <PlusCircle size={20} />
                                </div>
                                <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 text-center">Book Appt</span>
                            </Link>
                            <Link to="/patient/appointments" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-colors group">
                                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400 group-hover:text-blue-600 mb-3 transition-colors">
                                    <FileText size={20} />
                                </div>
                                <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 text-center">My Appts</span>
                            </Link>
                            <Link to="/patient/queue" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-colors group">
                                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400 group-hover:text-blue-600 mb-3 transition-colors">
                                    <Activity size={20} />
                                </div>
                                <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 text-center">View Queue</span>
                            </Link>
                        </div>
                    </div>

                    {/* Support Banner */}
                    <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100 text-center">
                        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-indigo-500 mx-auto mb-4">
                            <Activity size={32} />
                        </div>
                        <h4 className="font-bold text-indigo-900 mb-2">Need Medical Help?</h4>
                        <p className="text-indigo-700 text-sm mb-4">Our support team is available 24/7 to assist you with any inquiries.</p>
                        <button className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

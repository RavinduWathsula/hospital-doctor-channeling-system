import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { CalendarCheck, Users, CheckCircle, CheckSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const ReceptionDashboard = () => {
    const { token, user } = useContext(AuthContext);
    const [stats, setStats] = useState({
        todayAppointments: 0,
        waitingPatients: 0,
        checkedInPatients: 0,
        completedConsultations: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) fetchDashboardData();
    }, [token]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const today = new Date().toISOString().split('T')[0];
            
            // Fetch Appointments
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
                checkedIn = todays.filter(a => a.status === 'CHECKED_IN').length;
                completed = todays.filter(a => a.status === 'COMPLETED').length;
            }

            // Fetch Queues
            const qRes = await fetch('http://localhost:5000/api/queues', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const qData = await qRes.json();
            
            let waiting = 0;
            if (qData.success && qData.data) {
                // Assuming qData.data returns all queues, sum the waiting patients
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.firstName} {user?.lastName}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center">
                    <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mr-4">
                        <CalendarCheck size={28} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Today's Appts</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.todayAppointments}</h3>
                    </div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center">
                    <div className="w-14 h-14 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mr-4">
                        <CheckSquare size={28} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Checked In</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.checkedInPatients}</h3>
                    </div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center">
                    <div className="w-14 h-14 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mr-4">
                        <Users size={28} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Waiting Area</p>
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link to="/reception/check-in" className="p-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl transition-all group flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-indigo-200 text-indigo-700 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <CheckSquare size={24} />
                            </div>
                            <h3 className="font-bold text-indigo-900">Check-In</h3>
                            <p className="text-xs text-indigo-600 mt-1">Verify arrived patients</p>
                        </Link>
                        
                        <Link to="/reception/patients" className="p-4 bg-purple-50 hover:bg-purple-100 border border-purple-100 rounded-xl transition-all group flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-purple-200 text-purple-700 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Users size={24} />
                            </div>
                            <h3 className="font-bold text-purple-900">Register Patient</h3>
                            <p className="text-xs text-purple-600 mt-1">Add new profiles</p>
                        </Link>

                        <Link to="/reception/queue" className="p-4 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl transition-all group flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Users size={24} />
                            </div>
                            <h3 className="font-bold text-blue-900">Live Queue</h3>
                            <p className="text-xs text-blue-600 mt-1">Monitor wait times</p>
                        </Link>

                        <Link to="/reception/appointments" className="p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl transition-all group flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-emerald-200 text-emerald-700 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <CalendarCheck size={24} />
                            </div>
                            <h3 className="font-bold text-emerald-900">Appointments</h3>
                            <p className="text-xs text-emerald-600 mt-1">Manage bookings</p>
                        </Link>
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-sm p-8 text-white flex flex-col justify-center items-center text-center">
                    <Building2 size={64} className="mb-4 opacity-80" />
                    <h2 className="text-2xl font-bold mb-2">Hospital Operations</h2>
                    <p className="text-indigo-100">Ensure all patients are checked in correctly and maintain smooth queue flows for doctors.</p>
                </div>
            </div>
        </div>
    );
};

export default ReceptionDashboard;

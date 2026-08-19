import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Users, Activity, Building, CalendarCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mr-4 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
    </div>
);

const Dashboard = () => {
    const { token } = useContext(AuthContext);
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

    if (loading) return <div className="flex h-64 items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Patients" value={stats?.totalPatients || 0} icon={<Users size={24} />} color="bg-blue-100 text-blue-600" />
                <StatCard title="Total Doctors" value={stats?.totalDoctors || 0} icon={<Activity size={24} />} color="bg-indigo-100 text-indigo-600" />
                <StatCard title="Departments" value={stats?.totalDepartments || 0} icon={<Building size={24} />} color="bg-purple-100 text-purple-600" />
                <StatCard title="Completed Appts" value={stats?.appointments?.completed || 0} icon={<CalendarCheck size={24} />} color="bg-emerald-100 text-emerald-600" />
            </div>
        </div>
    );
};
export default Dashboard;

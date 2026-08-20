import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { 
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { Download, Filter, Users, CalendarCheck, XCircle, UserX, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Reports = () => {
    const { token } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    
    // Filters State
    const [dateRange, setDateRange] = useState('last30'); // today, last7, last30, thisMonth, all
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange, statusFilter, customStart, customEnd]);

    const getDateParams = () => {
        const today = new Date();
        let start = '';
        let end = today.toISOString().split('T')[0];

        if (dateRange === 'today') {
            start = end;
        } else if (dateRange === 'last7') {
            const d = new Date();
            d.setDate(d.getDate() - 7);
            start = d.toISOString().split('T')[0];
        } else if (dateRange === 'last30') {
            const d = new Date();
            d.setDate(d.getDate() - 30);
            start = d.toISOString().split('T')[0];
        } else if (dateRange === 'thisMonth') {
            start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        } else if (dateRange === 'custom') {
            start = customStart;
            end = customEnd;
        }
        return { start, end };
    };

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const { start, end } = getDateParams();
            let url = `http://localhost:5000/api/reports/analytics?`;
            if (start) url += `startDate=${start}&`;
            if (end) url += `endDate=${end}&`;
            if (statusFilter) url += `status=${statusFilter}&`;

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        if (!data || !data.rawData || data.rawData.length === 0) {
            toast.error('No data to export');
            return;
        }
        const headers = ['ID', 'Date', 'Time', 'Status', 'Queue Number', 'Doctor', 'Department', 'Patient'];
        const csvRows = [
            headers.join(','), // Header row
            ...data.rawData.map(row => [
                row.id,
                new Date(row.appointment_date).toLocaleDateString(),
                row.appointment_time,
                row.status,
                row.queue_number,
                `"${row.doctor_name}"`,
                `"${row.department_name}"`,
                `"${row.patient_name}"`
            ].join(','))
        ];
        
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `analytics_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const calculateRate = (part, total) => {
        if (!total || total === 0) return '0%';
        return ((part / total) * 100).toFixed(1) + '%';
    };

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header & Actions */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Activity className="mr-2 text-indigo-600" /> Reports & Analytics
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Real-time hospital performance data.</p>
                </div>
                <button 
                    onClick={exportToCSV}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl flex items-center font-medium transition-colors shadow-sm shadow-indigo-200"
                >
                    <Download size={18} className="mr-2" /> Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
                <div className="flex items-center gap-2 font-bold text-gray-700 mb-2 md:mb-0 w-full md:w-auto">
                    <Filter size={18} /> Filters
                </div>
                
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Date Range</label>
                    <select 
                        className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none focus:border-indigo-500"
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                    >
                        <option value="today">Today</option>
                        <option value="last7">Last 7 Days</option>
                        <option value="last30">Last 30 Days</option>
                        <option value="thisMonth">This Month</option>
                        <option value="all">All Time</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>

                {dateRange === 'custom' && (
                    <>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Start Date</label>
                            <input 
                                type="date" 
                                className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">End Date</label>
                            <input 
                                type="date" 
                                className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                            />
                        </div>
                    </>
                )}

                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                    <select 
                        className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none focus:border-indigo-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="NO_SHOW">No Show</option>
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-indigo-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-bold">Total Appointments</p>
                            <h3 className="text-3xl font-extrabold text-gray-800 mt-1">{data?.stats.totalAppointments || 0}</h3>
                        </div>
                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><CalendarCheck size={24} /></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-red-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-bold">Cancellation Rate</p>
                            <h3 className="text-3xl font-extrabold text-gray-800 mt-1">
                                {calculateRate(data?.stats.cancellations, data?.stats.totalAppointments)}
                            </h3>
                            <p className="text-xs text-red-500 mt-1 font-semibold">{data?.stats.cancellations || 0} Cancelled</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-xl text-red-600"><XCircle size={24} /></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-bold">No-Show Rate</p>
                            <h3 className="text-3xl font-extrabold text-gray-800 mt-1">
                                {calculateRate(data?.stats.noShows, data?.stats.totalAppointments)}
                            </h3>
                            <p className="text-xs text-orange-500 mt-1 font-semibold">{data?.stats.noShows || 0} No-Shows</p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-xl text-orange-600"><UserX size={24} /></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-bold">New Patients</p>
                            <h3 className="text-3xl font-extrabold text-gray-800 mt-1">{data?.stats.newPatients || 0}</h3>
                            <p className="text-xs text-green-500 mt-1 font-semibold">Registered in period</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-xl text-green-600"><Users size={24} /></div>
                    </div>
                </div>
            </div>

            {/* Charts Area 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Appointment Trends</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.trendData || []}>
                                <defs>
                                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                                <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                <Legend iconType="circle" wrapperStyle={{fontSize: '14px', fontWeight: 500}} />
                                <Area type="monotone" name="Appointments" dataKey="appointments" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
                                <Line type="monotone" name="Cancellations" dataKey="cancellations" stroke="#ef4444" strokeWidth={2} dot={false} />
                                <Line type="monotone" name="No Shows" dataKey="noShows" stroke="#f59e0b" strokeWidth={2} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Status Distribution</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data?.statusDistribution || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {(data?.statusDistribution || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                <Legend iconType="circle" layout="vertical" verticalAlign="bottom" wrapperStyle={{fontSize: '12px', fontWeight: 500}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Area 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Doctor Workload</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.doctorWorkload || []} layout="vertical" margin={{ left: 50 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="doctorName" tick={{fontSize: 12, fill: '#475569', fontWeight: 500}} axisLine={false} tickLine={false} />
                                <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                <Bar dataKey="count" name="Appointments" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Department Performance</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data?.departmentPerformance || []}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    dataKey="count"
                                    nameKey="departmentName"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {(data?.departmentPerformance || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">Raw Data (Latest 500)</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-semibold">Date</th>
                                <th className="p-4 font-semibold">Time</th>
                                <th className="p-4 font-semibold">Patient</th>
                                <th className="p-4 font-semibold">Doctor</th>
                                <th className="p-4 font-semibold">Department</th>
                                <th className="p-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(data?.rawData || []).map((row, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-sm font-medium text-gray-800">{new Date(row.appointment_date).toLocaleDateString()}</td>
                                    <td className="p-4 text-sm text-gray-600">{row.appointment_time}</td>
                                    <td className="p-4 text-sm font-medium text-gray-700">{row.patient_name}</td>
                                    <td className="p-4 text-sm text-gray-600">{row.doctor_name}</td>
                                    <td className="p-4 text-sm text-gray-600">{row.department_name}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold
                                            ${row.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                                              row.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 
                                              row.status === 'NO_SHOW' ? 'bg-orange-100 text-orange-700' :
                                              row.status === 'WAITING' ? 'bg-blue-100 text-blue-700' :
                                              row.status === 'IN_CONSULTATION' ? 'bg-purple-100 text-purple-700' :
                                              'bg-gray-100 text-gray-700'}`}
                                        >
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {(!data?.rawData || data.rawData.length === 0) && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">No data available for the selected filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;

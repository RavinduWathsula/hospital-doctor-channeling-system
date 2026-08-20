import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Bell, Check, Info, AlertCircle, Clock, CalendarCheck, CheckCircle, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Notifications = () => {
    const { token } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:5000/api/notifications/my', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setNotifications(data.data);
            }
        } catch (error) {
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setNotifications(notifications.map(n => 
                    n.id === id ? { ...n, is_read: true } : n
                ));
            }
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const markAllAsRead = async () => {
        // Since there is no bulk update endpoint, we will update unread sequentially or we can just update local state.
        // It's better to update them all sequentially.
        const unread = notifications.filter(n => !n.is_read);
        if (unread.length === 0) return;
        
        try {
            await Promise.all(unread.map(n => 
                fetch(`http://localhost:5000/api/notifications/${n.id}/read`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ));
            
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Error marking notifications as read');
        }
    };

    const getIcon = (title) => {
        if (title.toLowerCase().includes('booked')) return <CalendarCheck size={24} className="text-blue-500" />;
        if (title.toLowerCase().includes('confirmed')) return <CheckCircle size={24} className="text-green-500" />;
        if (title.toLowerCase().includes('queue') || title.toLowerCase().includes('turn')) return <Clock size={24} className="text-orange-500" />;
        if (title.toLowerCase().includes('cancel')) return <AlertCircle size={24} className="text-red-500" />;
        return <Info size={24} className="text-indigo-500" />;
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' on ' + date.toLocaleDateString();
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                        <Bell size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
                        <p className="text-gray-500 text-sm mt-1">Stay updated with your latest hospital alerts.</p>
                    </div>
                </div>
                
                {notifications.some(n => !n.is_read) && (
                    <button 
                        onClick={markAllAsRead}
                        className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                    >
                        <CheckCheck className="mr-2" size={18} /> Mark all as read
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20">
                        <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-bold text-gray-700 mb-2">No Notifications Yet</h2>
                        <p className="text-gray-500">When you have new alerts, they will appear here.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((n) => (
                            <div 
                                key={n.id} 
                                className={`p-6 flex flex-col md:flex-row gap-4 transition-colors hover:bg-gray-50 ${!n.is_read ? 'bg-indigo-50/20' : ''}`}
                            >
                                <div className="mt-1 bg-white p-3 rounded-full shadow-sm border border-gray-100 h-max w-max">
                                    {getIcon(n.title)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`text-lg font-bold ${!n.is_read ? 'text-gray-900' : 'text-gray-700'}`}>{n.title}</h3>
                                        <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{formatTime(n.created_at)}</span>
                                    </div>
                                    <p className={`text-base leading-relaxed mb-3 ${!n.is_read ? 'text-gray-700' : 'text-gray-500'}`}>{n.message}</p>
                                    
                                    {!n.is_read && (
                                        <button 
                                            onClick={() => markAsRead(n.id)}
                                            className="text-sm text-indigo-600 hover:text-indigo-800 font-bold flex items-center"
                                        >
                                            <Check size={16} className="mr-1" /> Mark as read
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;

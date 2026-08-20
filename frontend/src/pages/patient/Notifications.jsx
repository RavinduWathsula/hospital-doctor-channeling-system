import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Bell, Check, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const Notifications = () => {
    const { token } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
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
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [token]);

    const handleMarkAsRead = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
            }
        } catch (error) {
            console.error('Failed to mark as read');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-500 mt-1">Stay updated with your appointments and health alerts.</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center relative">
                    <Bell size={24} />
                    {notifications.filter(n => !n.is_read).length > 0 && (
                        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
                            <Bell size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">No notifications</h3>
                        <p className="text-gray-500 text-sm">You are all caught up!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map(notif => (
                            <div key={notif.id} className={`p-6 transition-colors flex gap-4 ${notif.is_read ? 'bg-white hover:bg-gray-50/50' : 'bg-blue-50/30'}`}>
                                <div className="shrink-0 mt-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notif.is_read ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
                                        <Info size={20} />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`font-bold text-base ${notif.is_read ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</h4>
                                        <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                                            {new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-3">{notif.message}</p>
                                    
                                    {!notif.is_read && (
                                        <button 
                                            onClick={() => handleMarkAsRead(notif.id)}
                                            className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center transition-colors"
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

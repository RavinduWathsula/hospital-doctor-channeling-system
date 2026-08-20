import React, { useState, useEffect, useRef, useContext } from 'react';
import { Bell, Check, Info, AlertCircle, Clock, CalendarCheck, CheckCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const NotificationDropdown = ({ rolePrefix = 'patient' }) => {
    const { token } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (token) {
            fetchNotifications();
            // Polling for notifications every 60 seconds
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [token]);

    useEffect(() => {
        // Click outside to close
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/notifications/my', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setNotifications(data.data);
                setUnreadCount(data.data.filter(n => !n.is_read).length);
            }
        } catch (error) {
            console.error('Error fetching notifications', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Update local state
            setNotifications(notifications.map(n => 
                n.id === id ? { ...n, is_read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read', error);
        }
    };

    const getIcon = (title) => {
        if (title.toLowerCase().includes('booked')) return <CalendarCheck size={18} className="text-blue-500" />;
        if (title.toLowerCase().includes('confirmed')) return <CheckCircle size={18} className="text-green-500" />;
        if (title.toLowerCase().includes('queue') || title.toLowerCase().includes('turn')) return <Clock size={18} className="text-orange-500" />;
        if (title.toLowerCase().includes('cancel')) return <AlertCircle size={18} className="text-red-500" />;
        return <Info size={18} className="text-indigo-500" />;
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -mt-1 -mr-1 shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Notifications</h3>
                        <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                <Bell size={32} className="mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">You have no notifications.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-50">
                                {notifications.slice(0, 5).map((n) => (
                                    <li key={n.id} className={`p-4 transition-colors hover:bg-gray-50 ${!n.is_read ? 'bg-indigo-50/40' : ''}`}>
                                        <div className="flex gap-3">
                                            <div className="mt-0.5 bg-white p-1.5 rounded-full shadow-sm border border-gray-100 h-max">
                                                {getIcon(n.title)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className={`text-sm font-semibold ${!n.is_read ? 'text-gray-900' : 'text-gray-700'}`}>{n.title}</h4>
                                                </div>
                                                <p className={`text-xs mt-1 leading-relaxed ${!n.is_read ? 'text-gray-600' : 'text-gray-500'}`}>{n.message}</p>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-[10px] font-medium text-gray-400">{formatTime(n.created_at)}</span>
                                                    {!n.is_read && (
                                                        <button 
                                                            onClick={() => markAsRead(n.id)}
                                                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                                                        >
                                                            <Check size={12} className="mr-1" /> Mark read
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    
                    <div className="p-3 border-t border-gray-100 bg-gray-50">
                        <Link 
                            to={`/${rolePrefix}/notifications`}
                            onClick={() => setIsOpen(false)}
                            className="block text-center text-sm text-indigo-600 hover:text-indigo-800 font-bold"
                        >
                            View All Notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;

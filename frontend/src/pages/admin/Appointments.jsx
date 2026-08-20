import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Calendar as CalendarIcon, Clock, User, FileText, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Appointments = () => {
    const { token } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Mock data fetch for appointments overview
        setIsLoading(true);
        setTimeout(() => {
            setAppointments([
                { id: 'APT-1001', patient: 'Michael Chen', doctor: 'Dr. Sarah Wilson', dept: 'Cardiology', date: '2026-08-21', time: '10:00 AM', status: 'CONFIRMED' },
                { id: 'APT-1002', patient: 'Emma Thompson', doctor: 'Dr. James Lee', dept: 'Neurology', date: '2026-08-21', time: '11:30 AM', status: 'PENDING' },
                { id: 'APT-1003', patient: 'David Rodriguez', doctor: 'Dr. Emily Chen', dept: 'Pediatrics', date: '2026-08-21', time: '02:00 PM', status: 'COMPLETED' },
                { id: 'APT-1004', patient: 'Sarah Jenkins', doctor: 'Dr. Michael Brown', dept: 'Orthopedics', date: '2026-08-22', time: '09:15 AM', status: 'CANCELLED' }
            ]);
            setIsLoading(false);
        }, 1000);
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'COMPLETED': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'CANCELLED': return 'bg-rose-50 text-rose-600 border-rose-200';
            default: return 'bg-slate-50 text-slate-600 border-slate-200';
        }
    };

    const tableVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const rowVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
                        <CalendarIcon className="text-emerald-600 mr-3" size={32} /> Master Appointments
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Global oversight of all hospital bookings and schedules.</p>
                </div>
            </div>

            {/* Main Table Container */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden relative">
                {isLoading ? (
                    <div className="p-12 text-center">
                        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-500 font-medium">Loading master schedule...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50/50 backdrop-blur-md text-slate-500 uppercase tracking-widest text-xs font-bold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-5">Booking ID</th>
                                    <th className="px-6 py-5">Patient Details</th>
                                    <th className="px-6 py-5">Medical Professional</th>
                                    <th className="px-6 py-5">Date & Time</th>
                                    <th className="px-6 py-5">Status</th>
                                </tr>
                            </thead>
                            <motion.tbody variants={tableVariants} initial="hidden" animate="show">
                                {appointments.map((apt) => (
                                    <motion.tr variants={rowVariants} key={apt.id} className="border-b border-slate-50 hover:bg-emerald-50/30 transition-colors group">
                                        <td className="px-6 py-4 font-black text-slate-800">{apt.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-700 font-black shadow-sm mr-4 border border-slate-200">
                                                    <User size={18} />
                                                </div>
                                                <div className="font-bold text-slate-800 text-base">{apt.patient}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800 text-base">{apt.doctor}</div>
                                            <div className="text-slate-500 text-xs font-semibold">{apt.dept}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col space-y-1">
                                                <div className="flex items-center font-bold text-slate-700">
                                                    <CalendarIcon size={14} className="mr-1.5 text-slate-400" /> {apt.date}
                                                </div>
                                                <div className="flex items-center text-slate-500 text-xs font-semibold">
                                                    <Clock size={14} className="mr-1.5 text-slate-400" /> {apt.time}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border shadow-sm ${getStatusStyle(apt.status)}`}>
                                                {apt.status}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </motion.tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Appointments;

import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Printer, Calendar, Clock, MapPin, User, CheckCircle, ArrowRight, Download, CreditCard, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

import domtoimage from 'dom-to-image-more';
import { jsPDF } from 'jspdf';

const BookingConfirmation = () => {
    const { id } = useParams();
    const { token } = useContext(AuthContext);
    const [appointment, setAppointment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const fetchAppointment = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/appointments/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setAppointment(data.data);
                } else {
                    toast.error('Appointment not found');
                }
            } catch {
                toast.error('Error fetching appointment details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAppointment();
    }, [id, token]);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const element = document.getElementById('receipt-container');
            
            // Higher scale for better print quality
            const scale = 2;
            const dataUrl = await domtoimage.toJpeg(element, {
                quality: 0.98,
                bgcolor: '#ffffff',
                width: element.clientWidth * scale,
                height: element.clientHeight * scale,
                style: {
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    width: `${element.clientWidth}px`,
                    height: `${element.clientHeight}px`
                }
            });
            
            // Setup A4 PDF
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const margin = 10;
            const finalWidth = pdfWidth - (margin * 2);
            const finalHeight = (element.clientHeight * scale * finalWidth) / (element.clientWidth * scale);
            
            pdf.addImage(dataUrl, 'JPEG', margin, margin, finalWidth, finalHeight);
            pdf.save(`Appointment-Ticket-APT-${String(appointment?.id || 0).padStart(6, '0')}.pdf`);
            
            toast.success('Bill downloaded successfully');
        } catch (error) {
            console.error('PDF Error:', error);
            toast.error(`Failed to download bill: ${error.message || 'Unknown error'}`);
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-[#f8fafc]">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!appointment) return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-[#f8fafc] text-slate-500">
            <p className="text-xl mb-4 font-bold">Could not load appointment details.</p>
            <Link to="/patient/dashboard" className="text-indigo-600 font-bold hover:underline">Return to Dashboard</Link>
        </div>
    );

    const bookedAt = appointment.created_at ? new Date(appointment.created_at) : new Date();

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-4 pb-12 px-4 print:bg-white print:py-0 font-sans print:p-8">
            <style type="text/css" media="print">
                {`@page { margin: 0; } body { margin: 1.6cm; }`}
            </style>
            <div className="max-w-2xl mx-auto">
                
                {/* Success Animation Header (Hidden on Print) */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="text-center mb-8 print:hidden"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6 shadow-lg shadow-emerald-500/20 border-4 border-white">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <CheckCircle size={40} className="text-emerald-500" />
                        </motion.div>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Payment Successful!</h1>
                    <p className="text-lg font-medium text-slate-500">Your appointment has been securely confirmed.</p>
                </motion.div>

                {/* The Ticket / Receipt */}
                <motion.div 
                    id="receipt-container"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 100, damping: 20 }}
                    className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 border border-slate-100 overflow-hidden print:shadow-none print:border-none print:rounded-none relative"
                >
                    {/* Dark Premium Header */}
                    <div className="bg-slate-900 p-10 text-white relative overflow-hidden print:bg-white print:text-black print:border-b-4 print:border-slate-800 print:p-6 print:pb-8">
                        {/* Decorative mesh */}
                        <div className="absolute top-[-50%] right-[-10%] w-[80%] h-[150%] bg-indigo-600/30 blur-[80px] rounded-full mix-blend-screen print:hidden"></div>
                        
                        {/* Hospital Letterhead */}
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/10 print:border-slate-200 pb-8">
                            <div>
                                <h2 className="text-3xl font-black tracking-tight mb-1">Smart Hospital</h2>
                                <p className="text-indigo-300 font-bold text-sm mb-1 print:text-indigo-600 uppercase tracking-widest">Elite Healthcare Center</p>
                                <p className="text-indigo-100/70 text-sm print:text-slate-500">123 Wellness Avenue, Medical District, Colombo 00700</p>
                            </div>
                            <div className="mt-4 md:mt-0 text-left md:text-right">
                                <p className="text-indigo-100/90 text-sm font-bold print:text-slate-700">Tel: +94 11 234 5678</p>
                                <p className="text-indigo-100/90 text-sm font-bold print:text-slate-700">Email: info@smarthospital.lk</p>
                                <p className="text-indigo-100/90 text-sm font-bold print:text-slate-700">Web: www.smarthospital.lk</p>
                            </div>
                        </div>

                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <div className="text-indigo-400 font-bold tracking-widest uppercase text-xs mb-2 print:text-slate-400">Official Receipt</div>
                                <h2 className="text-2xl font-black tracking-tight mb-1">Appointment Ticket</h2>
                            </div>
                            <div className="text-right">
                                <div className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1 print:text-slate-400">Status</div>
                                <span className="inline-flex items-center px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-sm font-black uppercase tracking-widest print:bg-emerald-50 print:text-emerald-700 print:border-emerald-200">
                                    <ShieldCheck size={14} className="mr-1.5" /> PAID
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-10 print:p-6">
                        
                        {/* Appointment ID & Time of Booking */}
                        <div className="flex flex-col sm:flex-row justify-between pb-8 border-b border-dashed border-slate-200 mb-8 gap-4">
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Booking Reference</div>
                                <div className="text-2xl font-black text-slate-800 tracking-tight">APT-{String(appointment.id).padStart(6, '0')}</div>
                            </div>
                            <div className="sm:text-right">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Date Issued</div>
                                <div className="text-slate-700 font-bold">
                                    {bookedAt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} at {bookedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>

                        {/* Core Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8 border-b border-dashed border-slate-200 pb-10">
                            
                            {/* Schedule Info */}
                            <div>
                                <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-5 flex items-center">
                                    <Calendar className="mr-2" size={14} /> Schedule Details
                                </h3>
                                <div className="space-y-5">
                                    <div className="flex justify-between items-end">
                                        <div className="text-slate-500 font-bold text-sm">Consultation Date</div>
                                        <div className="text-slate-900 font-black">{new Date(appointment.appointment_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="text-slate-500 font-bold text-sm">Time Slot</div>
                                        <div className="text-indigo-600 font-black bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">{appointment.appointment_time}</div>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="text-slate-500 font-bold text-sm">Queue Number</div>
                                        <div className="text-slate-900 font-black text-xl">#{appointment.queue_number}</div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Doctor Info */}
                            <div>
                                <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-5 flex items-center">
                                    <User className="mr-2" size={14} /> Practitioner
                                </h3>
                                <div className="space-y-5">
                                    <div className="flex justify-between items-end">
                                        <div className="text-slate-500 font-bold text-sm">Doctor Name</div>
                                        <div className="text-slate-900 font-black text-right">Dr. {appointment.doctor_first_name} {appointment.doctor_last_name}</div>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="text-slate-500 font-bold text-sm">Department</div>
                                        <div className="text-slate-700 font-bold text-right">{appointment.department_name} Dept</div>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="text-slate-500 font-bold text-sm">Patient Name</div>
                                        <div className="text-slate-700 font-bold text-right">{appointment.patient_first_name} {appointment.patient_last_name}</div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Payment Breakdown */}
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8 print:bg-white print:border-none print:p-0">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center print:hidden">
                                <CreditCard className="mr-2" size={14} /> Payment Summary
                            </h3>
                            
                            <div className="flex justify-between items-center mb-3 text-sm">
                                <div className="text-slate-600 font-bold">Consultation Fee</div>
                                <div className="text-slate-800 font-black">LKR {parseFloat(appointment.consultation_fee).toLocaleString()}</div>
                            </div>
                            <div className="flex justify-between items-center mb-4 text-sm">
                                <div className="text-slate-600 font-bold">Platform Fee (Tax Incl.)</div>
                                <div className="text-slate-800 font-black">LKR 0.00</div>
                            </div>
                            
                            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                                <div className="text-slate-900 font-black uppercase tracking-wider">Total Paid</div>
                                <div className="flex items-baseline">
                                    <span className="text-slate-500 font-bold mr-2 text-lg">LKR</span>
                                    <span className="text-3xl font-black text-indigo-600">{parseFloat(appointment.consultation_fee).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-center text-xs font-bold text-slate-400 italic px-6 print:text-left print:px-0">
                            Please arrive 15 minutes before your scheduled appointment time. <br className="hidden sm:block" /> Bring a valid ID and this confirmation ticket (digital or printed).
                        </div>
                    </div>
                    
                    {/* Dotted Tear-off edge effect at the bottom (Hidden on print) */}
                    <div className="h-4 w-full bg-[radial-gradient(circle,transparent_4px,#ffffff_5px)] bg-[length:16px_16px] absolute -bottom-2 left-0 right-0 rotate-180 print:hidden opacity-0"></div>
                </motion.div>

                {/* Action Buttons (Hide on print) */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-10 flex flex-col sm:flex-row justify-center gap-4 print:hidden"
                >
                    <button 
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="px-8 py-4 bg-white border border-slate-200 text-slate-700 font-black rounded-[1.5rem] hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center transition-all shadow-sm group disabled:opacity-70"
                    >
                        {isDownloading ? (
                            <div className="w-5 h-5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin mr-3"></div>
                        ) : (
                            <Download size={20} className="mr-3 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        )}
                        {isDownloading ? 'Downloading...' : 'Download Bill (PDF)'}
                    </button>
                    <Link 
                        to="/patient/dashboard"
                        className="px-8 py-4 bg-slate-900 text-white font-black rounded-[1.5rem] hover:bg-indigo-600 flex items-center justify-center transition-all shadow-xl shadow-slate-900/20 group"
                    >
                        Go to Dashboard <ArrowRight size={20} className="ml-3 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default BookingConfirmation;

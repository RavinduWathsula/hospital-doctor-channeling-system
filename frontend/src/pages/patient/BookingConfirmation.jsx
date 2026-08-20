import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Printer, Calendar, Clock, MapPin, User, CheckCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const BookingConfirmation = () => {
    const { id } = useParams();
    const { token } = useContext(AuthContext);
    const [appointment, setAppointment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

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

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!appointment) return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 text-gray-500">
            <p className="text-xl mb-4">Could not load appointment details.</p>
            <Link to="/patient/dashboard" className="text-blue-600 underline">Return to Dashboard</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 print:bg-white print:py-0">
            <div className="max-w-3xl mx-auto">
                {/* Success Banner (Hide on print) */}
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 text-center print:hidden">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle size={32} className="text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-green-800 mb-2">Booking Confirmed!</h1>
                    <p className="text-green-600">Your appointment has been successfully scheduled.</p>
                </div>

                {/* Printable Ticket */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden print:shadow-none print:border-none">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white text-center print:text-gray-900 print:bg-none print:border-b-2 print:border-gray-200">
                        <h2 className="text-3xl font-extrabold uppercase tracking-wider opacity-90">Appointment Ticket</h2>
                        <p className="mt-2 opacity-80 print:text-gray-500">Smart Hospital Channeling System</p>
                    </div>
                    
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 border-b border-gray-100 pb-8">
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Appointment Details</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Appointment Number</div>
                                        <div className="text-xl font-bold text-gray-900">APT-{String(appointment.id).padStart(6, '0')}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Queue Number</div>
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-700 text-2xl font-black">
                                            {appointment.queue_number}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Status</div>
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase">
                                            {appointment.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Schedule & Doctor</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <Calendar className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                                        <div>
                                            <div className="text-xs text-gray-500">Date</div>
                                            <div className="font-semibold text-gray-900">{new Date(appointment.appointment_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <Clock className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                                        <div>
                                            <div className="text-xs text-gray-500">Time</div>
                                            <div className="font-semibold text-gray-900 text-lg">{appointment.appointment_time}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <User className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                                        <div>
                                            <div className="text-xs text-gray-500">Doctor</div>
                                            <div className="font-semibold text-gray-900">Dr. {appointment.doctor_first_name} {appointment.doctor_last_name}</div>
                                            <div className="text-sm text-gray-500">{appointment.department_name} Dept</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Patient Information</h3>
                            <div className="bg-gray-50 p-4 rounded-xl flex items-center">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg mr-4">
                                    {appointment.patient_first_name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">{appointment.patient_first_name} {appointment.patient_last_name}</div>
                                    <div className="text-sm text-gray-500">Email: {appointment.patient_email}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex justify-between items-center mt-6">
                            <div className="text-blue-800 font-semibold">Consultation Fee</div>
                            <div className="text-2xl font-black text-blue-600">${appointment.consultation_fee}</div>
                        </div>

                        <div className="text-center mt-8 text-xs text-gray-400 italic">
                            Please arrive 15 minutes before your scheduled appointment time. Bring your ID and this confirmation ticket.
                        </div>
                    </div>
                </div>

                {/* Action Buttons (Hide on print) */}
                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 print:hidden">
                    <button 
                        onClick={handlePrint}
                        className="px-8 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 flex items-center justify-center transition-colors shadow-sm"
                    >
                        <Printer size={18} className="mr-2" /> Print Ticket
                    </button>
                    <Link 
                        to="/patient/dashboard"
                        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center transition-colors shadow-md shadow-blue-500/20"
                    >
                        Go to Dashboard <ArrowRight size={18} className="ml-2" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmation;

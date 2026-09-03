import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { CreditCard, Download, Receipt, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Billing = () => {
    const { token } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [aptRes, docRes] = await Promise.all([
                    fetch('/api/appointments/my-appointments', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch('/api/doctors')
                ]);
                
                const aptData = await aptRes.json();
                const docData = await docRes.json();
                
                if (aptData.success) {
                    let finalApts = aptData.data;
                    
                    // Merge consultation_fee dynamically in case backend isn't sending it
                    if (docData.success && docData.data) {
                        finalApts = finalApts.map(apt => {
                            const doctor = docData.data.find(d => d.id === apt.doctor_id);
                            return {
                                ...apt,
                                consultation_fee: apt.consultation_fee || (doctor ? doctor.consultation_fee : 0)
                            };
                        });
                    }
                    
                    setAppointments(finalApts);
                }
            } catch (error) {
                toast.error('Failed to load billing history');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [token]);

    const paidAppointments = appointments.filter(apt => apt.status !== 'CANCELLED');

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
                        Billing & <span className="text-emerald-600">Payments</span>
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg font-medium">Manage your invoices and payment history.</p>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                    </div>
                ) : paidAppointments.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col items-center justify-center h-[28rem]">
                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-[2rem] shadow-inner flex items-center justify-center text-emerald-500 mb-8 rotate-3">
                            <CreditCard size={48} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">No Payment History</h2>
                        <p className="text-slate-500 max-w-md text-lg">You do not have any past or pending payments. Your billing history will be displayed here once you book an appointment.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center">
                                <Receipt className="mr-3 text-emerald-500" size={24} />
                                Payment History
                            </h2>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {paidAppointments.map(apt => (
                                <div key={apt.id} className="p-6 md:p-8 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 bg-emerald-100/50 text-emerald-600 rounded-2xl flex items-center justify-center font-black shrink-0 border border-emerald-200/50">
                                            <CreditCard size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-slate-900 text-lg">Consultation: Dr. {apt.doctor_first_name} {apt.doctor_last_name}</h3>
                                                <span className="inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold uppercase tracking-wider">
                                                    <ShieldCheck size={14} className="mr-1" /> Paid
                                                </span>
                                            </div>
                                            <p className="text-slate-500 text-sm font-medium mb-1">
                                                Invoice #APT-{String(apt.id).padStart(6, '0')} • {new Date(apt.created_at || apt.appointment_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row items-center gap-6 shrink-0">
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-0.5">Amount</p>
                                            <p className="text-xl font-black text-slate-800">LKR {parseFloat(apt.consultation_fee || 0).toLocaleString()}</p>
                                        </div>
                                        
                                        <div className="w-px h-12 bg-slate-200 hidden sm:block"></div>
                                        
                                        <Link 
                                            to={`/confirmation/${apt.id}`}
                                            className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 flex items-center justify-center transition-all shadow-sm"
                                        >
                                            <Download size={18} className="mr-2" /> 
                                            View & Download
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Billing;

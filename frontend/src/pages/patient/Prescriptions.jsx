import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Pill, Calendar, User, FileText, Download } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';


export default function Prescriptions() {
    const { token } = useContext(AuthContext);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const fetchPrescriptions = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/prescriptions/patient', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setPrescriptions(data.data);
            }
        } catch (error) {
            toast.error('Failed to load prescriptions');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (prescription) => {
        const element = document.getElementById(`prescription-${prescription.id}`);
        const opt = {
            margin:       10,
            filename:     `Prescription_${prescription.doctor_first_name}_${prescription.doctor_last_name}_${new Date(prescription.created_at).toLocaleDateString().replace(/\//g, '-')}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                    <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-teal-100 text-teal-600 rounded-xl">
                            <Pill size={28} />
                        </div>
                        My <span className="text-teal-600">Prescriptions</span>
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg font-medium">View and manage medications prescribed by your doctors.</p>
                </motion.div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                    {prescriptions.map((prescription) => (
                        <div key={prescription.id} id={`prescription-${prescription.id}`} className="bg-white rounded-[2rem] shadow-sm hover:shadow-xl border border-slate-100 overflow-hidden transition-all duration-300 group hover:-translate-y-1 relative">
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-100 to-teal-50/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                            
                            <div className="p-6 border-b border-slate-50 flex justify-between items-start z-10">
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 tracking-tight">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-teal-600">
                                            <User size={16} />
                                        </div>
                                        Dr. {prescription.doctor_first_name} {prescription.doctor_last_name}
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-2 flex items-center gap-1.5 ml-10 font-medium">
                                        <Calendar size={14} className="text-slate-400" />
                                        {new Date(prescription.created_at).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                                <div 
                                    className="p-2.5 bg-teal-50 text-teal-600 rounded-xl shadow-sm border border-teal-100/50 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300 cursor-pointer" 
                                    title="Download Prescription"
                                    onClick={() => handleDownload(prescription)}
                                    data-html2canvas-ignore
                                >
                                    <Download size={20} />
                                </div>
                            </div>
                            
                            <div className="p-6 z-10">
                                {prescription.notes && (
                                    <div className="mb-6 relative">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 rounded-full"></div>
                                        <div className="pl-4">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Doctor's Notes</p>
                                            <p className="text-sm text-slate-700 bg-slate-50/80 p-4 rounded-2xl border border-slate-100 shadow-inner font-medium italic">{prescription.notes}</p>
                                        </div>
                                    </div>
                                )}
                                
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        Prescribed Medicines 
                                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">{prescription.items?.length || 0}</span>
                                    </p>
                                    <ul className="space-y-3">
                                        {prescription.items?.map((item) => (
                                            <li key={item.id} className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 bg-white hover:bg-teal-50/30 transition-colors shadow-sm hover:border-teal-200 group/item">
                                                <div className="mt-1 p-2 bg-teal-100 text-teal-600 rounded-xl group-hover/item:scale-110 transition-transform shadow-sm">
                                                    <Pill size={16} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-slate-800 text-base">{item.medicine_name}</p>
                                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                        <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-lg border border-teal-100/50">{item.dosage}</span>
                                                        <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">{item.frequency}</span>
                                                        <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">{item.duration}</span>
                                                    </div>
                                                    {item.instructions && (
                                                        <p className="text-sm text-slate-500 mt-2 italic flex gap-2 items-start bg-slate-50/50 p-2 rounded-lg">
                                                            <span className="text-slate-400 font-serif text-lg leading-none">"</span>
                                                            {item.instructions}
                                                        </p>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}

                    {prescriptions.length === 0 && (
                        <div className="col-span-full bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col items-center justify-center h-[28rem]">
                            <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-teal-50 rounded-[2rem] shadow-inner flex items-center justify-center text-teal-500 mb-8 rotate-3">
                                <FileText size={48} strokeWidth={1.5} />
                            </div>
                            <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">No Prescriptions Found</h2>
                            <p className="text-slate-500 max-w-md text-lg">You do not have any prescriptions yet. Your past prescriptions will appear here once issued by a doctor.</p>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}

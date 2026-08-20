import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard } from 'lucide-react';

const Billing = () => {
    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
                    Billing & <span className="text-emerald-600">Payments</span>
                </h1>
                <p className="text-slate-500 mt-2 text-lg font-medium">Manage your invoices and payment history.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col items-center justify-center h-[28rem]">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-[2rem] shadow-inner flex items-center justify-center text-emerald-500 mb-8 rotate-3">
                        <CreditCard size={48} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">No Outstanding Invoices</h2>
                    <p className="text-slate-500 max-w-md text-lg">You do not have any pending payments. Your billing history will be displayed here.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default Billing;

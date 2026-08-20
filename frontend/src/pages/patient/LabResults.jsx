import React from 'react';
import { motion } from 'framer-motion';
import { FileBarChart } from 'lucide-react';

const LabResults = () => {
    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
                    Lab <span className="text-blue-600">Results</span>
                </h1>
                <p className="text-slate-500 mt-2 text-lg font-medium">Access your digital medical reports securely.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col items-center justify-center h-[28rem]">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-50 rounded-[2rem] shadow-inner flex items-center justify-center text-blue-500 mb-8 rotate-3">
                        <FileBarChart size={48} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">No Lab Results Available</h2>
                    <p className="text-slate-500 max-w-md text-lg">Your recent medical tests and lab reports will appear here once they are processed by the hospital laboratory.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default LabResults;

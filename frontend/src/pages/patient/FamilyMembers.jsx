import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';

const FamilyMembers = () => {
    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
                    Family <span className="text-orange-600">Members</span>
                </h1>
                <p className="text-slate-500 mt-2 text-lg font-medium">Manage your dependents and linked accounts.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col items-center justify-center h-[28rem]">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-50 rounded-[2rem] shadow-inner flex items-center justify-center text-orange-500 mb-8 rotate-3">
                        <UserPlus size={48} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Add Your Family</h2>
                    <p className="text-slate-500 mb-10 max-w-md text-lg">Link your children or elderly parents to your account so you can book channeling sessions on their behalf seamlessly.</p>
                    <button className="px-8 py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/30">
                        + Add Dependent
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default FamilyMembers;

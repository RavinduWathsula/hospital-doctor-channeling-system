import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, CreditCard, Shield, Globe, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Settings = () => {
    const [isLoading, setIsLoading] = useState(false);
    
    const [settings, setSettings] = useState({
        hospitalName: 'Smart Hospital System',
        contactEmail: 'admin@smarthospital.com',
        contactPhone: '+1 (555) 123-4567',
        enableSms: true,
        enableEmailReminders: true,
        maintenanceMode: false
    });

    const handleSave = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast.success('System settings updated successfully');
        }, 1000);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings({ ...settings, [name]: type === 'checkbox' ? checked : value });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
                        <SettingsIcon className="text-slate-600 mr-3" size={32} /> System Settings
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Configure hospital globals, integrations, and automated alerts.</p>
                </div>
            </div>

            <motion.form 
                variants={containerVariants} initial="hidden" animate="show" 
                onSubmit={handleSave} 
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
                {/* General Settings */}
                <motion.div variants={cardVariants} className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                    <div className="flex items-center mb-6">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mr-4 border border-blue-100 shadow-inner">
                            <Globe size={24} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">General Information</h2>
                    </div>
                    
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Hospital Name</label>
                            <input type="text" name="hospitalName" value={settings.hospitalName} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Public Support Email</label>
                            <input type="email" name="contactEmail" value={settings.contactEmail} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Contact Hotline</label>
                            <input type="text" name="contactPhone" value={settings.contactPhone} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none" />
                        </div>
                    </div>
                </motion.div>

                {/* Automation & Security */}
                <div className="space-y-6">
                    <motion.div variants={cardVariants} className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                        <div className="flex items-center mb-6">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mr-4 border border-indigo-100 shadow-inner">
                                <Bell size={24} />
                            </div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Automated Alerts</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <label className="flex items-center p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                                <input type="checkbox" name="enableSms" checked={settings.enableSms} onChange={handleChange} className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                                <div className="ml-4">
                                    <span className="block text-sm font-bold text-slate-800">SMS Reminders</span>
                                    <span className="block text-xs text-slate-500 font-medium mt-0.5">Send text messages to patients 24h before appointments.</span>
                                </div>
                            </label>
                            
                            <label className="flex items-center p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                                <input type="checkbox" name="enableEmailReminders" checked={settings.enableEmailReminders} onChange={handleChange} className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                                <div className="ml-4">
                                    <span className="block text-sm font-bold text-slate-800">Email Notifications</span>
                                    <span className="block text-xs text-slate-500 font-medium mt-0.5">Send booking confirmations and digital receipts.</span>
                                </div>
                            </label>
                        </div>
                    </motion.div>

                    <motion.div variants={cardVariants} className="bg-slate-900 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="flex items-center mb-6 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-rose-500 mr-4 border border-slate-700">
                                <Shield size={24} />
                            </div>
                            <h2 className="text-xl font-black text-white tracking-tight">System Controls</h2>
                        </div>
                        
                        <label className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors relative z-10">
                            <div>
                                <span className="block text-sm font-bold text-white">Maintenance Mode</span>
                                <span className="block text-xs text-slate-400 font-medium mt-0.5">Disable public bookings temporarily.</span>
                            </div>
                            <div className={`w-14 h-8 rounded-full p-1 transition-colors ${settings.maintenanceMode ? 'bg-rose-500' : 'bg-slate-700'}`}>
                                <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                            <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} className="hidden" />
                        </label>
                    </motion.div>
                </div>

                <motion.div variants={cardVariants} className="col-span-1 lg:col-span-2 flex justify-end pt-4">
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="flex items-center justify-center px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        ) : (
                            <Save size={20} className="mr-3" />
                        )}
                        {isLoading ? 'Saving Configuration...' : 'Save Configuration'}
                    </button>
                </motion.div>
            </motion.form>
        </div>
    );
};

export default Settings;

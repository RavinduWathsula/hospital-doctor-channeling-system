import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { Settings as SettingsIcon, Palette, CheckCircle2, Bell, Clock } from 'lucide-react';

const DoctorSettings = () => {
    const { themeName, setThemeName, availableThemes, THEMES } = useContext(ThemeContext);

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <SettingsIcon className="mr-3 text-theme-600" size={28} />
                    Settings
                </h1>
                <p className="text-gray-500 mt-1">Customize your portal experience.</p>
            </div>

            {/* Theme Settings */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                    <div className="w-10 h-10 bg-theme-50 text-theme-600 rounded-xl flex items-center justify-center">
                        <Palette size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Theme Preference</h2>
                </div>
                
                <p className="text-slate-500 mb-6">Choose your preferred color theme for the portal. This will apply to all your dashboards and interfaces.</p>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {availableThemes.map((name) => {
                        const isSelected = themeName === name;
                        const mainColor = THEMES[name][500];
                        
                        return (
                            <button
                                key={name}
                                onClick={() => setThemeName(name)}
                                className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${isSelected ? 'border-theme-500 shadow-md transform scale-105' : 'border-slate-100 hover:border-slate-300 hover:shadow-sm'}`}
                            >
                                <div 
                                    className="w-12 h-12 rounded-full mb-3 shadow-sm flex items-center justify-center"
                                    style={{ backgroundColor: mainColor }}
                                >
                                    {isSelected && <CheckCircle2 className="text-white" size={24} />}
                                </div>
                                <span className={`font-semibold capitalize ${isSelected ? 'text-slate-800' : 'text-slate-500'}`}>
                                    {name}
                                </span>
                                {isSelected && (
                                    <div 
                                        className="absolute inset-0 rounded-2xl opacity-10"
                                        style={{ backgroundColor: mainColor }}
                                    ></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                    <div className="w-10 h-10 bg-theme-50 text-theme-600 rounded-xl flex items-center justify-center">
                        <Bell size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Notification Preferences</h2>
                </div>
                
                <div className="space-y-4">
                    {[
                        { title: 'Email Notifications', desc: 'Receive appointment updates via email.', active: true },
                        { title: 'SMS Alerts', desc: 'Get text messages for immediate alerts.', active: false },
                        { title: 'Browser Push Notifications', desc: 'Receive notifications directly in your browser.', active: true },
                        { title: 'Daily Summary', desc: 'Receive a daily email summary of your upcoming appointments.', active: true },
                    ].map((pref, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-800">{pref.title}</h3>
                                <p className="text-sm text-slate-500">{pref.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked={pref.active} />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-500"></div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Appointment Preferences */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                    <div className="w-10 h-10 bg-theme-50 text-theme-600 rounded-xl flex items-center justify-center">
                        <Clock size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Appointment Preferences</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Default Buffer Time (Minutes)</label>
                        <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-500 text-slate-700 font-medium">
                            <option value="5">5 Minutes</option>
                            <option value="10">10 Minutes</option>
                            <option value="15">15 Minutes</option>
                        </select>
                        <p className="text-xs text-slate-500 mt-2">Buffer time added between consecutive appointments.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Cancellation Policy</label>
                        <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-500 text-slate-700 font-medium">
                            <option value="flexible">Flexible (Up to 2 hrs before)</option>
                            <option value="moderate">Moderate (Up to 12 hrs before)</option>
                            <option value="strict">Strict (Up to 24 hrs before)</option>
                        </select>
                        <p className="text-xs text-slate-500 mt-2">Minimum time allowed for a patient to cancel.</p>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button className="px-6 py-3 bg-theme-600 hover:bg-theme-700 text-white font-bold rounded-xl shadow-lg shadow-theme-500/30 transition-all">
                        Save Preferences
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DoctorSettings;

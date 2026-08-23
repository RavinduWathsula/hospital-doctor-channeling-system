import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { Settings as SettingsIcon, Palette, CheckCircle2 } from 'lucide-react';

const DoctorSettings = () => {
    const { themeName, setThemeName, availableThemes, THEMES } = useContext(ThemeContext);

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <SettingsIcon className="mr-3 text-theme-600" size={28} />
                    Settings
                </h1>
                <p className="text-gray-500 mt-1">Customize your portal experience.</p>
            </div>

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
        </div>
    );
};

export default DoctorSettings;

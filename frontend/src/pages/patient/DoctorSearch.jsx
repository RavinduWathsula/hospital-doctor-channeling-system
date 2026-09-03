import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, Briefcase, DollarSign, ChevronRight, Award, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import StateWrapper from '../../components/ui/StateWrapper';
import { motion, AnimatePresence } from 'framer-motion';

const DoctorSearch = () => {
    const { token } = useContext(AuthContext);
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedSpec, setSelectedSpec] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        fetchDoctors();
    }, [selectedDept]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen]);

    const fetchDepartments = async () => {
        try {
            const res = await fetch('/api/departments', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setDepartments(data.data);
        } catch { console.error("Error fetching departments"); }
    };

    const fetchDoctors = async () => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (searchTerm) queryParams.append('name', searchTerm);
            if (selectedDept) queryParams.append('departmentId', selectedDept);
            if (selectedSpec) queryParams.append('specialization', selectedSpec);

            const res = await fetch(`/api/doctors/search?${queryParams.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setDoctors(data.data);
            else toast.error('Error fetching doctors');
        } catch {
            toast.error('Failed to load doctors');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchDoctors();
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 350, damping: 25 } }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-16 font-sans">
            {/* Ultra-Premium Hero Section */}
            <div className="relative mx-4 mt-4 mb-16 rounded-[3rem] bg-slate-900 shadow-2xl shadow-indigo-900/20 z-30">
                {/* Mesh Gradient Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[3rem]">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[120%] bg-indigo-600/30 blur-[120px] rounded-full mix-blend-screen"></div>
                    <div className="absolute bottom-[-30%] right-[-10%] w-[60%] h-[120%] bg-blue-500/30 blur-[120px] rounded-full mix-blend-screen"></div>
                    <div className="absolute top-[20%] right-[20%] w-[30%] h-[60%] bg-purple-500/20 blur-[100px] rounded-full mix-blend-screen"></div>
                    {/* Noise texture overlay for a premium grainy feel */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
                </div>

                <div className="relative z-10 pt-10 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="inline-flex items-center px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 text-indigo-200 rounded-full text-xs font-bold tracking-widest uppercase mb-4 shadow-inner shadow-white/5"
                    >
                        <Sparkles size={14} className="mr-2 text-indigo-400" />
                        Next-Gen Healthcare
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                        className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 leading-tight"
                    >
                        Discover <br className="md:hidden" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">Exceptional Care</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="text-lg text-slate-300 max-w-2xl font-medium mb-8"
                    >
                        Connect with elite specialists and book your consultation instantly through our intelligent matching system.
                    </motion.p>

                    {/* Integrated Floating Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="w-full max-w-4xl"
                    >
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row bg-white/10 backdrop-blur-2xl border border-white/20 p-2 md:p-3 rounded-[2rem] md:rounded-full shadow-2xl shadow-indigo-900/50">
                            
                            {/* Search Input */}
                            <div className="flex-1 flex items-center px-4 py-3 md:py-0">
                                <Search className="text-indigo-300 mr-3 shrink-0" size={24} />
                                <input
                                    type="text"
                                    placeholder="Search doctor, condition, or expertise..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-transparent border-none text-white placeholder-slate-400 outline-none text-lg font-medium"
                                />
                            </div>

                            {/* Divider (visible only on desktop) */}
                            <div className="hidden md:block w-[1px] h-10 bg-white/10 mx-2 self-center"></div>

                            {/* Custom Select Department */}
                            <div className="flex-1 flex items-center px-4 py-3 md:py-0 border-t border-white/10 md:border-none relative">
                                <Filter className="text-indigo-300 mr-3 shrink-0" size={20} />
                                
                                <div className="w-full relative" ref={dropdownRef}>
                                    <button 
                                        type="button"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="w-full flex items-center justify-between bg-transparent border-none text-white outline-none cursor-pointer text-lg font-medium text-left"
                                    >
                                        <span className="truncate">
                                            {selectedDept === '' ? 'All Departments' : departments.find(d => d.id == selectedDept)?.name || 'All Departments'}
                                        </span>
                                        <motion.div animate={{ rotate: isDropdownOpen ? -90 : 90 }} transition={{ duration: 0.2 }}>
                                            <ChevronRight size={18} className="text-indigo-300 ml-2 shrink-0" />
                                        </motion.div>
                                    </button>

                                    {/* Premium Glassmorphism Dropdown Menu */}
                                    <AnimatePresence>
                                        {isDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                                transition={{ duration: 0.2, ease: "easeOut" }}
                                                className="absolute top-full left-0 right-0 mt-4 md:mt-6 bg-white/95 backdrop-blur-3xl rounded-[1.5rem] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.3)] border border-white/60 overflow-hidden z-50 min-w-[200px]"
                                            >
                                                    <div className="p-2 space-y-1 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent">
                                                        <button
                                                            type="button"
                                                            onClick={() => { setSelectedDept(''); setIsDropdownOpen(false); }}
                                                            className={`w-full text-left px-5 py-3 rounded-xl text-sm font-black transition-all duration-200 ${selectedDept === '' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'text-slate-600 hover:bg-slate-100/80 hover:text-indigo-600'}`}
                                                        >
                                                            All Departments
                                                        </button>
                                                        {departments.map(d => (
                                                            <button
                                                                key={d.id}
                                                                type="button"
                                                                onClick={() => { setSelectedDept(d.id); setIsDropdownOpen(false); }}
                                                                className={`w-full text-left px-5 py-3 rounded-xl text-sm font-black transition-all duration-200 ${selectedDept == d.id ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'text-slate-600 hover:bg-slate-100/80 hover:text-indigo-600'}`}
                                                            >
                                                                {d.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button type="submit" className="mt-3 md:mt-0 w-full md:w-auto px-10 py-4 md:py-3 bg-white hover:bg-slate-50 text-indigo-900 font-bold rounded-2xl md:rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transform hover:scale-105 active:scale-95 whitespace-nowrap">
                                Find Doctors
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                <StateWrapper
                    loading={isLoading}
                    empty={doctors.length === 0 && !isLoading}
                    emptyMessage="No doctors match your highly refined search criteria."
                >
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                    >
                        {doctors.map(doctor => (
                            <motion.div
                                variants={cardVariants}
                                whileHover={{ y: -12, transition: { duration: 0.3 } }}
                                key={doctor.id}
                                className="group relative bg-white rounded-[2.5rem] p-2 shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300"
                            >
                                <div className="bg-slate-50/50 rounded-[2rem] h-full flex flex-col overflow-hidden relative border border-slate-100">
                                    
                                    {/* Top Cover Gradient */}
                                    <div className="h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]"></div>
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                                        {/* Status Dot inside the cover */}
                                        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/40 px-3 py-1 rounded-full flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2 shadow-[0_0_8px_#34d399]"></div>
                                            <span className="text-xs font-bold text-white uppercase tracking-wider">Available</span>
                                        </div>
                                    </div>
                                    
                                    {/* Avatar (Squircle style breaking out of the cover) */}
                                    <div className="absolute top-12 left-1/2 -translate-x-1/2 z-10">
                                        <div className="w-28 h-28 rounded-3xl bg-white p-1.5 shadow-xl shadow-indigo-900/10 -rotate-3 group-hover:rotate-0 transition-transform duration-500 ease-out">
                                            <div className="w-full h-full rounded-2xl overflow-hidden bg-indigo-50 flex items-center justify-center">
                                                {doctor.profile_image ? (
                                                    <img src={doctor.profile_image} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                ) : (
                                                    <span className="text-4xl font-black text-indigo-400">{doctor.first_name.charAt(0)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Card Content */}
                                    <div className="pt-16 pb-6 px-6 flex-1 flex flex-col text-center">
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1 group-hover:text-indigo-600 transition-colors">
                                            Dr. {doctor.first_name} {doctor.last_name}
                                        </h3>
                                        
                                        <div className="flex justify-center mb-6">
                                            <span className="inline-flex items-center px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest border border-indigo-100">
                                                {doctor.specialization}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-3 mt-auto">
                                            <div className="flex items-center justify-between text-sm font-semibold text-slate-600 bg-white p-3 rounded-2xl shadow-sm border border-slate-100 group-hover:border-indigo-100 transition-colors">
                                                <div className="flex items-center"><MapPin size={16} className="text-indigo-400 mr-2" /> Dept</div>
                                                <span className="text-slate-900">{doctor.department_name}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm font-semibold text-slate-600 bg-white p-3 rounded-2xl shadow-sm border border-slate-100 group-hover:border-indigo-100 transition-colors">
                                                <div className="flex items-center"><Briefcase size={16} className="text-indigo-400 mr-2" /> Exp</div>
                                                <span className="text-slate-900">{doctor.experience_years} Yrs</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm font-semibold text-slate-600 bg-white p-3 rounded-2xl shadow-sm border border-slate-100 group-hover:border-indigo-100 transition-colors">
                                                <div className="flex items-center"><DollarSign size={16} className="text-indigo-400 mr-2" /> Fee</div>
                                                <span className="text-indigo-600 font-black">LKR {doctor.consultation_fee}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Action Button */}
                                    <div className="p-3 pt-0">
                                        <Link to={`/patient/doctors/${doctor.id}`} className="flex items-center justify-center w-full py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-[1.5rem] font-bold transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-indigo-500/30 group/btn">
                                            View Profile 
                                            <ChevronRight size={20} className="ml-2 transform group-hover/btn:translate-x-2 transition-transform duration-300" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </StateWrapper>
            </div>
        </div>
    );
};

export default DoctorSearch;

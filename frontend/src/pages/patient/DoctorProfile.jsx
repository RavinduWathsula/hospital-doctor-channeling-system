import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { MapPin, Briefcase, DollarSign, Award, ArrowLeft, Calendar, Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const DoctorProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    const [doctor, setDoctor] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const dayNames = {
        1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 7: 'Sunday'
    };

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/doctors/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setDoctor(data.data);
                } else {
                    toast.error(data.message || 'Doctor not found');
                    navigate('/patient/doctors');
                    return;
                }

                // Fetch schedules
                const schedRes = await fetch(`http://localhost:5000/api/doctors/${id}/availability`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const schedData = await schedRes.json();
                if (schedData.success) {
                    setSchedules(schedData.data);
                }
            } catch {
                toast.error('Failed to load profile');
                navigate('/patient/doctors');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDoctor();
    }, [id, token, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-slate-50">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!doctor) return null;

    // Animations
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-16">
            {/* Ultra-Premium Hero Section */}
            <div className="relative mx-4 sm:mx-6 lg:mx-8 mt-4 mb-24 rounded-[3rem] bg-slate-900 shadow-2xl shadow-indigo-900/20 z-10">
                {/* Back Button */}
                <button 
                    onClick={() => navigate(-1)} 
                    className="absolute top-8 left-8 z-30 flex items-center text-white/70 hover:text-white bg-white/5 hover:bg-white/10 backdrop-blur-md px-4 py-2 rounded-full transition-all border border-white/10 text-sm font-semibold"
                >
                    <ArrowLeft size={16} className="mr-2" /> Back to Search
                </button>

                {/* Mesh Gradient Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[3rem]">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[120%] bg-indigo-600/40 blur-[120px] rounded-full mix-blend-screen"></div>
                    <div className="absolute bottom-[-30%] right-[-10%] w-[60%] h-[120%] bg-blue-500/40 blur-[120px] rounded-full mix-blend-screen"></div>
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
                </div>

                <div className="relative z-20 pt-28 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-end md:justify-between gap-8">
                    
                    <div className="flex flex-col md:flex-row items-center md:items-end text-center md:text-left">
                        {/* Avatar Squircle */}
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-[2.5rem] bg-white p-2 shadow-2xl shadow-indigo-900/40 md:-mb-12 z-30"
                        >
                            <div className="w-full h-full rounded-[2rem] overflow-hidden bg-indigo-50 border border-slate-100 flex items-center justify-center relative group">
                                {doctor.profile_image ? (
                                    <img src={doctor.profile_image} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <span className="text-6xl font-black text-indigo-400">{doctor.first_name.charAt(0)}</span>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            {doctor.is_active && (
                                <div className="absolute bottom-2 right-2 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white shadow-lg z-40"></div>
                            )}
                        </motion.div>

                        {/* Title & Badges */}
                        <div className="mt-6 md:mt-0 md:ml-8 md:pb-4">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-indigo-100 rounded-full text-xs font-black tracking-widest uppercase mb-3"
                            >
                                <Award size={14} className="mr-2 text-indigo-300" />
                                {doctor.specialization}
                            </motion.div>
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter mb-2"
                            >
                                Dr. {doctor.first_name} {doctor.last_name}
                            </motion.h1>
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-indigo-100/80 font-medium"
                            >
                                <span className="flex items-center"><MapPin size={18} className="mr-2 opacity-70" /> {doctor.department_name} Department</span>
                                <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/30"></span>
                                <span className="flex items-center">Reg No: {doctor.registration_number}</span>
                            </motion.div>
                        </div>
                    </div>

                    {/* Book Action - Floating */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring' }}
                        className="md:-mb-8 z-30 w-full md:w-auto px-4 md:px-0"
                    >
                        <button 
                            onClick={() => navigate(`/book/${doctor.id}`)} 
                            className="w-full md:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-indigo-900 font-black rounded-2xl md:rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center whitespace-nowrap text-lg"
                        >
                            <Calendar size={20} className="mr-2 text-indigo-600" /> Book Appointment
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* Main Content Area */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20"
            >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column - Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* About Section */}
                        <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            
                            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center">
                                <Sparkles size={24} className="text-indigo-500 mr-3" /> About the Doctor
                            </h2>
                            
                            <div className="prose prose-lg prose-slate max-w-none text-slate-600 font-medium leading-relaxed">
                                {doctor.biography ? (
                                    <p>{doctor.biography}</p>
                                ) : (
                                    <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100 shadow-inner">
                                        <p className="text-slate-500 italic font-medium">No professional biography has been provided for this doctor yet.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                        
                        {/* Highlights/Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <motion.div variants={itemVariants} className="bg-gradient-to-br from-indigo-50/80 to-blue-50/80 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
                                    <Award size={100} />
                                </div>
                                <div className="text-indigo-500 font-bold mb-2 flex items-center text-sm uppercase tracking-wider">
                                    <Award size={16} className="mr-2" /> Qualifications
                                </div>
                                <div className="text-xl font-black text-slate-900">{doctor.qualification}</div>
                            </motion.div>
                            
                            <motion.div variants={itemVariants} className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
                                    <Briefcase size={100} />
                                </div>
                                <div className="text-emerald-600 font-bold mb-2 flex items-center text-sm uppercase tracking-wider">
                                    <Briefcase size={16} className="mr-2" /> Experience
                                </div>
                                <div className="text-xl font-black text-slate-900">{doctor.experience_years} Years of Practice</div>
                            </motion.div>
                        </div>
                    </div>
                    
                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        
                        {/* Fee Card */}
                        <motion.div variants={itemVariants} className="bg-slate-900 text-white rounded-[2rem] p-8 shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                            {/* Decorative mesh inside card */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                <div className="absolute top-[-50%] right-[-20%] w-[150%] h-[150%] bg-indigo-600/30 blur-[60px] rounded-full mix-blend-screen"></div>
                            </div>
                            
                            <div className="relative z-10">
                                <div className="text-indigo-300 font-bold mb-4 flex items-center uppercase tracking-wider text-sm">
                                    <DollarSign size={16} className="mr-2" /> Consultation Fee
                                </div>
                                <div className="flex items-baseline mb-2">
                                    <span className="text-2xl font-bold text-indigo-200 mr-2">LKR</span>
                                    <span className="text-5xl font-black text-white">{parseFloat(doctor.consultation_fee).toLocaleString()}</span>
                                </div>
                                <div className="inline-flex items-center px-3 py-1 bg-white/10 rounded-lg text-indigo-100 text-xs font-semibold mt-2">
                                    Per standard consultation
                                </div>
                            </div>
                        </motion.div>

                        {/* Availability Status */}
                        <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/40 border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                                Status
                            </h3>
                            <div className={`flex items-center p-4 rounded-2xl border ${doctor.is_active ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                                {doctor.is_active ? (
                                    <CheckCircle2 size={24} className="mr-3 shrink-0 text-emerald-500" />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-red-500 mr-3 shrink-0 flex items-center justify-center border-4 border-red-100"></div>
                                )}
                                <span className="font-bold">
                                    {doctor.is_active ? 'Currently accepting appointments' : 'Not available for booking'}
                                </span>
                            </div>
                        </motion.div>

                        {/* Weekly Schedule */}
                        <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/40 border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-5 flex items-center">
                                <Clock size={20} className="text-indigo-500 mr-2" /> Weekly Schedule
                            </h3>
                            {schedules.length > 0 ? (
                                <div className="space-y-2">
                                    {schedules.map((schedule, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                            <span className="font-bold text-slate-700">{dayNames[schedule.day_of_week]}</span>
                                            <span className="text-indigo-700 font-bold bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100/50">
                                                {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                                    <p className="text-sm font-medium text-slate-500">No schedules set for this doctor.</p>
                                </div>
                            )}
                        </motion.div>
                        
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default DoctorProfile;

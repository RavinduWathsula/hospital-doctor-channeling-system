import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
    Stethoscope, Calendar, Heart, Shield, Users, Activity, Clock, 
    ChevronRight, Star, Quote, Play, ArrowRight, MapPin, Phone, Mail, 
    ArrowUpRight, Check, Menu, X, Search, ChevronDown, CheckCircle2, Lock, Bell, Building
} from 'lucide-react';

// Custom CountUp Component
const CountUp = ({ end, duration = 2, suffix = "" }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime = null;
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }, [end, duration]);

    return <span>{count}{suffix}</span>;
};

// FAQ Accordion Item Component
const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden mb-4 shadow-sm hover:shadow-md transition-shadow">
            <button 
                className="w-full px-6 py-4 flex items-center justify-between font-bold text-slate-800 text-left"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{question}</span>
                <ChevronDown className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        <div className="px-6 pb-4 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Landing = () => {
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
            
            // This array must match the exact top-to-bottom DOM order for scrollspy to work perfectly
            const sections = ['home', 'about', 'doctors', 'specialties', 'how-it-works', 'contact'];
            
            for (const section of [...sections].reverse()) {
                const el = document.getElementById(section);
                if (el && window.scrollY >= (el.offsetTop - 300)) {
                    setActiveSection(section);
                    break;
                }
            }
        };
        window.addEventListener('scroll', handleScroll);
        // Trigger once on mount
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const stagger = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const navLinks = [
        { name: 'Home', id: 'home' },
        { name: 'About', id: 'about' },
        { name: 'Doctors', id: 'doctors' },
        { name: 'Specialties', id: 'specialties' },
        { name: 'How It Works', id: 'how-it-works' },
        { name: 'Contact', id: 'contact' }
    ];

    const specialties = [
        { name: 'Cardiology', icon: <Heart />, bg: 'bg-red-50', text: 'text-red-600', hoverBg: 'group-hover:bg-red-600' },
        { name: 'Neurology', icon: <Activity />, bg: 'bg-indigo-50', text: 'text-indigo-600', hoverBg: 'group-hover:bg-indigo-600' },
        { name: 'Pediatrics', icon: <Users />, bg: 'bg-emerald-50', text: 'text-emerald-600', hoverBg: 'group-hover:bg-emerald-600' },
        { name: 'Orthopedics', icon: <Shield />, bg: 'bg-amber-50', text: 'text-amber-600', hoverBg: 'group-hover:bg-amber-600' },
        { name: 'Dermatology', icon: <Star />, bg: 'bg-pink-50', text: 'text-pink-600', hoverBg: 'group-hover:bg-pink-600' },
        { name: 'Ophthalmology', icon: <Activity />, bg: 'bg-cyan-50', text: 'text-cyan-600', hoverBg: 'group-hover:bg-cyan-600' },
        { name: 'Dentistry', icon: <Shield />, bg: 'bg-teal-50', text: 'text-teal-600', hoverBg: 'group-hover:bg-teal-600' },
        { name: 'General Medicine', icon: <Stethoscope />, bg: 'bg-blue-50', text: 'text-blue-600', hoverBg: 'group-hover:bg-blue-600' },
    ];

    const featuredDoctors = [
        { name: 'Dr. John Perera', spec: 'Cardiologist', exp: '15+ Years', rating: '4.9', img: 'doc5' },
        { name: 'Dr. Sarah Jenkins', spec: 'Neurologist', exp: '12+ Years', rating: '4.8', img: 'doc2' },
        { name: 'Dr. Michael Chen', spec: 'Pediatrician', exp: '10+ Years', rating: '4.9', img: 'doc3' },
        { name: 'Dr. Emily Watson', spec: 'Orthopedic Surgeon', exp: '20+ Years', rating: '5.0', img: 'doc4' },
    ];

    const hospitals = [
        { name: 'Central General Hospital', location: 'Colombo 07', specs: '15+ Specialties', docs: '120+ Doctors' },
        { name: 'Medicare Center', location: 'Mount Lavinia', specs: '10+ Specialties', docs: '80+ Doctors' },
        { name: 'Lanka Care Hospital', location: 'Kandy', specs: '12+ Specialties', docs: '95+ Doctors' },
    ];

    const whyChooseUs = [
        'Easy Online Booking',
        'Verified Doctors',
        'Real-Time Availability',
        'Multiple Specialties',
        'Secure Platform',
        'Appointment Reminders'
    ];

    const [doctorsList, setDoctorsList] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/doctors/search')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setDoctorsList(data.data || []);
                }
            })
            .catch(err => console.error('Error fetching doctors:', err));
    }, []);

    const faqs = [
        { q: "How do I book an appointment?", a: "Search for a doctor or specialty, select an available date and time session, and confirm your booking securely online." },
        { q: "Are all doctors on this platform verified?", a: "Yes, every doctor listed on our platform is verified through their respective medical councils and hospital boards." },
        { q: "Can I cancel or reschedule my appointment?", a: "Absolutely. You can manage, reschedule, or cancel your appointment from your account dashboard up to 2 hours before the session." },
        { q: "How will I know my appointment is confirmed?", a: "You will receive an instant confirmation email and SMS with your appointment details and reference number." },
        { q: "Is my medical and personal data secure?", a: "We use bank-level encryption to ensure all your personal and medical information is completely private and secure." },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 font-sans selection:bg-blue-200 overflow-x-hidden text-slate-800 relative">
            {/* Global Background Blurs */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/40 blur-[100px] animate-pulse"></div>
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/40 blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-cyan-400/40 blur-[100px] animate-pulse"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNFMkU4RjAiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PC9zdmc+')] opacity-60"></div>
            </div>
            
            <div className="relative z-10">
            
            {/* 1. Navbar */}
            <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-md py-4' : 'bg-white/80 backdrop-blur-md border-b border-white/50 shadow-sm py-5'}`}>
                <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center gap-4">
                        <Link to="/" className="flex items-center gap-3 group shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:shadow-blue-600/40 transition-all duration-300 group-hover:scale-105">
                                <Stethoscope className="text-white" size={20} />
                            </div>
                            <span className="text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 whitespace-nowrap">
                                SmartHospital
                            </span>
                        </Link>
                        
                        <div className="hidden xl:flex items-center gap-1 bg-slate-100/50 rounded-2xl px-1.5 py-1">
                            {navLinks.map((item) => (
                                <a key={item.name} href={`#${item.id}`} className={`relative px-4 py-2 text-sm font-bold rounded-xl transition-all group whitespace-nowrap ${activeSection === item.id ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-700 hover:text-blue-700 hover:bg-white/80'}`}>
                                    {item.name}
                                </a>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <Link to="/login" className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors hidden md:block px-2 whitespace-nowrap">
                                Login
                            </Link>
                            <Link to="/register" className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors hidden md:block px-2 border-r border-slate-300 pr-4 whitespace-nowrap">
                                Register
                            </Link>
                            <Link to="/register" className="group relative bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden hidden sm:block whitespace-nowrap">
                                Book Appointment
                            </Link>
                            <button className="xl:hidden text-slate-700 hover:text-blue-600 p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="xl:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200 overflow-hidden"
                        >
                            <div className="px-4 py-4 space-y-2 flex flex-col">
                                {navLinks.map((item) => (
                                    <a key={item.name} href={`#${item.id}`} onClick={() => setMobileMenuOpen(false)} className={`block px-4 py-3 rounded-xl font-bold ${activeSection === item.id ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                                        {item.name}
                                    </a>
                                ))}
                                <div className="border-t border-slate-100 pt-4 mt-2 flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <Link to="/login" className="flex-1 px-4 py-3 text-center font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl">Login</Link>
                                        <Link to="/register" className="flex-1 px-4 py-3 text-center font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl">Register</Link>
                                    </div>
                                    <Link to="/register" className="bg-blue-600 text-white px-4 py-3 text-center font-bold rounded-xl shadow-md">Book Appointment</Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* DOM SECTION 1: HOME */}
            <div id="home">
                {/* Hero + Search */}
                <section className="relative pt-32 lg:pt-40 pb-16 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl">
                                <motion.h1 variants={fadeUp} className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.15] mb-6 tracking-tight">
                                    Find the Right Doctor.<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                        Book the Right Time.
                                    </span>
                                </motion.h1>
                                
                                <motion.p variants={fadeUp} className="text-xl text-slate-600 mb-10 leading-relaxed max-w-lg">
                                    Discover trusted doctors and convenient appointment sessions through our simple and secure online booking platform.
                                </motion.p>
                                
                                <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
                                    <a href="#doctors" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold text-lg text-center shadow-lg transition-all duration-300 hover:-translate-y-1">
                                        Find a Doctor
                                    </a>
                                    <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg text-center shadow-lg shadow-blue-600/25 transition-all duration-300 hover:-translate-y-1">
                                        Book an Appointment
                                    </Link>
                                </motion.div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                                className="hidden lg:block relative"
                            >
                                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl bg-white p-2">
                                    <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1000" alt="Medical Professional" className="rounded-[2rem] object-cover h-[500px] w-full"/>
                                </div>
                            </motion.div>
                        </div>

                        {/* Search Box */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                            className="mt-12 bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-4 md:p-6 border border-slate-100 max-w-5xl mx-auto"
                        >
                            <h3 className="font-bold text-slate-800 mb-4 ml-2">Find a Doctor</h3>
                            <form className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="relative col-span-1 md:col-span-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input type="text" placeholder="Doctor Name / Specialty" className="w-full bg-slate-50 rounded-xl pl-11 pr-4 py-3.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-200" />
                                </div>
                                <div className="relative col-span-1 md:col-span-1">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input type="text" placeholder="Hospital / Location" className="w-full bg-slate-50 rounded-xl pl-11 pr-4 py-3.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-200" />
                                </div>
                                <div className="relative col-span-1 md:col-span-1">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input type="date" className="w-full bg-slate-50 rounded-xl pl-11 pr-4 py-3.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-200" />
                                </div>
                                <button type="button" className="col-span-1 md:col-span-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-3.5 font-bold transition-colors shadow-md flex items-center justify-center gap-2">
                                    <Search size={18} /> Search Doctors
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </section>

                {/* Key Statistics */}
                <section className="py-8 relative z-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-xl shadow-blue-900/10 border border-white p-8 md:p-10">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
                                {[
                                    { count: 500, suffix: "+", label: "Doctors", color: "text-blue-600" },
                                    { count: 100, suffix: "+", label: "Specialists", color: "text-indigo-600" },
                                    { count: 20, suffix: "+", label: "Hospitals", color: "text-purple-600" },
                                    { count: 10, suffix: "K+", label: "Appointments", color: "text-emerald-600" },
                                ].map((stat, idx) => (
                                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="text-center px-2">
                                        <h3 className={`text-4xl md:text-5xl font-black mb-1 ${stat.color}`}>
                                            {scrolled ? <CountUp end={stat.count} suffix={stat.suffix} /> : '0'}
                                        </h3>
                                        <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">{stat.label}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* DOM SECTION 2: ABOUT */}
            <section id="about" className="py-20 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
                            <div className="bg-white p-3 rounded-[2rem] shadow-2xl border border-slate-100">
                                <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000" alt="Hospital Building" className="rounded-3xl w-full h-[450px] object-cover" />
                            </div>
                            <div className="absolute -bottom-8 -right-8 bg-blue-600 text-white p-8 rounded-3xl shadow-xl hidden md:block">
                                <p className="text-4xl font-black mb-1">25+</p>
                                <p className="text-blue-100 font-bold">Years of Trust</p>
                            </div>
                        </motion.div>
                        
                        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                            <span className="text-blue-600 font-bold uppercase tracking-wider text-sm mb-2 block">About SmartHospital</span>
                            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Committed to Excellence in Healthcare</h2>
                            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                                We are a leading healthcare platform dedicated to connecting patients with world-class medical professionals. Our mission is to make healthcare accessible, efficient, and reliable for everyone.
                            </p>
                            <div className="space-y-4">
                                {['Advanced Medical Technology', 'Highly Experienced Specialists', 'Patient-Centric Approach', '24/7 Support'].map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                        <p className="font-bold text-slate-700">{feature}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* DOM SECTION 3: DOCTORS */}
            <section id="doctors" className="py-20 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span className="text-blue-600 font-bold uppercase tracking-wider text-sm mb-2 block">Our Experts</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Featured Doctors</h2>
                        <p className="text-slate-600 text-lg max-w-2xl mx-auto">Book appointments with top-rated medical professionals in your area.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {(doctorsList.length > 0 ? doctorsList.slice(0, 8) : featuredDoctors).map((doc, idx) => (
                            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="bg-gradient-to-b from-white/80 to-blue-50/50 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg shadow-blue-900/5 border border-white/80 hover:shadow-xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 group">
                                <div className="h-56 bg-slate-200 relative overflow-hidden">
                                    <img src={doc.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.img || doc.first_name}&backgroundColor=e2e8f0`} alt={doc.name || `${doc.first_name} ${doc.last_name}`} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-extrabold text-slate-900 mb-1">{doc.name || `Dr. ${doc.first_name} ${doc.last_name}`}</h3>
                                    <p className="text-blue-600 font-bold text-sm mb-4">{doc.spec || doc.specialization}</p>
                                    
                                    <div className="flex items-center gap-1 text-amber-500 mb-2">
                                        {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                                        <span className="text-slate-700 font-bold ml-1 text-sm">{doc.rating || '5.0'}</span>
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium mb-6">{doc.exp || `${doc.experience_years}+ Years`} Experience</p>
                                    
                                    <div className="flex gap-2">
                                        <Link to="/register" className="flex-1 py-2.5 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm">
                                            View Profile
                                        </Link>
                                        <Link to="/register" className="flex-1 py-2.5 text-center bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-sm">
                                            Book Now
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DOM SECTION 4: SPECIALTIES */}
            <section id="specialties" className="py-20 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span className="text-blue-600 font-bold uppercase tracking-wider text-sm mb-2 block">Departments</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Popular Specialties</h2>
                        <p className="text-slate-600 text-lg max-w-2xl mx-auto">Find experienced specialists across a wide range of medical fields.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {specialties.map((spec, idx) => (
                            <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer text-center group">
                                <div className={`w-16 h-16 mx-auto ${spec.bg} rounded-2xl flex items-center justify-center ${spec.text} mb-4 ${spec.hoverBg} group-hover:text-white transition-colors`}>
                                    {React.cloneElement(spec.icon, { size: 32, strokeWidth: 1.5 })}
                                </div>
                                <h3 className="font-bold text-slate-900">{spec.name}</h3>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DOM SECTION 5: HOW IT WORKS */}
            <section id="how-it-works" className="py-20 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-blue-600 font-bold uppercase tracking-wider text-sm mb-2 block">Process</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">How It Works</h2>
                        <p className="text-slate-600 text-lg max-w-2xl mx-auto">Three simple steps to secure your medical appointment.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        <div className="hidden md:block absolute top-24 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-100 via-indigo-200 to-blue-100 z-0 opacity-60"></div>

                        {[
                            { title: "Find a Doctor", desc: "Search by doctor, specialty, or hospital.", icon: <Search />, num: "01", cardBg: "from-blue-50/90 to-blue-100/50 border-blue-200/60 shadow-blue-900/10", hoverBorder: "hover:border-blue-400" },
                            { title: "Choose a Session", desc: "View available dates and times.", icon: <Calendar />, num: "02", cardBg: "from-indigo-50/90 to-indigo-100/50 border-indigo-200/60 shadow-indigo-900/10", hoverBorder: "hover:border-indigo-400" },
                            { title: "Book Appointment", desc: "Confirm your preferred appointment.", icon: <CheckCircle2 />, num: "03", cardBg: "from-purple-50/90 to-purple-100/50 border-purple-200/60 shadow-purple-900/10", hoverBorder: "hover:border-purple-400" }
                        ].map((step, idx) => (
                            <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.2 }} className="relative z-10 group">
                                <div className={`bg-gradient-to-br ${step.cardBg} backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border ${step.hoverBorder} transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl h-full relative overflow-hidden text-center`}>
                                    <div className="absolute -right-4 -top-8 text-[8rem] font-black text-slate-900 opacity-5 group-hover:opacity-10 group-hover:-translate-y-4 transition-all duration-500 pointer-events-none select-none">
                                        {step.num}
                                    </div>
                                    <div className="w-20 h-20 mx-auto bg-white rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all duration-500 transform group-hover:rotate-12 group-hover:scale-110 shadow-lg shadow-blue-900/5 relative z-10">
                                        {React.cloneElement(step.icon, { size: 36, strokeWidth: 1.5 })}
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-4 relative z-10">{step.title}</h3>
                                    <p className="text-slate-600 relative z-10 font-medium leading-relaxed">{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Extra Section: Hospitals */}
            <section className="py-20 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span className="text-blue-600 font-bold uppercase tracking-wider text-sm mb-2 block">Our Partners</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Hospitals & Medical Centers</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {hospitals.map((hospital, idx) => (
                            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="bg-gradient-to-b from-white/80 to-indigo-50/50 backdrop-blur-md rounded-2xl border border-white/80 overflow-hidden shadow-lg shadow-indigo-900/5 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 hover:-translate-y-1 group">
                                <div className="h-40 bg-blue-100 flex items-center justify-center text-blue-300">
                                    <Building size={64} strokeWidth={1} />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{hospital.name}</h3>
                                    <div className="flex items-center gap-2 text-slate-500 mb-4 text-sm font-medium">
                                        <MapPin size={16} /> {hospital.location}
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold text-slate-700 mb-6 bg-slate-50 p-3 rounded-lg">
                                        <div className="flex flex-col"><span className="text-blue-600">{hospital.specs}</span></div>
                                        <div className="w-px h-8 bg-slate-200"></div>
                                        <div className="flex flex-col"><span className="text-blue-600">{hospital.docs}</span></div>
                                    </div>
                                    <button className="w-full py-3 text-center border border-slate-200 hover:border-blue-600 hover:text-blue-600 text-slate-700 font-bold rounded-xl transition-colors">
                                        View Hospital
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Extra Section: FAQ */}
            <section className="py-20 relative">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Frequently Asked Questions</h2>
                    </div>
                    <div>
                        {faqs.map((faq, idx) => (
                            <FAQItem key={idx} question={faq.q} answer={faq.a} />
                        ))}
                    </div>
                </div>
            </section>

            {/* DOM SECTION 6: CONTACT */}
            <section id="contact" className="py-20 relative bg-white rounded-[3rem] mx-4 sm:mx-6 lg:mx-8 mb-20 shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-blue-600 font-bold uppercase tracking-wider text-sm mb-2 block">Get In Touch</span>
                            <h2 className="text-4xl font-extrabold text-slate-900 mb-8 tracking-tight">Contact Information</h2>
                            
                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 mb-1">Hospital Address</h4>
                                        <p className="text-slate-600">123 Medical Center Drive, Healthcare City, HC 10020</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 mb-1">Contact Number</h4>
                                        <p className="text-slate-600">+1 (800) 123-4567</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 mb-1">Email Address</h4>
                                        <p className="text-slate-600">support@smarthospital.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="h-[400px] bg-slate-50 rounded-3xl overflow-hidden border border-slate-200 flex items-center justify-center relative">
                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                            <div className="relative z-10 text-center">
                                <MapPin size={48} className="text-blue-400 mx-auto mb-4" />
                                <h3 className="font-bold text-slate-500 text-lg">Interactive Map View</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* DOM SECTION 7: ULTRA PROFESSIONAL FOOTER */}
            <footer className="bg-slate-950 pt-20 pb-10 text-slate-400 border-t border-slate-900 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
                        
                        {/* Brand Column */}
                        <div className="lg:col-span-4">
                            <Link to="/" className="flex items-center gap-3 mb-6 group">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                                    <Stethoscope className="text-white" size={20} />
                                </div>
                                <span className="text-2xl font-black text-white tracking-tight">SmartHospital</span>
                            </Link>
                            <p className="text-slate-500 mb-8 leading-relaxed max-w-sm">
                                Elevating healthcare accessibility through innovative booking systems and a network of trusted medical professionals.
                            </p>
                            <div className="flex gap-4">
                                {['Facebook', 'Twitter', 'LinkedIn', 'Instagram'].map((social, i) => (
                                    <a key={i} href="#" className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-inner border border-slate-800 hover:border-blue-500">
                                        <span className="sr-only">{social}</span>
                                        <Star size={16} /> 
                                    </a>
                                ))}
                            </div>
                        </div>
                        
                        {/* Quick Links */}
                        <div className="lg:col-span-2 lg:col-start-6">
                            <h4 className="font-extrabold text-white mb-6 uppercase tracking-wider text-sm">Platform</h4>
                            <ul className="space-y-3 font-medium">
                                {['Home', 'About Us', 'Doctors', 'Specialties', 'How It Works'].map(link => (
                                    <li key={link}><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2"><ChevronRight size={14} className="text-slate-600" />{link}</a></li>
                                ))}
                            </ul>
                        </div>
                        
                        {/* Legal */}
                        <div className="lg:col-span-2">
                            <h4 className="font-extrabold text-white mb-6 uppercase tracking-wider text-sm">Legal & Support</h4>
                            <ul className="space-y-3 font-medium">
                                <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2"><ChevronRight size={14} className="text-slate-600" />Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2"><ChevronRight size={14} className="text-slate-600" />Terms of Service</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2"><ChevronRight size={14} className="text-slate-600" />Cookie Policy</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2"><ChevronRight size={14} className="text-slate-600" />Help Center</a></li>
                            </ul>
                        </div>
                        
                        {/* Newsletter */}
                        <div className="lg:col-span-3">
                            <h4 className="font-extrabold text-white mb-6 uppercase tracking-wider text-sm">Stay Updated</h4>
                            <p className="text-sm text-slate-500 mb-4">Subscribe to our newsletter for health tips and platform updates.</p>
                            <form className="flex flex-col gap-3">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input type="email" placeholder="Email address" className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" />
                                </div>
                                <button type="button" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 transition-colors shadow-lg shadow-blue-900/20">
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>
                    
                    <div className="border-t border-slate-800/80 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium">
                        <p>&copy; {new Date().getFullYear()} SmartHospital Booking System. All rights reserved.</p>
                        <div className="flex items-center gap-2 text-slate-500">
                            <span>Designed for Healthcare Excellence</span>
                            <Heart size={14} className="text-blue-500 fill-blue-500" />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
        </div>
    );
};

export default Landing;

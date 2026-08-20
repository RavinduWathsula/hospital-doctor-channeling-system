import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Stethoscope, Calendar, Heart, Shield, Users, Activity, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';

const Landing = () => {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-200">
            {/* Navbar */}
            <nav className="bg-white/80 backdrop-blur-md fixed w-full z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                                <Stethoscope className="text-white" size={24} />
                            </div>
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">
                                Smart Hospital
                            </span>
                        </div>
                        <div className="hidden md:flex space-x-8">
                            <a href="#services" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Services</a>
                            <a href="#specialists" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Specialists</a>
                            <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">How it Works</a>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="text-gray-700 hover:text-blue-600 font-bold transition-colors">Sign In</Link>
                            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-blue-600/20 transition-all hover:-translate-y-0.5">
                                Register
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-90"></div>
                    <div className="absolute top-0 right-0 -mr-48 -mt-48 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-48 -mb-48 w-96 h-96 rounded-full bg-indigo-400/20 blur-3xl"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div initial="initial" animate="animate" variants={fadeIn}>
                            <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 font-bold text-sm mb-6 border border-blue-200">
                                Modern Healthcare Platform
                            </span>
                            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                                Find & Book Your <br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                    Specialist Doctor
                                </span>
                            </h1>
                            <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
                                Experience hassle-free medical appointments. Search for top-rated specialists, view real-time schedules, and manage your health journey efficiently.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg text-center shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-1 flex items-center justify-center">
                                    Book Appointment <ChevronRight className="ml-2" size={20}/>
                                </Link>
                                <a href="#how-it-works" className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-8 py-4 rounded-xl font-bold text-lg text-center shadow-sm transition-all flex items-center justify-center">
                                    Learn More
                                </a>
                            </div>
                            
                            <div className="mt-12 flex items-center gap-6">
                                <div className="flex -space-x-4">
                                    {[1,2,3,4].map(i => (
                                        <div key={i} className="w-12 h-12 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-gray-400 font-bold overflow-hidden shadow-sm">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=doc${i}`} alt="doc" className="w-full h-full object-cover"/>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <div className="flex text-yellow-400">
                                        {[1,2,3,4,5].map(i => <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                                    </div>
                                    <p className="text-sm font-bold text-gray-600 mt-1">Trusted by 10,000+ patients</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="hidden lg:block relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[3rem] transform rotate-3 scale-105 opacity-10"></div>
                            <img src="https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&q=80&w=800" alt="Hospital Team" className="rounded-[3rem] shadow-2xl relative z-10 border-8 border-white"/>
                            
                            {/* Floating Card */}
                            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl z-20 animate-bounce" style={{animationDuration: '3s'}}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm font-bold">Live Queue Status</p>
                                        <p className="text-gray-900 font-extrabold text-lg">Real-time tracking</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-white border-b border-gray-100 relative z-20 -mt-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { icon: <Users/>, count: "10k+", label: "Happy Patients" },
                            { icon: <Stethoscope/>, count: "50+", label: "Specialist Doctors" },
                            { icon: <Activity/>, count: "20+", label: "Departments" },
                            { icon: <Calendar/>, count: "24/7", label: "Easy Booking" },
                        ].map((stat, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="text-center"
                            >
                                <div className="w-16 h-16 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 shadow-sm border border-blue-100">
                                    {React.cloneElement(stat.icon, { size: 32 })}
                                </div>
                                <h3 className="text-3xl font-extrabold text-gray-900">{stat.count}</h3>
                                <p className="text-gray-500 font-medium mt-1">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-blue-600 font-bold uppercase tracking-wider text-sm">Process</span>
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mt-2">How Channeling Works</h2>
                        <p className="text-xl text-gray-500 mt-4">Three simple steps to connect with the best medical professionals.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-blue-200 via-indigo-200 to-blue-200 transform -translate-y-1/2 z-0"></div>

                        {[
                            { title: "Search Doctor", desc: "Find a specialist by department or name.", icon: <Stethoscope size={32}/> },
                            { title: "Book Appointment", desc: "Select a convenient time slot and confirm.", icon: <Calendar size={32}/> },
                            { title: "Live Consultation", desc: "Track your queue number and consult.", icon: <Activity size={32}/> }
                        ].map((step, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="relative z-10 bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center hover:-translate-y-2 transition-transform duration-300"
                            >
                                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/30 transform -rotate-3">
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                <p className="text-gray-500">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Specializations Preview */}
            <section id="specialists" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-12">
                        <div className="max-w-2xl">
                            <span className="text-blue-600 font-bold uppercase tracking-wider text-sm">Departments</span>
                            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mt-2">Top Specializations</h2>
                        </div>
                        <Link to="/register" className="hidden md:flex items-center text-blue-600 font-bold hover:text-blue-700">
                            View All <ChevronRight size={20}/>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'Ophthalmology', 'Dental', 'General Medicine'].map((dept, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-gray-50 hover:bg-blue-50 p-6 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors cursor-pointer group text-center"
                            >
                                <div className="w-12 h-12 mx-auto bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                                    <Heart size={24} />
                                </div>
                                <h3 className="font-bold text-gray-900">{dept}</h3>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 relative overflow-hidden bg-slate-900">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl"></div>
                </div>
                <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Ready to prioritize your health?</h2>
                    <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">Join thousands of patients who trust our platform for seamless medical appointments and live queue tracking.</p>
                    <Link to="/register" className="bg-white text-slate-900 hover:bg-gray-50 px-10 py-4 rounded-xl font-extrabold text-lg shadow-xl shadow-white/10 transition-transform hover:-translate-y-1 inline-block">
                        Create Free Account
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white pt-16 pb-8 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Stethoscope className="text-white" size={20} />
                                </div>
                                <span className="text-xl font-bold text-gray-900">Smart Hospital</span>
                            </div>
                            <p className="text-gray-500 max-w-sm">The most advanced doctor channeling and queue management system for modern healthcare facilities.</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-gray-500">
                                <li><a href="#" className="hover:text-blue-600 transition-colors">Find a Doctor</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition-colors">Our Services</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition-colors">Patient Portal</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-4">Support</h4>
                            <ul className="space-y-2 text-gray-500">
                                <li><a href="#" className="hover:text-blue-600 transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition-colors">Contact Us</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                        <p>&copy; {new Date().getFullYear()} Smart Hospital. All rights reserved.</p>
                        <div className="flex items-center gap-2 mt-4 md:mt-0">
                            <Shield size={16} /> <span>Secured by Advanced Encryption</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;

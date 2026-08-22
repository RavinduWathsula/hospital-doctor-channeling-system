import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Calendar, Clock, User, DollarSign, ArrowLeft, CheckCircle, CreditCard, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Booking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, user } = useContext(AuthContext);
    
    const [doctor, setDoctor] = useState(null);
    const [date, setDate] = useState('');
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [notes, setNotes] = useState('');
    
    // Simulated Payment State
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [nameOnCard, setNameOnCard] = useState('');
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSlotsLoading, setIsSlotsLoading] = useState(false);
    const [isBooking, setIsBooking] = useState(false);

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
                    toast.error('Doctor not found');
                    navigate('/patient/doctors');
                }
            } catch {
                toast.error('Failed to load doctor profile');
                navigate('/patient/doctors');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDoctor();
    }, [id, token, navigate]);

    useEffect(() => {
        if (!date) return;
        
        const fetchSlots = async () => {
            setIsSlotsLoading(true);
            setSlots([]);
            setSelectedSlot('');
            try {
                const res = await fetch(`http://localhost:5000/api/doctors/${id}/slots?date=${date}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setSlots(data.data);
                } else {
                    toast.error(data.message || 'Error fetching slots');
                }
            } catch {
                toast.error('Error fetching availability');
            } finally {
                setIsSlotsLoading(false);
            }
        };
        
        fetchSlots();
    }, [date, id, token]);

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    const formatExpiry = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
        }
        return v;
    };

    const handleBook = async () => {
        if (!date || !selectedSlot) {
            toast.error('Please select a date and time slot.');
            return;
        }
        
        if (!cardNumber || !expiryDate || !cvv || !nameOnCard) {
            toast.error('Please complete all payment details to confirm booking.');
            return;
        }

        setIsBooking(true);
        
        // Simulate a realistic payment gateway processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            const res = await fetch('http://localhost:5000/api/appointments', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    doctor_id: id,
                    appointment_date: date,
                    appointment_time: selectedSlot,
                    notes: notes
                })
            });
            const data = await res.json();
            
            if (data.success) {
                toast.success('Payment successful! Appointment booked.');
                navigate(`/confirmation/${data.data.id}`);
            } else {
                toast.error(data.message || 'Failed to book appointment');
            }
        } catch {
            toast.error('Server error during booking');
        } finally {
            setIsBooking(false);
        }
    };

    const getToday = () => {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        return `${yyyy}-${mm}-${dd}`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-slate-50">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!doctor) return null;

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-24">
            {/* Premium Header Banner */}
            <div className="relative h-64 bg-slate-900 overflow-hidden shadow-xl shadow-indigo-900/10 mb-12">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[120%] bg-indigo-600/40 blur-[100px] rounded-full mix-blend-screen"></div>
                    <div className="absolute bottom-[-30%] right-[-10%] w-[60%] h-[120%] bg-blue-500/40 blur-[100px] rounded-full mix-blend-screen"></div>
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 h-full flex flex-col">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="inline-flex items-center text-white/70 hover:text-white bg-white/5 hover:bg-white/10 backdrop-blur-md px-4 py-2 rounded-full transition-all border border-white/10 text-sm font-semibold self-start"
                    >
                        <ArrowLeft size={16} className="mr-2" /> Back
                    </button>

                    <div className="mt-auto pb-8 flex items-end">
                        <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-xl mr-6 transform -rotate-3 hover:rotate-0 transition-transform">
                            <div className="w-full h-full rounded-xl overflow-hidden bg-indigo-50 flex items-center justify-center">
                                {doctor.profile_image ? (
                                    <img src={doctor.profile_image} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-black text-indigo-400">{doctor.first_name.charAt(0)}</span>
                                )}
                            </div>
                        </div>
                        <div className="pb-2">
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-1">
                                Secure Checkout
                            </h1>
                            <p className="text-indigo-200 font-medium flex items-center">
                                <Sparkles size={16} className="mr-2 opacity-70" /> 
                                Booking Dr. {doctor.first_name} {doctor.last_name}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Form Sections */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Date & Time Selection */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100">
                            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mr-4">
                                    <Calendar className="text-indigo-600" size={20} />
                                </div>
                                Select Date & Time
                            </h2>
                            
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-slate-700 mb-3">Choose Appointment Date</label>
                                <input 
                                    type="date" 
                                    min={getToday()}
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full md:w-1/2 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 font-bold outline-none"
                                />
                            </div>

                            <AnimatePresence mode="wait">
                                {date && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <label className="block text-sm font-bold text-slate-700 mb-4">
                                            Available Slots for {new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                        </label>
                                        
                                        {isSlotsLoading ? (
                                            <div className="flex items-center space-x-3 text-indigo-600 py-4">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                                                <span className="font-bold">Fetching live availability...</span>
                                            </div>
                                        ) : slots.length > 0 ? (
                                            <motion.div 
                                                variants={containerVariants}
                                                initial="hidden"
                                                animate="show"
                                                className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3"
                                            >
                                                {slots.map((slot, index) => (
                                                    <motion.button
                                                        variants={itemVariants}
                                                        key={index}
                                                        onClick={() => setSelectedSlot(slot)}
                                                        className={`py-3 px-2 rounded-xl text-sm font-black transition-all border ${
                                                            selectedSlot === slot 
                                                            ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-transparent shadow-lg shadow-indigo-500/30 scale-105' 
                                                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
                                                        }`}
                                                    >
                                                        {slot}
                                                    </motion.button>
                                                ))}
                                            </motion.div>
                                        ) : (
                                            <div className="p-5 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-medium">
                                                No available slots found for this date. The doctor may be fully booked or off-duty.
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Additional Notes */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100">
                            <h2 className="text-xl font-black text-slate-900 mb-4">Additional Notes (Optional)</h2>
                            <textarea 
                                rows="3"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Briefly describe your symptoms or reason for visit..."
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 outline-none resize-none"
                            ></textarea>
                        </motion.div>

                        {/* Payment Gateway (Simulated UI) */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                            {/* Decorative mesh inside payment card */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                <div className="absolute top-[-50%] right-[-20%] w-[100%] h-[150%] bg-blue-600/20 blur-[80px] rounded-full mix-blend-screen"></div>
                            </div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
                                    <h2 className="text-2xl font-black flex items-center text-white">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center mr-4 border border-white/20">
                                            <CreditCard className="text-indigo-300" size={20} />
                                        </div>
                                        Payment Details
                                    </h2>
                                    <div className="flex space-x-2">
                                        {/* Mock card icons */}
                                        <div className="w-12 h-8 bg-white/10 backdrop-blur-sm rounded border border-white/20 flex items-center justify-center font-black text-xs text-indigo-200 italic">VISA</div>
                                        <div className="w-12 h-8 bg-white/10 backdrop-blur-sm rounded border border-white/20 flex items-center justify-center font-black text-xs text-red-400">MC</div>
                                    </div>
                                </div>

                                <div className="space-y-6 max-w-lg">
                                    <div>
                                        <label className="block text-sm font-bold text-indigo-200 mb-2 uppercase tracking-wider">Card Number</label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                maxLength="19"
                                                value={cardNumber}
                                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                                placeholder="0000 0000 0000 0000"
                                                className="w-full px-5 py-4 bg-white/5 border border-white/20 rounded-2xl focus:ring-4 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all text-white font-mono text-lg outline-none placeholder-white/20 tracking-wider"
                                            />
                                            <Lock size={18} className="absolute right-5 top-1/2 transform -translate-y-1/2 text-white/30" />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-indigo-200 mb-2 uppercase tracking-wider">Expiry Date</label>
                                            <input 
                                                type="text" 
                                                maxLength="5"
                                                value={expiryDate}
                                                onChange={(e) => setExpiryDate(formatExpiry(e.target.value))}
                                                placeholder="MM/YY"
                                                className="w-full px-5 py-4 bg-white/5 border border-white/20 rounded-2xl focus:ring-4 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all text-white font-mono text-lg outline-none placeholder-white/20 text-center"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-indigo-200 mb-2 uppercase tracking-wider">CVV</label>
                                            <input 
                                                type="password" 
                                                maxLength="4"
                                                value={cvv}
                                                onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                                                placeholder="•••"
                                                className="w-full px-5 py-4 bg-white/5 border border-white/20 rounded-2xl focus:ring-4 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all text-white font-mono text-lg outline-none placeholder-white/20 text-center tracking-widest"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-indigo-200 mb-2 uppercase tracking-wider">Name on Card</label>
                                        <input 
                                            type="text" 
                                            value={nameOnCard}
                                            onChange={(e) => setNameOnCard(e.target.value.toUpperCase())}
                                            placeholder="JOHN DOE"
                                            className="w-full px-5 py-4 bg-white/5 border border-white/20 rounded-2xl focus:ring-4 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all text-white font-bold text-lg outline-none placeholder-white/20 uppercase"
                                        />
                                    </div>
                                    
                                    <div className="flex items-center text-xs font-medium text-indigo-300 mt-4">
                                        <ShieldCheck size={16} className="mr-2 text-emerald-400" />
                                        Your payment information is secured using AES-256 bit encryption.
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Summary & CTA */}
                    <div className="lg:col-span-1">
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 rounded-[2rem] shadow-2xl shadow-indigo-900/5 border border-indigo-50 sticky top-8">
                            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center">
                                Booking Summary
                            </h3>
                            
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 flex items-center">
                                <div className="w-14 h-14 rounded-full bg-indigo-100 overflow-hidden mr-4 shadow-sm shrink-0 border-2 border-white">
                                    {doctor.profile_image ? (
                                        <img src={doctor.profile_image} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-indigo-500 font-bold text-xl">
                                            {doctor.first_name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="font-black text-slate-900 truncate">Dr. {doctor.first_name} {doctor.last_name}</div>
                                    <div className="text-sm font-semibold text-indigo-500 truncate">{doctor.department_name} Dept</div>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="flex items-center text-slate-500 font-semibold"><Calendar size={16} className="mr-2 text-slate-400" /> Date</span>
                                    <span className="font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">{date ? new Date(date).toLocaleDateString() : 'Not selected'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="flex items-center text-slate-500 font-semibold"><Clock size={16} className="mr-2 text-slate-400" /> Time</span>
                                    <span className="font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">{selectedSlot || 'Not selected'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm pt-4 border-t border-slate-100">
                                    <span className="flex items-center text-slate-500 font-semibold"><User size={16} className="mr-2 text-slate-400" /> Patient</span>
                                    <span className="font-black text-slate-900">{user.firstName} {user.lastName}</span>
                                </div>
                            </div>

                            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 mb-6 relative overflow-hidden">
                                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                                    <DollarSign size={80} />
                                </div>
                                <div className="text-indigo-500 text-sm font-black uppercase tracking-wider mb-1 flex items-center">
                                    Total Amount
                                </div>
                                <div className="flex items-baseline">
                                    <span className="text-xl font-bold text-indigo-400 mr-2">LKR</span>
                                    <span className="text-4xl font-black text-indigo-900">{parseFloat(doctor.consultation_fee).toLocaleString()}</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleBook}
                                disabled={!date || !selectedSlot || isBooking}
                                className={`w-full py-5 rounded-[1.5rem] font-black text-lg flex items-center justify-center transition-all ${
                                    !date || !selectedSlot 
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-inner' 
                                    : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-xl shadow-indigo-500/30 transform hover:-translate-y-1 active:translate-y-0'
                                }`}
                            >
                                {isBooking ? (
                                    <>
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                                        Processing Payment...
                                    </>
                                ) : (
                                    <>
                                        <Lock size={20} className="mr-2" /> Pay LKR {parseFloat(doctor.consultation_fee).toLocaleString()} & Book
                                    </>
                                )}
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Booking;

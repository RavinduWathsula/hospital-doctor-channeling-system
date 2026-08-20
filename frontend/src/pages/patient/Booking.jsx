import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Calendar, Clock, User, DollarSign, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Booking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, user } = useContext(AuthContext);
    
    const [doctor, setDoctor] = useState(null);
    const [date, setDate] = useState('');
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [notes, setNotes] = useState('');
    
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
                    navigate('/doctors');
                }
            } catch {
                toast.error('Failed to load doctor profile');
                navigate('/doctors');
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

    const handleBook = async () => {
        if (!date || !selectedSlot) {
            toast.error('Please select a date and time slot.');
            return;
        }

        setIsBooking(true);
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
                toast.success('Appointment booked successfully!');
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

    // Get today's date in YYYY-MM-DD format for min attribute
    const getToday = () => {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        return `${yyyy}-${mm}-${dd}`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!doctor) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors font-medium"
                >
                    <ArrowLeft size={20} className="mr-2" /> Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Selection */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                <Calendar className="mr-3 text-blue-600" size={24} /> Select Date & Time
                            </h2>
                            
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Date</label>
                                <input 
                                    type="date" 
                                    min={getToday()}
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full md:w-1/2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-gray-700 font-medium"
                                />
                            </div>

                            {date && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-4">Available Slots for {new Date(date).toLocaleDateString()}</label>
                                    
                                    {isSlotsLoading ? (
                                        <div className="flex items-center space-x-3 text-blue-600">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                            <span>Loading slots...</span>
                                        </div>
                                    ) : slots.length > 0 ? (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                            {slots.map((slot, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setSelectedSlot(slot)}
                                                    className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all border ${
                                                        selectedSlot === slot 
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30' 
                                                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                                                    }`}
                                                >
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-orange-50 text-orange-700 rounded-xl border border-orange-100">
                                            No available slots found for this date. The doctor may not be scheduled or is fully booked.
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-8">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
                                <textarea 
                                    rows="3"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Briefly describe your symptoms or reason for visit..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-gray-700"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b">Booking Summary</h3>
                            
                            <div className="flex items-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-blue-50 overflow-hidden mr-4">
                                    {doctor.profile_image ? (
                                        <img src={doctor.profile_image} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-blue-500 font-bold text-xl">
                                            {doctor.first_name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">Dr. {doctor.first_name} {doctor.last_name}</div>
                                    <div className="text-sm text-gray-500">{doctor.department_name} Dept</div>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="flex items-center text-gray-500"><Calendar size={16} className="mr-2" /> Date</span>
                                    <span className="font-medium text-gray-900">{date ? new Date(date).toLocaleDateString() : 'Not selected'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="flex items-center text-gray-500"><Clock size={16} className="mr-2" /> Time</span>
                                    <span className="font-medium text-gray-900">{selectedSlot || 'Not selected'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="flex items-center text-gray-500"><User size={16} className="mr-2" /> Patient</span>
                                    <span className="font-medium text-gray-900">{user.firstName} {user.lastName}</span>
                                </div>
                                <div className="pt-4 mt-4 border-t border-dashed flex justify-between items-center">
                                    <span className="flex items-center text-gray-700 font-semibold"><DollarSign size={18} className="mr-1 text-green-600" /> Total Fee</span>
                                    <span className="text-xl font-bold text-blue-600">${doctor.consultation_fee}</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleBook}
                                disabled={!date || !selectedSlot || isBooking}
                                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all ${
                                    !date || !selectedSlot 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5'
                                }`}
                            >
                                {isBooking ? (
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                ) : (
                                    <>
                                        <CheckCircle size={20} className="mr-2" /> Confirm Booking
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Booking;

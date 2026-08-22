import React, { useState, useEffect, useContext } from 'react';
import { Pill, Plus, Search, Calendar, User, FileText, Trash2, X, Check } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Prescriptions() {
    const { token } = useContext(AuthContext);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form state
    const [patients, setPatients] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState([
        { medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ]);

    useEffect(() => {
        fetchPrescriptions();
        fetchPatients();
    }, []);

    const fetchPrescriptions = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/prescriptions/doctor', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setPrescriptions(data.data);
            }
        } catch (error) {
            toast.error('Failed to load prescriptions');
        } finally {
            setLoading(false);
        }
    };

    const fetchPatients = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/patients', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setPatients(data.data);
            }
        } catch (error) {
            console.error('Failed to load patients', error);
        }
    };

    const addItem = () => {
        setItems([...items, { medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPatientId) {
            return toast.error('Please select a patient');
        }

        // Validate items
        const validItems = items.filter(item => item.medicine_name.trim() !== '');
        if (validItems.length === 0) {
            return toast.error('Please add at least one medicine');
        }

        try {
            const res = await fetch('http://localhost:5000/api/prescriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    patient_id: selectedPatientId,
                    notes: notes,
                    items: validItems
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Prescription created successfully');
                setIsModalOpen(false);
                // Reset form
                setSelectedPatientId('');
                setNotes('');
                setItems([{ medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
                fetchPrescriptions();
            } else {
                toast.error(data.message || 'Failed to create prescription');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                            <Pill size={28} />
                        </div>
                        E-Prescriptions
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg font-medium">Manage and issue digital prescriptions to your patients.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="group bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                    New Prescription
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {prescriptions.map((prescription) => (
                        <div key={prescription.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all group">
                            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                        <User size={16} className="text-emerald-600" />
                                        {prescription.patient_first_name} {prescription.patient_last_name}
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                                        <Calendar size={14} />
                                        {new Date(prescription.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                    <FileText size={18} />
                                </div>
                            </div>
                            <div className="p-5">
                                {prescription.notes && (
                                    <div className="mb-4">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Doctor's Notes</p>
                                        <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">{prescription.notes}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Prescribed Medicines ({prescription.items?.length || 0})</p>
                                    <ul className="space-y-3">
                                        {prescription.items?.map((item) => (
                                            <li key={item.id} className="flex items-start gap-3 p-3 rounded-xl border border-emerald-100 bg-emerald-50/30">
                                                <div className="mt-0.5 p-1.5 bg-emerald-100 text-emerald-600 rounded-md">
                                                    <Pill size={14} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-emerald-900 text-sm">{item.medicine_name}</p>
                                                    <p className="text-xs text-emerald-700/80 font-medium mt-0.5">
                                                        {item.dosage} • {item.frequency} • {item.duration}
                                                    </p>
                                                    {item.instructions && (
                                                        <p className="text-xs text-slate-500 mt-1 italic">"{item.instructions}"</p>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}

                    {prescriptions.length === 0 && (
                        <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm border-dashed">
                            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <FileText size={24} className="text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1">No prescriptions found</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">You haven't issued any digital prescriptions yet.</p>
                        </div>
                    )}
                </div>
            )}

            {/* New Prescription Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                <Pill className="text-emerald-600" size={24} />
                                Issue New Prescription
                            </h2>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                            <form id="prescription-form" onSubmit={handleSubmit} className="space-y-6">
                                {/* Patient Selection */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Select Patient <span className="text-rose-500">*</span></label>
                                    <select 
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                                        value={selectedPatientId}
                                        onChange={(e) => setSelectedPatientId(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Choose a patient --</option>
                                        {patients.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.first_name} {p.last_name} ({p.nic || 'No NIC'})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* General Notes */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Clinical Notes / Diagnosis</label>
                                    <textarea 
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium resize-none h-24 custom-scrollbar"
                                        placeholder="E.g., Patient diagnosed with acute bronchitis. Recommended bed rest."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    ></textarea>
                                </div>

                                {/* Medicines */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="block text-sm font-bold text-slate-700">Prescribed Medicines <span className="text-rose-500">*</span></label>
                                        <button 
                                            type="button"
                                            onClick={addItem}
                                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            <Plus size={14} /> Add Drug
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {items.map((item, index) => (
                                            <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative group">
                                                {items.length > 1 && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-full flex items-center justify-center shadow-sm transition-all"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                )}
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Medicine Name</label>
                                                        <input 
                                                            type="text"
                                                            required
                                                            className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                                                            placeholder="E.g., Amoxicillin 500mg"
                                                            value={item.medicine_name}
                                                            onChange={(e) => handleItemChange(index, 'medicine_name', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Dosage</label>
                                                        <input 
                                                            type="text"
                                                            required
                                                            className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                                                            placeholder="E.g., 1 Tablet"
                                                            value={item.dosage}
                                                            onChange={(e) => handleItemChange(index, 'dosage', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Frequency</label>
                                                        <input 
                                                            type="text"
                                                            required
                                                            className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                                                            placeholder="E.g., Twice a day (After meals)"
                                                            value={item.frequency}
                                                            onChange={(e) => handleItemChange(index, 'frequency', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Duration</label>
                                                        <input 
                                                            type="text"
                                                            required
                                                            className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                                                            placeholder="E.g., 5 Days"
                                                            value={item.duration}
                                                            onChange={(e) => handleItemChange(index, 'duration', e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Special Instructions (Optional)</label>
                                                    <input 
                                                        type="text"
                                                        className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                                        placeholder="E.g., Avoid dairy products while taking this medication."
                                                        value={item.instructions}
                                                        onChange={(e) => handleItemChange(index, 'instructions', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button 
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                form="prescription-form"
                                className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                            >
                                <Check size={18} />
                                Issue Prescription
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Search, UserPlus, Edit, Phone, Mail, MapPin, Calendar, CreditCard, Shield, ChevronRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const ReceptionPatients = () => {
    const { token } = useContext(AuthContext);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modals state
    const [isRegOpen, setIsRegOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    
    // Forms
    const [regForm, setRegForm] = useState({ firstName: '', lastName: '', email: '', password: '', nic: '', phone: '' });
    const [editForm, setEditForm] = useState({ id: '', first_name: '', last_name: '', phone: '', date_of_birth: '', address: '' });

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:5000/api/patients', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setPatients(data.data);
            }
        } catch (error) {
            toast.error('Error fetching patients');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(regForm)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Patient registered successfully');
                setIsRegOpen(false);
                setRegForm({ firstName: '', lastName: '', email: '', password: '', nic: '', phone: '' });
                fetchPatients();
            } else {
                toast.error(data.message || 'Registration failed');
            }
        } catch {
            toast.error('Server error');
        }
    };

    const openEditModal = (patient) => {
        setEditForm({
            id: patient.id,
            first_name: patient.first_name,
            last_name: patient.last_name,
            phone: patient.phone || '',
            date_of_birth: patient.date_of_birth ? patient.date_of_birth.split('T')[0] : '',
            address: patient.address || ''
        });
        setIsEditOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:5000/api/patients/${editForm.id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Patient updated successfully');
                setIsEditOpen(false);
                fetchPatients();
            } else {
                toast.error(data.message || 'Update failed');
            }
        } catch {
            toast.error('Server error');
        }
    };

    const filtered = patients.filter(p => 
        (p.first_name + ' ' + p.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone?.includes(searchTerm) ||
        p.nic?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-12">
            
            {/* Header Section */}
            <div className="relative bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600 tracking-tight">Patient Directory</h1>
                    <p className="text-gray-500 font-medium mt-1 flex items-center">
                        <Shield size={16} className="mr-2 text-indigo-400" />
                        Manage hospital patients and registrations securely.
                    </p>
                </div>
                
                <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative group flex-grow md:flex-grow-0">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search by name, NIC, phone..." 
                            className="w-full sm:w-72 pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none shadow-sm transition-all text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={() => setIsRegOpen(true)} className="group flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5 font-bold">
                        <UserPlus size={18} className="mr-2" /> 
                        <span>Register New</span>
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/20 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider font-bold border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5">Patient Details</th>
                                <th className="px-8 py-5">Contact Info</th>
                                <th className="px-8 py-5">NIC Number</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                            <p className="text-gray-500 font-medium">Loading patient directory...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-12 text-center text-gray-500 font-medium">
                                        No patients found matching your search.
                                    </td>
                                </tr>
                            ) : filtered.map(p => (
                                <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 font-bold flex items-center justify-center mr-4 shadow-inner group-hover:scale-105 transition-transform">
                                                {p.first_name.charAt(0)}{p.last_name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-base">{p.first_name} {p.last_name}</div>
                                                <div className="text-xs text-gray-400 font-mono mt-0.5">ID: {p.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center text-gray-600 mb-1.5 font-medium">
                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-2"><Phone size={12} className="text-gray-500"/></div>
                                            {p.phone || <span className="text-gray-400 italic">Not provided</span>}
                                        </div>
                                        <div className="flex items-center text-gray-500 text-xs">
                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-2"><Mail size={12} className="text-gray-500"/></div>
                                            {p.email}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center font-mono text-gray-600">
                                            <CreditCard size={14} className="mr-2 text-indigo-400" />
                                            {p.nic}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button onClick={() => openEditModal(p)} className="inline-flex items-center justify-center w-10 h-10 bg-white border border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 rounded-xl transition-all shadow-sm">
                                            <Edit size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Registration Modal */}
            {isRegOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsRegOpen(false)}></div>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-300">
                        
                        <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black">Register New Patient</h2>
                                <p className="text-indigo-100 text-sm mt-1">Create a comprehensive profile for a new patient.</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                                <UserPlus size={24} className="text-white" />
                            </div>
                        </div>

                        <form onSubmit={handleRegister} className="p-8">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">First Name <span className="text-red-500">*</span></label>
                                        <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium" value={regForm.firstName} onChange={e => setRegForm({...regForm, firstName: e.target.value})} placeholder="John" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Last Name <span className="text-red-500">*</span></label>
                                        <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium" value={regForm.lastName} onChange={e => setRegForm({...regForm, lastName: e.target.value})} placeholder="Doe" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Email Address <span className="text-red-500">*</span></label>
                                        <input type="email" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} placeholder="patient@example.com" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Phone Number</label>
                                        <input type="tel" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} placeholder="07XXXXXXXX" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">NIC Number <span className="text-red-500">*</span></label>
                                        <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium" value={regForm.nic} onChange={e => setRegForm({...regForm, nic: e.target.value})} placeholder="2000XXXXXXX" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Account Password <span className="text-red-500">*</span></label>
                                        <input type="password" required minLength={6} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium" value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} placeholder="••••••••" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-end gap-4 mt-10 pt-6 border-t border-gray-100">
                                <button type="button" onClick={() => setIsRegOpen(false)} className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center">
                                    <Check size={18} className="mr-2" /> Complete Registration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditOpen(false)}></div>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-300">
                        
                        <div className="px-8 py-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black">Update Patient Profile</h2>
                                <p className="text-emerald-100 text-sm mt-1">Modify personal and contact information.</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                                <Edit size={22} className="text-white" />
                            </div>
                        </div>

                        <form onSubmit={handleUpdate} className="p-8">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">First Name <span className="text-red-500">*</span></label>
                                        <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition-all font-medium" value={editForm.first_name} onChange={e => setEditForm({...editForm, first_name: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Last Name <span className="text-red-500">*</span></label>
                                        <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition-all font-medium" value={editForm.last_name} onChange={e => setEditForm({...editForm, last_name: e.target.value})} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input type="tel" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition-all font-medium" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Date of Birth</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input type="date" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition-all font-medium text-gray-600" value={editForm.date_of_birth} onChange={e => setEditForm({...editForm, date_of_birth: e.target.value})} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Residential Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-4 text-gray-400" size={16} />
                                        <textarea rows="3" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition-all font-medium resize-none" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} placeholder="Enter full address..."></textarea>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-end gap-4 mt-10 pt-6 border-t border-gray-100">
                                <button type="button" onClick={() => setIsEditOpen(false)} className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-teal-500/30 transition-all flex items-center">
                                    <Check size={18} className="mr-2" /> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReceptionPatients;

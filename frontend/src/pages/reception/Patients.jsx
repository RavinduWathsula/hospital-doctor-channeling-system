import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Search, UserPlus, Edit, Phone, Mail, MapPin } from 'lucide-react';
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
    const [regForm, setRegForm] = useState({ firstName: '', lastName: '', email: '', password: '', nic: '' });
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
                setRegForm({ firstName: '', lastName: '', email: '', password: '', nic: '' });
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
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Patient Directory</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage hospital patients and registrations.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by name, NIC, phone..." 
                            className="pl-10 pr-4 py-2 w-full md:w-64 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={() => setIsRegOpen(true)} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm font-medium">
                        <UserPlus size={18} className="mr-2" /> Register New
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 uppercase font-semibold border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">NIC</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="5" className="px-6 py-8 text-center">Loading...</td></tr>
                        ) : filtered.map(p => (
                            <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors">
                                <td className="px-6 py-4 font-mono text-gray-500">{p.id}</td>
                                <td className="px-6 py-4 font-bold text-gray-800">{p.first_name} {p.last_name}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center"><Phone size={12} className="mr-2 text-gray-400"/> {p.phone || '-'}</div>
                                    <div className="flex items-center mt-1"><Mail size={12} className="mr-2 text-gray-400"/> {p.email}</div>
                                </td>
                                <td className="px-6 py-4">{p.nic}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => openEditModal(p)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg">
                                        <Edit size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modals for Register and Edit would go here */}
            {isRegOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-indigo-50">
                            <h2 className="text-xl font-bold text-indigo-900">Register Patient</h2>
                        </div>
                        <form onSubmit={handleRegister} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-sm font-medium text-gray-700">First Name *</label><input type="text" required className="w-full p-2 border rounded-lg mt-1" value={regForm.firstName} onChange={e => setRegForm({...regForm, firstName: e.target.value})} /></div>
                                <div><label className="text-sm font-medium text-gray-700">Last Name *</label><input type="text" required className="w-full p-2 border rounded-lg mt-1" value={regForm.lastName} onChange={e => setRegForm({...regForm, lastName: e.target.value})} /></div>
                            </div>
                            <div><label className="text-sm font-medium text-gray-700">Email *</label><input type="email" required className="w-full p-2 border rounded-lg mt-1" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} /></div>
                            <div><label className="text-sm font-medium text-gray-700">Password *</label><input type="password" required className="w-full p-2 border rounded-lg mt-1" minLength={6} value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} /></div>
                            <div><label className="text-sm font-medium text-gray-700">NIC *</label><input type="text" required className="w-full p-2 border rounded-lg mt-1" value={regForm.nic} onChange={e => setRegForm({...regForm, nic: e.target.value})} /></div>
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                                <button type="button" onClick={() => setIsRegOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium">Register</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-blue-50">
                            <h2 className="text-xl font-bold text-blue-900">Update Patient Profile</h2>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-sm font-medium text-gray-700">First Name *</label><input type="text" required className="w-full p-2 border rounded-lg mt-1" value={editForm.first_name} onChange={e => setEditForm({...editForm, first_name: e.target.value})} /></div>
                                <div><label className="text-sm font-medium text-gray-700">Last Name *</label><input type="text" required className="w-full p-2 border rounded-lg mt-1" value={editForm.last_name} onChange={e => setEditForm({...editForm, last_name: e.target.value})} /></div>
                            </div>
                            <div><label className="text-sm font-medium text-gray-700">Phone</label><input type="tel" className="w-full p-2 border rounded-lg mt-1" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} /></div>
                            <div><label className="text-sm font-medium text-gray-700">Date of Birth</label><input type="date" className="w-full p-2 border rounded-lg mt-1" value={editForm.date_of_birth} onChange={e => setEditForm({...editForm, date_of_birth: e.target.value})} /></div>
                            <div><label className="text-sm font-medium text-gray-700">Address</label><textarea className="w-full p-2 border rounded-lg mt-1" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} /></div>
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReceptionPatients;

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

const Doctors = () => {
    const { token } = useContext(AuthContext);
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: '', phone: '', profileImage: '',
        registrationNumber: '', specialization: '', departmentId: '', qualification: '',
        experienceYears: '', consultationFee: '', biography: ''
    });

    useEffect(() => {
        fetchDoctors();
        fetchDepartments();
    }, []);

    const fetchDoctors = () => {
        fetch('http://localhost:5000/api/doctors', { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => { if(data.success) setDoctors(data.data); })
            .catch(() => toast.error('Error fetching doctors'));
    };

    const fetchDepartments = () => {
        fetch('http://localhost:5000/api/departments', { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => { if(data.success) setDepartments(data.data); })
            .catch(() => toast.error('Error fetching departments'));
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            const res = await fetch(`http://localhost:5000/api/doctors/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            const data = await res.json();
            if(data.success) {
                toast.success('Doctor status updated');
                fetchDoctors();
            } else toast.error(data.message);
        } catch { toast.error('Error updating status'); }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/doctors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if(data.success) {
                toast.success('Doctor created successfully');
                setIsModalOpen(false);
                fetchDoctors();
                // Reset form
                setFormData({
                    firstName: '', lastName: '', email: '', password: '', phone: '', profileImage: '',
                    registrationNumber: '', specialization: '', departmentId: '', qualification: '',
                    experienceYears: '', consultationFee: '', biography: ''
                });
            } else {
                toast.error(data.message || 'Error creating doctor');
            }
        } catch {
            toast.error('Server error');
        }
    };

    const filtered = doctors.filter(d => (d.first_name + ' ' + d.last_name + ' ' + d.specialization + ' ' + d.registration_number).toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Doctors Management</h2>
                <div className="flex space-x-4">
                    <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Plus size={18} className="mr-2" /> Add Doctor
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 uppercase border-b">
                        <tr>
                            <th className="px-4 py-3">Profile</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Reg. No</th>
                            <th className="px-4 py-3">Department</th>
                            <th className="px-4 py-3">Specialization</th>
                            <th className="px-4 py-3">Fee</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(d => (
                            <tr key={d.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                        {d.profile_image ? (
                                            <img src={d.profile_image} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">{d.first_name.charAt(0)}</div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900">Dr. {d.first_name} {d.last_name}</td>
                                <td className="px-4 py-3">{d.registration_number}</td>
                                <td className="px-4 py-3">{d.department_name}</td>
                                <td className="px-4 py-3">{d.specialization}</td>
                                <td className="px-4 py-3">${d.consultation_fee}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${d.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {d.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <button onClick={() => toggleStatus(d.id, d.is_active)} className={`px-3 py-1 rounded text-white text-xs font-bold ${d.is_active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                                        {d.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">Add New Doctor</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <form id="doctorForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Personal Info */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-700 border-b pb-2">Personal Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                            <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                                            <input type="text" name="lastName" required value={formData.lastName} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                        <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Initial Password *</label>
                                        <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
                                        <input type="url" name="profileImage" value={formData.profileImage} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="https://example.com/image.jpg" />
                                    </div>
                                </div>

                                {/* Professional Info */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-700 border-b pb-2">Professional Details</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number *</label>
                                        <input type="text" name="registrationNumber" required value={formData.registrationNumber} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                                        <select name="departmentId" required value={formData.departmentId} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                                            <option value="">Select Department</option>
                                            {departments.map(dep => (
                                                <option key={dep.id} value={dep.id}>{dep.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Specialization *</label>
                                        <input type="text" name="specialization" required value={formData.specialization} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Qualification *</label>
                                        <input type="text" name="qualification" required value={formData.qualification} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g., MBBS, MD" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years) *</label>
                                            <input type="number" name="experienceYears" required min="0" value={formData.experienceYears} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee ($) *</label>
                                            <input type="number" name="consultationFee" required min="0" step="0.01" value={formData.consultationFee} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
                                        <textarea name="biography" rows="3" value={formData.biography} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                                    </div>
                                </div>
                            </form>
                        </div>
                        
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button type="submit" form="doctorForm" className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md">Create Doctor</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Doctors;

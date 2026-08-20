import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import StateWrapper from '../../components/ui/StateWrapper';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const Departments = () => {
    const { token } = useContext(AuthContext);
    const [departments, setDepartments] = useState([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentDept, setCurrentDept] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', isActive: true });
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = () => {
        fetch('http://localhost:5000/api/departments', { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => { if(data.success) setDepartments(data.data); })
            .catch(() => toast.error('Error fetching departments'));
    };

    const openModal = (dept = null) => {
        if(dept) {
            setCurrentDept(dept);
            setFormData({ name: dept.name, description: dept.description, isActive: dept.is_active });
        } else {
            setCurrentDept(null);
            setFormData({ name: '', description: '', isActive: true });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = currentDept ? 'PUT' : 'POST';
            const url = currentDept ? `http://localhost:5000/api/departments/${currentDept.id}` : 'http://localhost:5000/api/departments';
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            if(data.success) {
                toast.success(data.message);
                setIsModalOpen(false);
                fetchDepartments();
            } else {
                toast.error(data.message);
            }
        } catch { toast.error('Error saving department'); }
    };

    const requestDelete = (id) => {
        setConfirmDialog({ isOpen: true, id });
    };

    const handleDelete = async () => {
        const id = confirmDialog.id;
        if(!id) return;
        try {
            const res = await fetch(`http://localhost:5000/api/departments/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if(data.success) {
                toast.success(data.message);
                fetchDepartments();
            } else {
                toast.error(data.message);
            }
        } catch { toast.error('Error deleting department'); }
    };

    const filtered = departments.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Departments</h2>
                <div className="flex space-x-4">
                    <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button onClick={() => openModal()} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                        <Plus size={18} className="mr-2" /> Add Department
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 uppercase border-b">
                        <tr>
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Description</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center">
                                    <StateWrapper loading={false} empty={true} emptyMessage="No departments found" />
                                </td>
                            </tr>
                        ) : filtered.map(d => (
                            <tr key={d.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">#{d.id}</td>
                                <td className="px-4 py-3 font-medium text-gray-900">{d.name}</td>
                                <td className="px-4 py-3 truncate max-w-xs">{d.description}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${d.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {d.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 flex space-x-3">
                                    <button onClick={() => openModal(d)} className="text-blue-600 hover:text-blue-900"><Edit2 size={18} /></button>
                                    <button onClick={() => requestDelete(d.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-lg font-bold text-gray-900">{currentDept ? 'Edit Department' : 'Add Department'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea required rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                            </div>
                            <div className="flex items-center">
                                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">Is Active</label>
                            </div>
                            <div className="pt-4 flex space-x-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            <ConfirmDialog 
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                title="Delete Department"
                message="Are you sure you want to delete this department? This action cannot be undone."
                confirmText="Yes, Delete"
                isDestructive={true}
            />
        </div>
    );
};
export default Departments;

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Patients = () => {
    const { token } = useContext(AuthContext);
    const [patients, setPatients] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = () => {
        fetch('http://localhost:5000/api/patients', { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => { if(data.success) setPatients(data.data); })
            .catch(() => toast.error('Error fetching patients'));
    };

    const toggleStatus = async (userId, currentStatus) => {
        try {
            const res = await fetch(`http://localhost:5000/api/patients/${userId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            const data = await res.json();
            if(data.success) {
                toast.success('Patient status updated');
                fetchPatients();
            } else toast.error(data.message);
        } catch { toast.error('Error updating status'); }
    };

    const filtered = patients.filter(p => (p.first_name + ' ' + p.last_name + ' ' + p.nic).toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Patients Management</h2>
                <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 uppercase border-b">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">NIC</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">Gender</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(p => (
                            <tr key={p.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">{p.first_name} {p.last_name}</td>
                                <td className="px-4 py-3">{p.nic}</td>
                                <td className="px-4 py-3">{p.phone}</td>
                                <td className="px-4 py-3">{p.gender}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${p.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {p.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <button onClick={() => toggleStatus(p.user_id, p.is_active)} className={`px-3 py-1 rounded text-white text-xs font-bold ${p.is_active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                                        {p.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default Patients;

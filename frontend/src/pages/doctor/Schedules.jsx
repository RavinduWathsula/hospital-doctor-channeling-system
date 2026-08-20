import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, X, Trash2, Edit } from 'lucide-react';

const daysOfWeek = [
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' },
    { id: 7, name: 'Sunday' }
];

const DoctorSchedules = () => {
    const { token } = useContext(AuthContext);
    const [schedules, setSchedules] = useState([]);
    const [doctorId, setDoctorId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        doctor_id: '',
        day_of_week: 1,
        start_time: '09:00',
        end_time: '17:00',
        slot_duration_minutes: 15,
        max_patients: 20,
        status: 'ACTIVE'
    });

    useEffect(() => {
        fetchDoctorProfile();
    }, []);

    useEffect(() => {
        if (doctorId) {
            fetchSchedules();
        }
    }, [doctorId]);

    const fetchDoctorProfile = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/doctors/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data) {
                setDoctorId(data.data.id);
            } else {
                toast.error('Could not load doctor profile');
            }
        } catch {
            toast.error('Error fetching profile');
        }
    };

    const fetchSchedules = () => {
        fetch(`http://localhost:5000/api/schedules/doctor/${doctorId}`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => { if (data.success) setSchedules(data.data); })
            .catch(() => toast.error('Error fetching schedules'));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const openCreateModal = () => {
        setIsEditMode(false);
        setEditId(null);
        setFormData({
            doctor_id: doctorId,
            day_of_week: 1,
            start_time: '09:00',
            end_time: '17:00',
            slot_duration_minutes: 15,
            max_patients: 20,
            status: 'ACTIVE'
        });
        setIsModalOpen(true);
    };

    const openEditModal = (schedule) => {
        setIsEditMode(true);
        setEditId(schedule.id);
        setFormData({
            doctor_id: schedule.doctor_id,
            day_of_week: schedule.day_of_week,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            slot_duration_minutes: schedule.slot_duration_minutes,
            max_patients: schedule.max_patients,
            status: schedule.status
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = isEditMode 
                ? `http://localhost:5000/api/schedules/${editId}` 
                : 'http://localhost:5000/api/schedules';
            const method = isEditMode ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
                toast.success(data.message);
                setIsModalOpen(false);
                fetchSchedules();
            } else {
                toast.error(data.message || 'Error saving schedule');
            }
        } catch {
            toast.error('Server error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this schedule?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/schedules/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Schedule deleted successfully');
                fetchSchedules();
            } else {
                toast.error(data.message);
            }
        } catch {
            toast.error('Server error deleting schedule');
        }
    };

    const getDayName = (day) => {
        const found = daysOfWeek.find(d => d.id === parseInt(day));
        return found ? found.name : 'Unknown';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-6xl mx-auto mt-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Weekly Schedules</h2>
                <button onClick={openCreateModal} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus size={18} className="mr-2" /> Add Schedule
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 uppercase border-b">
                        <tr>
                            <th className="px-4 py-3">Day</th>
                            <th className="px-4 py-3">Time</th>
                            <th className="px-4 py-3">Duration</th>
                            <th className="px-4 py-3">Max Patients</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.map(s => (
                            <tr key={s.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3 font-semibold">{getDayName(s.day_of_week)}</td>
                                <td className="px-4 py-3">{s.start_time} - {s.end_time}</td>
                                <td className="px-4 py-3">{s.slot_duration_minutes} min</td>
                                <td className="px-4 py-3">{s.max_patients}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${s.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {s.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right flex justify-end space-x-2">
                                    <button onClick={() => openEditModal(s)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(s.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {schedules.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">No schedules found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">{isEditMode ? 'Edit Schedule' : 'Add New Schedule'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <form id="scheduleForm" onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week *</label>
                                    <select name="day_of_week" required value={formData.day_of_week} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                                        {daysOfWeek.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                                        <input type="time" name="start_time" required value={formData.start_time} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                                        <input type="time" name="end_time" required value={formData.end_time} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Slot Duration (min) *</label>
                                        <input type="number" name="slot_duration_minutes" required min="1" value={formData.slot_duration_minutes} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Patients *</label>
                                        <input type="number" name="max_patients" required min="1" value={formData.max_patients} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="INACTIVE">INACTIVE</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button type="submit" form="scheduleForm" className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md">
                                {isEditMode ? 'Update' : 'Create'} Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default DoctorSchedules;

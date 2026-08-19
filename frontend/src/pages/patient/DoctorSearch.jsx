import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, Briefcase, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorSearch = () => {
    const { token } = useContext(AuthContext);
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedSpec, setSelectedSpec] = useState('');

    useEffect(() => {
        fetchDepartments();
        fetchDoctors();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/departments', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if(data.success) setDepartments(data.data);
        } catch { console.error("Error fetching departments"); }
    };

    const fetchDoctors = async () => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (searchTerm) queryParams.append('name', searchTerm);
            if (selectedDept) queryParams.append('departmentId', selectedDept);
            if (selectedSpec) queryParams.append('specialization', selectedSpec);

            const res = await fetch(`http://localhost:5000/api/doctors/search?${queryParams.toString()}`, { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            const data = await res.json();
            if(data.success) setDoctors(data.data);
            else toast.error('Error fetching doctors');
        } catch {
            toast.error('Failed to load doctors');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchDoctors();
    };

    // Extract unique specializations for the filter dropdown
    const uniqueSpecs = [...new Set(doctors.map(d => d.specialization))];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Find a Doctor</h1>
                <p className="text-gray-500">Book an appointment with our expert medical professionals.</p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search by doctor name..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                        />
                    </div>
                    
                    <select 
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="w-full md:w-48 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-700"
                    >
                        <option value="">All Departments</option>
                        {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>

                    <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20">
                        Search
                    </button>
                </form>
            </div>

            {/* Results Grid */}
            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : doctors.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No Doctors Found</h3>
                    <p className="text-gray-500">Try adjusting your search criteria or clearing filters.</p>
                    <button onClick={() => {setSearchTerm(''); setSelectedDept(''); setSelectedSpec(''); setTimeout(fetchDoctors, 100);}} className="mt-4 text-blue-600 font-semibold hover:underline">
                        Clear all filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctors.map(doctor => (
                        <div key={doctor.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col">
                            <div className="p-6 flex flex-col items-center border-b border-gray-50">
                                <div className="w-24 h-24 rounded-full bg-blue-50 mb-4 overflow-hidden shadow-inner border-2 border-white">
                                    {doctor.profile_image ? (
                                        <img src={doctor.profile_image} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-blue-500 text-3xl font-bold">
                                            {doctor.first_name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 text-center">Dr. {doctor.first_name} {doctor.last_name}</h3>
                                <p className="text-blue-600 font-medium text-sm mt-1 bg-blue-50 px-3 py-1 rounded-full">{doctor.specialization}</p>
                            </div>
                            
                            <div className="p-6 flex-1 flex flex-col space-y-3">
                                <div className="flex items-center text-sm text-gray-600">
                                    <MapPin size={16} className="text-gray-400 mr-2" />
                                    <span>{doctor.department_name} Department</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Briefcase size={16} className="text-gray-400 mr-2" />
                                    <span>{doctor.experience_years} Years Experience</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <DollarSign size={16} className="text-gray-400 mr-2" />
                                    <span className="font-semibold">${doctor.consultation_fee} Consultation</span>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-gray-50">
                                <Link to={`/doctors/${doctor.id}`} className="block w-full py-2.5 text-center bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 rounded-xl font-semibold text-gray-700 transition-colors">
                                    View Profile
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DoctorSearch;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
            <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md">You do not have permission to view this page. Please log in with the appropriate credentials or contact the administrator.</p>
            <div className="space-x-4">
                <button onClick={() => navigate(-1)} className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm">
                    Go Back
                </button>
                <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm inline-block">
                    Return to Home
                </Link>
            </div>
        </div>
    );
};

export default Unauthorized;

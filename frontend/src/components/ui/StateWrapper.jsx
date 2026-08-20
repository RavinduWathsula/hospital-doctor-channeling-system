import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

const StateWrapper = ({ loading, error, empty, emptyMessage = "No data found", onRetry, children }) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 animate-in fade-in duration-300">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500 font-medium">Loading data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in duration-300 bg-red-50 rounded-2xl border border-red-100">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h3>
                <p className="text-gray-600 mb-6 max-w-md">{error}</p>
                {onRetry && (
                    <button 
                        onClick={onRetry}
                        className="flex items-center bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm"
                    >
                        <RefreshCcw size={18} className="mr-2" /> Try Again
                    </button>
                )}
            </div>
        );
    }

    if (empty) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in duration-300">
                <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-6 border border-gray-100 shadow-inner">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">{emptyMessage}</h3>
                <p className="text-gray-500 max-w-sm">There are no records to display here at the moment.</p>
            </div>
        );
    }

    return <div className="animate-in fade-in duration-500">{children}</div>;
};

export default StateWrapper;

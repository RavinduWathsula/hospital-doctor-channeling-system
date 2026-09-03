import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const LiveDateTime = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDate = (date) => {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <div className="flex items-center gap-2 bg-slate-50/80 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-slate-200/80 shadow-sm text-slate-600 transition-all hover:shadow-md hover:bg-white">
            <Clock size={16} className="text-indigo-500 animate-pulse" />
            <div className="flex items-center gap-2 text-xs md:text-sm font-bold tracking-wide">
                <span className="hidden sm:inline">{formatDate(currentTime)}</span>
                <span className="hidden sm:inline text-slate-300">|</span>
                <span className="text-indigo-700 font-black tracking-wider">{formatTime(currentTime)}</span>
            </div>
        </div>
    );
};

export default LiveDateTime;

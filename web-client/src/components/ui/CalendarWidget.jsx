import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const CalendarWidget = ({
    selectedDate,
    onDateSelect,
    month,
    onMonthChange,
    year,
    onYearChange
}) => {
    const [isMonthOpen, setIsMonthOpen] = useState(false);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-md shadow-sm">
            <div className="flex items-center justify-between mb-6 gap-3">
                {/* Calendar Month Select */}
                <div className="relative flex-1">
                    <button
                        onClick={() => setIsMonthOpen(!isMonthOpen)}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-left font-heading font-semibold text-gray-900 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                        <span className="truncate">{month}</span>
                        <ChevronDown className={`w-4 h-4 text-orange-500 transition-transform ${isMonthOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isMonthOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsMonthOpen(false)}></div>
                            <div className="absolute z-20 top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto p-1">
                                {months.map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => {
                                            onMonthChange(m);
                                            setIsMonthOpen(false);
                                        }}
                                        className={`w-full px-3 py-2 rounded-lg text-left font-body text-sm transition-colors ${month === m ? 'bg-orange-50 text-orange-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Calendar Year Input */}
                <div className="w-24">
                    <input
                        type="number"
                        value={year}
                        onChange={(e) => onYearChange(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-heading font-semibold text-gray-900 text-center focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    />
                </div>
            </div>
            <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-xs font-body font-medium text-gray-400 py-2">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {days.map((day) => (
                    <button
                        key={day}
                        onClick={() => onDateSelect(day)}
                        className={`aspect-square flex items-center justify-center rounded-xl font-body text-sm ${selectedDate === day
                                ? 'bg-orange-500 text-white font-semibold shadow-md shadow-orange-500/20'
                                : day === 21
                                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' // Highlight for example "today" or specific event
                                    : 'hover:bg-gray-100 text-gray-600'
                            }`}
                    >
                        {day}
                    </button>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm font-body text-gray-500">
                    <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                    <span>Events scheduled</span>
                </div>
            </div>
        </div>
    );
};

export default CalendarWidget;

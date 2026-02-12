import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

interface CalendarProps {
    className?: string;
}

export const Calendar: React.FC<CalendarProps> = ({ className = '' }) => {
    const [currentDate] = useState(new Date());

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const today = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return (
        <div className={`bg-card/40 border border-border/50 rounded-3xl p-6 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">
                        {monthNames[currentMonth]}
                    </div>
                    <div className="text-2xl font-black tabular-nums">{currentYear}</div>
                </div>
                <CalendarIcon className="text-muted-foreground" size={20} />
            </div>

            <div className="grid grid-cols-7 gap-2 text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                    <div key={idx} className="text-xs font-bold text-muted-foreground pb-2">
                        {day}
                    </div>
                ))}

                {days.map((day, idx) => (
                    <div
                        key={idx}
                        className={`
              aspect-square flex items-center justify-center text-sm font-bold rounded-lg
              ${day === null ? 'invisible' : ''}
              ${day === today ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted/50'}
              ${day && day !== today ? 'cursor-pointer' : ''}
            `}
                    >
                        {day}
                    </div>
                ))}
            </div>
        </div>
    );
};

import React from 'react';
import { Card } from '@/components/ui/Card';

export const TypingStats = ({ stats }) => {
    const { wpm, accuracy, errors } = stats;

    return (
        <div className="fixed left-0 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-6 p-4">
            <div className="flex flex-col items-center space-y-1">
                <span className="text-sm font-sans uppercase tracking-widest text-ink-light">WPM</span>
                <span className="font-display text-4xl font-bold">{wpm}</span>
            </div>

            <div className="w-8 h-px bg-ink/20 mx-auto"></div>

            <div className="flex flex-col items-center space-y-1">
                <span className="text-sm font-sans uppercase tracking-widest text-ink-light">ACC</span>
                <span className="font-display text-4xl font-bold">{accuracy}%</span>
            </div>

            <div className="w-8 h-px bg-ink/20 mx-auto"></div>

            <div className="flex flex-col items-center space-y-1">
                <span className="text-sm font-sans uppercase tracking-widest text-ink-light">ERR</span>
                <span className={`font-display text-4xl font-bold ${errors > 0 ? 'text-red-500' : 'text-ink'}`}>
                    {errors}
                </span>
            </div>
        </div>
    );
};

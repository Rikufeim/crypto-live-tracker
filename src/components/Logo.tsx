import React from 'react';

interface LogoProps {
    className?: string; // Allow passing additional classes for margin, etc.
}

export const Logo: React.FC<LogoProps> = ({ className = "" }) => {
    // Using a span to keep it inline or block depending on parent, but div is safer for structure. 
    // User asked for "isomman kokoinen" (larger size). I'll make the default base text large enough but scalable. 
    // I will use `text-3xl` as a base but it should be overridden by parent classes if needed, 
    // or I can just let the parent control the font size via className.
    // Actually, let's make it responsive and bold by default.

    return (
        <div className={`font-black tracking-tighter flex items-center select-none ${className}`}>
            <span className="text-foreground">LIVE</span>
            <span className="text-primary">TRACK</span>
        </div>
    );
};

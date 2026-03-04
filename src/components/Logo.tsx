import React from 'react';
import logoImage from '@/assets/logo.png';

interface LogoProps {
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "" }) => {
    return (
        <img src={logoImage} alt="Multiply Live Portfolio" className={`select-none ${className}`} />
    );
};

import React from 'react';

interface MiniChartProps {
    data: number[];
    className?: string;
    color?: string;
    type?: 'line' | 'bar';
}

export const MiniChart: React.FC<MiniChartProps> = ({
    data,
    className = '',
    color = 'rgb(var(--primary))',
    type = 'line'
}) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const normalize = (value: number) => ((value - min) / range) * 100;

    if (type === 'bar') {
        return (
            <div className={`flex items-end justify-between gap-1 h-full ${className}`}>
                {data.map((value, idx) => {
                    const height = normalize(value);
                    return (
                        <div
                            key={idx}
                            className="flex-1 rounded-t-sm transition-all"
                            style={{
                                height: `${height}%`,
                                backgroundColor: color,
                                opacity: 0.6 + (height / 100) * 0.4,
                                minHeight: '4px'
                            }}
                        />
                    );
                })}
            </div>
        );
    }

    // Line chart
    const width = 100;
    const height = 40;
    const points = data.map((value, idx) => ({
        x: (idx / (data.length - 1)) * width,
        y: height - normalize(value) * (height / 100)
    }));

    const pathD = points
        .map((point, idx) => `${idx === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
        .join(' ');

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            className={`w-full h-full ${className}`}
            preserveAspectRatio="none"
        >
            <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {points.map((point, idx) => (
                <circle
                    key={idx}
                    cx={point.x}
                    cy={point.y}
                    r="1.5"
                    fill={color}
                />
            ))}
        </svg>
    );
};

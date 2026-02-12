import React from 'react';

export const HeroBackground: React.FC = () => {
    return (
        <div
            className="fixed inset-0 -z-10"
            style={{
                background: "radial-gradient(circle at 25% 75%, #014f4f55 0%, #014f4f25 20%, transparent 55%), radial-gradient(circle at 75% 25%, #002c4955 0%, #002c4925 20%, transparent 55%), linear-gradient(180deg, #000000 0%, #00000080 40%, #000000 100%)",
                filter: "brightness(1.6)",
                width: "100%",
                height: "100vh",
            }}
        >
        </div>
    );
};

export default HeroBackground;

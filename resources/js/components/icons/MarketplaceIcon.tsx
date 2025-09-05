import React from 'react';

interface MarketplaceIconProps {
    className?: string;
}

export const MarketplaceIcon: React.FC<MarketplaceIconProps> = ({ className = "h-5 w-5" }) => {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            {/* Shopping bag base */}
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            
            {/* Shopping bag handles */}
            <line x1="3" y1="6" x2="21" y2="6"/>
            
            {/* Code symbols inside bag */}
            <path d="m8 10 2 2-2 2"/>
            <path d="m16 10-2 2 2 2"/>
            
            {/* Center dot for modern touch */}
            <circle cx="12" cy="12" r="1" fill="currentColor"/>
        </svg>
    );
};

export default MarketplaceIcon;

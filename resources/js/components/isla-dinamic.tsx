import React, { useState } from 'react';
import { 
    TrendingUp, 
    Clock, 
    Star
} from 'lucide-react';

interface IslaDinamicProps {
    onFilterChange?: (filter: string) => void;
}

export default function IslaDinamic({ 
    onFilterChange 
}: IslaDinamicProps) {
    const [activeFilter, setActiveFilter] = useState('populares');

    const filters = [
        { id: 'populares', label: 'Populares', icon: TrendingUp },
        { id: 'recientes', label: 'Recientes', icon: Clock },
        { id: 'seguidos', label: 'Seguidos', icon: Star }
    ];

    const handleFilterClick = (filterId: string) => {
        setActiveFilter(filterId);
        onFilterChange?.(filterId);
    };

    return (
        <div className="flex justify-center mb-4">
            <div className="relative">
                {/* Isla dinámica solo con filtros */}
                <div className="apple-liquid-card border border-white/20 rounded-full px-4 py-2 bg-black/30 backdrop-blur-xl shadow-2xl">
                    <div className="flex items-center gap-1">
                        {/* Filtros integrados */}
                        {filters.map((filter) => {
                            const Icon = filter.icon;
                            const isActive = activeFilter === filter.id;
                            
                            return (
                                <button
                                    key={filter.id}
                                    type="button"
                                    onClick={() => handleFilterClick(filter.id)}
                                    className={`p-2 rounded-full transition-all duration-200 cursor-pointer z-10 relative ${
                                        isActive 
                                            ? 'bg-blue-500/40 text-white shadow-lg shadow-blue-500/25' 
                                            : 'text-white/60 hover:text-white hover:bg-white/15'
                                    }`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

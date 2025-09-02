import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Heart, 
    Flame, 
    Lightbulb, 
    Bug, 
    Sparkles
} from 'lucide-react';
import { apiRequest } from '@/utils/csrf';

interface PostReactionsProps {
    postId: number;
    currentUserId: number;
    initialReactions: {
        likes_count: number;
        fire_count: number;
        idea_count: number;
        bug_count: number;
        sparkle_count: number;
    };
    userReaction?: string | null;
    onReactionChange: () => void;
}

interface ReactionType {
    key: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    borderColor: string;
}

const reactionTypes: ReactionType[] = [
    {
        key: 'like',
        label: 'Like',
        icon: Heart,
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-400/30'
    },
    {
        key: 'fire',
        label: 'Fire',
        icon: Flame,
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/20',
        borderColor: 'border-orange-400/30'
    },
    {
        key: 'idea',
        label: 'Idea',
        icon: Lightbulb,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-400/30'
    },
    {
        key: 'bug',
        label: 'Bug',
        icon: Bug,
        color: 'text-red-500',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/30'
    },
    {
        key: 'sparkle',
        label: 'Sparkle',
        icon: Sparkles,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20',
        borderColor: 'border-purple-400/30'
    }
];

export default function PostReactions({ 
    postId, 
    currentUserId, 
    initialReactions, 
    userReaction,
    onReactionChange 
}: PostReactionsProps) {
    const [reactions, setReactions] = useState(initialReactions);
    const [currentUserReaction, setCurrentUserReaction] = useState(userReaction);
    const [isLoading, setIsLoading] = useState(false);


    const handleReaction = async (reactionType: string) => {
        if (isLoading) return;
        
        setIsLoading(true);
        
        try {
            const response = await apiRequest(`/posts/${postId}/like`, {
                method: 'POST',
                body: JSON.stringify({
                    type: reactionType
                }),
            });

            if (response.ok) {
                const data = await response.json();
                
                // Actualizar reacciones locales
                if (data.action === 'added') {
                    // Si ya había una reacción, removerla del contador anterior
                    if (currentUserReaction && currentUserReaction !== reactionType) {
                        setReactions(prev => ({
                            ...prev,
                            [`${currentUserReaction}_count`]: Math.max(0, prev[`${currentUserReaction}_count` as keyof typeof prev] - 1)
                        }));
                    }
                    
                    // Agregar nueva reacción
                    setReactions(prev => ({
                        ...prev,
                        [`${reactionType}_count`]: prev[`${reactionType}_count` as keyof typeof prev] + 1
                    }));
                    
                    setCurrentUserReaction(reactionType);
                } else {
                    // Remover reacción
                    setReactions(prev => ({
                        ...prev,
                        [`${reactionType}_count`]: Math.max(0, prev[`${reactionType}_count` as keyof typeof prev] - 1)
                    }));
                    
                    setCurrentUserReaction(null);
                }
                
                onReactionChange();
            }
        } catch (error) {
            console.error('Error al manejar reacción:', error);
        } finally {
            setIsLoading(false);
        }
    };





    return (
        <div className="space-y-3">
            {/* Botones de reacción */}
            <div className="flex items-center gap-1">
                {reactionTypes.map((type) => {
                    const count = Number(reactions[`${type.key}_count` as keyof typeof reactions]) || 0;
                    const isActive = currentUserReaction === type.key;
                    
                    return (
                        <Button
                            key={type.key}
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleReaction(type.key);
                            }}
                            disabled={isLoading}
                            className={`gap-1 transition-all duration-200 relative z-10 cursor-pointer ${
                                isActive 
                                    ? `${type.color} ${type.bgColor} ${type.borderColor}` 
                                    : 'text-white/70 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <type.icon className={`h-4 w-4 ${isActive ? 'fill-current' : ''}`} />
                            <span className="text-xs">{count || 0}</span>
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, UserPlus, X, Bell, Activity } from 'lucide-react';
import { formatTimeAgo } from '@/utils/time-format';

interface Activity {
    id: string;
    type: 'like' | 'comment' | 'follow';
    action: string;
    content?: string;
    user: {
        id: string;
        username: string;
        full_name?: string;
        avatar?: string;
    };
    created_at: string;
}

interface ActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ActivityModal: React.FC<ActivityModalProps> = ({ isOpen, onClose }) => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchActivities = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/activities/recent', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setActivities(data.activities || []);
            } else {
                console.error('Error fetching activities:', response.statusText);
                setActivities([]);
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
            setActivities([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchActivities();
        }
    }, [isOpen]);

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'like':
                return <Heart className="h-4 w-4 text-red-500 fill-current" />;
            case 'comment':
                return <MessageCircle className="h-4 w-4 text-blue-500" />;
            case 'follow':
                return <UserPlus className="h-4 w-4 text-green-500" />;
            default:
                return <Activity className="h-4 w-4 text-white/50" />;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={onClose}>
            <div 
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-white text-lg font-semibold">
                            Actividad Reciente
                        </h2>
                        <Button
                            onClick={onClose}
                            variant="ghost"
                            size="sm"
                            className="text-white/70 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-white/70 text-sm mt-1">
                        Últimas interacciones con tus posts, historias y perfil
                    </p>
                </div>

                {/* Activities List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex gap-3 animate-pulse">
                                    <div className="w-8 h-8 bg-white/10 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-white/10 rounded w-1/4 mb-2"></div>
                                        <div className="h-3 bg-white/10 rounded w-3/4 mb-1"></div>
                                        <div className="h-3 bg-white/10 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : activities.length > 0 ? (
                        activities.map((activity) => (
                            <div 
                                key={activity.id} 
                                className="flex gap-3 hover:bg-white/5 transition-colors cursor-pointer p-2 rounded-lg"
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={activity.user.avatar} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
                                        {activity.user.full_name?.charAt(0) || activity.user.username?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-white font-medium text-sm">
                                            {activity.user.full_name || activity.user.username}
                                        </span>
                                        <span className="text-white/50 text-xs">
                                            @{activity.user.username}
                                        </span>
                                        <span className="text-white/30 text-xs">•</span>
                                        <span className="text-white/30 text-xs">
                                            {formatTimeAgo(activity.created_at)}
                                        </span>
                                    </div>
                                    
                                    <p className="text-white/90 text-sm leading-relaxed mb-1">
                                        {activity.action}
                                    </p>
                                    
                                    {activity.content && (
                                        <p className="text-white/60 text-xs line-clamp-2 mb-2">
                                            "{activity.content}"
                                        </p>
                                    )}
                                </div>
                                
                                <div className="flex-shrink-0 mt-1">
                                    {getActivityIcon(activity.type)}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <Bell className="h-12 w-12 text-white/30 mx-auto mb-3" />
                            <p className="text-white/50 text-sm">No hay actividad reciente</p>
                            <p className="text-white/30 text-xs">Las interacciones aparecerán aquí</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {activities.length > 0 && (
                    <div className="p-4 border-t border-white/10 bg-white/5">
                        <Button 
                            variant="ghost" 
                            className="w-full text-white/70 hover:text-white hover:bg-white/10"
                            onClick={onClose}
                        >
                            Cerrar
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityModal;
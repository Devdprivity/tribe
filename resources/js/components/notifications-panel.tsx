import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Bell,
    MessageCircle,
    Heart,
    UserPlus,
    Star,
    Check,
    X
} from 'lucide-react';

interface Notification {
    id: number;
    type: 'post_like' | 'post_comment' | 'comment_like' | 'comment_reply' | 'user_follow' | 'channel_join' | 'channel_invite' | 'mention' | 'job_application' | 'job_status_change' | 'system' | 'channel_new_post' | 'direct_message';
    title: string;
    message: string;
    from_user?: {
        id: number;
        username: string;
        full_name: string;
        avatar?: string;
    };
    data?: Record<string, unknown>;
    link?: string;
    read: boolean;
    read_at?: string;
    created_at: string;
}

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'post_like': return <Heart className="h-4 w-4 text-red-500" />;
        case 'post_comment': return <MessageCircle className="h-4 w-4 text-blue-500" />;
        case 'comment_like': return <Heart className="h-4 w-4 text-red-500" />;
        case 'comment_reply': return <MessageCircle className="h-4 w-4 text-green-500" />;
        case 'user_follow': return <UserPlus className="h-4 w-4 text-green-500" />;
        case 'channel_join': return <UserPlus className="h-4 w-4 text-blue-500" />;
        case 'channel_invite': return <Star className="h-4 w-4 text-purple-500" />;
        case 'mention': return <Star className="h-4 w-4 text-yellow-500" />;
        case 'job_application': return <Bell className="h-4 w-4 text-purple-500" />;
        case 'job_status_change': return <Bell className="h-4 w-4 text-orange-500" />;
        case 'channel_new_post': return <MessageCircle className="h-4 w-4 text-blue-500" />;
        case 'direct_message': return <MessageCircle className="h-4 w-4 text-green-500" />;
        default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
};

const getNotificationColor = (type: string, read: boolean) => {
    if (read) return 'bg-background border-border';

    switch (type) {
        case 'post_like': return 'bg-red-50 border-red-200';
        case 'post_comment': return 'bg-blue-50 border-blue-200';
        case 'comment_like': return 'bg-red-50 border-red-200';
        case 'comment_reply': return 'bg-green-50 border-green-200';
        case 'user_follow': return 'bg-green-50 border-green-200';
        case 'channel_join': return 'bg-blue-50 border-blue-200';
        case 'channel_invite': return 'bg-purple-50 border-purple-200';
        case 'mention': return 'bg-yellow-50 border-yellow-200';
        case 'job_application': return 'bg-purple-50 border-purple-200';
        case 'job_status_change': return 'bg-orange-50 border-orange-200';
        case 'channel_new_post': return 'bg-blue-50 border-blue-200';
        case 'direct_message': return 'bg-green-50 border-green-200';
        default: return 'bg-gray-50 border-gray-200';
    }
};

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Ahora mismo';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
    return `${Math.floor(diffInSeconds / 2592000)}mes`;
};

export function NotificationsPanel() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/notifications/unread', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Notifications data:', data); // Debug
            setNotifications(data.notifications || []);
            setUnreadCount(data.unread_count || 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setNotifications([]);
            setUnreadCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Actualizar cada 30 segundos
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id: number) => {
        try {
            await fetch(`/notifications/${id}/read`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === id ? { ...notif, read: true, read_at: new Date().toISOString() } : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const deleteNotification = async (id: number) => {
        try {
            await fetch(`/notifications/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const notification = notifications.find(n => n.id === id);
            setNotifications(prev => prev.filter(notif => notif.id !== id));
            if (notification && !notification.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (notification.link) {
            window.location.href = notification.link;
        }
    };

    return (
        <div className="p-4 space-y-4">
            <Card className="apple-liquid-card">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2 text-white">
                            <Bell className="h-5 w-5" />
                            Notificaciones
                            {unreadCount > 0 && (
                                <Badge variant="destructive" className="ml-2">
                                    {unreadCount}
                                </Badge>
                            )}
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.location.href = '/notifications'}
                            className="text-white hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20 rounded-lg apple-liquid-button"
                        >
                            Ver todas
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-3">
                    {loading ? (
                        <div className="text-center py-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/30 mx-auto mb-2"></div>
                            <p className="text-white/70 text-sm">Cargando...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-8">
                            <Bell className="h-12 w-12 text-white/30 mx-auto mb-3" />
                            <p className="text-white/70 text-sm">No tienes notificaciones</p>
                        </div>
                    ) : (
                        notifications.slice(0, 5).map((notif) => (
                            <div
                                key={notif.id}
                                className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                                    notif.read
                                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                        : 'bg-white/10 border-white/20 hover:bg-white/15'
                                }`}
                                onClick={() => handleNotificationClick(notif)}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        {getNotificationIcon(notif.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium mb-1 ${
                                            notif.read ? 'text-white/80' : 'text-white'
                                        }`}>
                                            {notif.title}
                                        </p>
                                        <p className="text-xs text-white/70 mb-2 line-clamp-2">
                                            {notif.message}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-white/50">
                                                {formatTimeAgo(notif.created_at)}
                                            </span>
                                            {!notif.read && (
                                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAsRead(notif.id);
                                            }}
                                            className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
                                        >
                                            <Check className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notif.id);
                                            }}
                                            className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

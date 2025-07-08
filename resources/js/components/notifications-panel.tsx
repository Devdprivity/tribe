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

    if (loading) {
        return (
            <div className="p-4 space-y-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notificaciones
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="text-sm text-muted-foreground mt-2">Cargando...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4">
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notificaciones
                            {unreadCount > 0 && (
                                <Badge variant="destructive" className="ml-2">
                                    {unreadCount}
                                </Badge>
                            )}
                        </CardTitle>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = '/notifications'}
                        >
                            Ver todas
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-3">
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-3 rounded-lg border transition-colors ${
                                    getNotificationColor(notification.type, notification.read)
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        {notification.from_user ? (
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={notification.from_user.avatar} />
                                                <AvatarFallback>
                                                    {notification.from_user.full_name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">
                                                    {notification.title}
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {formatTimeAgo(notification.created_at)}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-1 ml-2">
                                                {!notification.read && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="h-6 w-6 p-0"
                                                    >
                                                        <Check className="h-3 w-3" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="h-6 w-6 p-0"
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                                No tienes notificaciones
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

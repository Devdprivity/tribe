import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
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
    X,
    Trash2
} from 'lucide-react';

interface Notification {
    id: number;
    type: 'post_like' | 'post_comment' | 'comment_like' | 'comment_reply' | 'user_follow' | 'channel_join' | 'channel_invite' | 'mention' | 'job_application' | 'job_status_change' | 'system';
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

interface Props {
    notifications: {
        data: Notification[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
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

export default function NotificationsIndex({ notifications }: Props) {
    const [notificationsList, setNotificationsList] = useState(notifications.data);
    const [loading, setLoading] = useState(false);

    const markAsRead = async (id: number) => {
        try {
            await fetch(`/notifications/${id}/read`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            setNotificationsList(prev =>
                prev.map(notif =>
                    notif.id === id ? { ...notif, read: true, read_at: new Date().toISOString() } : notif
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        setLoading(true);
        try {
            await fetch('/notifications/read-all', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            setNotificationsList(prev =>
                prev.map(notif => ({ ...notif, read: true, read_at: new Date().toISOString() }))
            );
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        } finally {
            setLoading(false);
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

            setNotificationsList(prev => prev.filter(notif => notif.id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const deleteReadNotifications = async () => {
        setLoading(true);
        try {
            await fetch('/notifications/read', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            setNotificationsList(prev => prev.filter(notif => !notif.read));
        } catch (error) {
            console.error('Error deleting read notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const unreadCount = notificationsList.filter(n => !n.read).length;
    const readCount = notificationsList.filter(n => n.read).length;

    return (
        <AppLayout title="Notificaciones" description="Gestiona tus notificaciones en Tribe">
            <Head title="Notificaciones" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Notificaciones</h1>
                        <p className="text-muted-foreground">
                            {unreadCount} sin leer • {readCount} leídas
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <Button
                                onClick={markAllAsRead}
                                disabled={loading}
                                variant="outline"
                            >
                                <Check className="h-4 w-4 mr-2" />
                                Marcar todo como leído
                            </Button>
                        )}

                        {readCount > 0 && (
                            <Button
                                onClick={deleteReadNotifications}
                                disabled={loading}
                                variant="outline"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar leídas
                            </Button>
                        )}
                    </div>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {notificationsList.length > 0 ? (
                            <div className="divide-y divide-border">
                                {notificationsList.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 transition-colors ${
                                            getNotificationColor(notification.type, notification.read)
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0">
                                                {notification.from_user ? (
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={notification.from_user.avatar} />
                                                        <AvatarFallback>
                                                            {notification.from_user.full_name.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                        {getNotificationIcon(notification.type)}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className="text-sm font-medium">
                                                                {notification.title}
                                                            </p>
                                                            {!notification.read && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    Nuevo
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        <p className="text-sm text-muted-foreground mb-1">
                                                            {notification.message}
                                                        </p>

                                                        <p className="text-xs text-muted-foreground">
                                                            {formatTimeAgo(notification.created_at)}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-1 ml-2">
                                                        {!notification.read && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => markAsRead(notification.id)}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <Check className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => deleteNotification(notification.id)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-lg font-medium mb-2">No tienes notificaciones</h3>
                                <p className="text-sm text-muted-foreground">
                                    Cuando recibas notificaciones, aparecerán aquí
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

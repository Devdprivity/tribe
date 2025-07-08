import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    Bell,
    MessageCircle,
    Plus,
    Settings,
    LogOut
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

interface User {
    id: number;
    username: string;
    full_name: string;
    avatar?: string;
}

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    from_user?: {
        id: number;
        username: string;
        full_name: string;
        avatar?: string;
    };
    link?: string;
    read: boolean;
    created_at: string;
}

interface ChatUser {
    id: number;
    name: string;
    username: string;
    avatar?: string;
    online: boolean;
}

interface Chat {
    id: number;
    user: ChatUser;
    lastMessage: string | null;
    time: string | null;
    unreadCount: number;
    isFromMe: boolean;
}

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'post_like': return <span className="text-red-500">♥</span>;
        case 'post_comment': return <span className="text-blue-500">💬</span>;
        case 'user_follow': return <span className="text-green-500">➕</span>;
        case 'direct_message': return <span className="text-green-500">✉️</span>;
        default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
};

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return 'Ahora';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
    return `${Math.floor(diffInSeconds / 2592000)}mes`;
};

export function AppHeader() {
    const props = usePage().props as { auth?: { user: User } };
    const user = props.auth?.user;

    // Notificaciones
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // Mensajes
    const [chats, setChats] = useState<Chat[]>([]);
    const [loadingChats, setLoadingChats] = useState(true);
    const [unreadMessages, setUnreadMessages] = useState(0);

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/notifications/unread', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin'
            });
            if (!response.ok) throw new Error();
            const data = await response.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unread_count || 0);
        } catch {
            setNotifications([]);
            setUnreadCount(0);
        } finally {
            setLoading(false);
        }
    };

    const fetchChats = async () => {
        try {
            const response = await fetch('/api/messages/conversations');
            if (response.ok) {
                const data = await response.json();
                setChats(data.conversations || []);
                setUnreadMessages(
                    (data.conversations || []).reduce((acc: number, chat: Chat) => acc + (chat.unreadCount || 0), 0)
                );
            }
        } catch {
            setChats([]);
            setUnreadMessages(0);
        } finally {
            setLoadingChats(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        fetchChats();
        const interval = setInterval(() => {
            fetchNotifications();
            fetchChats();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between px-6 py-3">
                {/* Búsqueda Global */}
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar en Tribe..."
                            className="pl-10 bg-muted/50 border-0 focus:bg-background"
                        />
                    </div>
                </div>

                {/* Acciones Centrales */}
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/posts/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Crear Post
                        </Link>
                    </Button>
                </div>

                {/* Acciones del Usuario */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <>
                            {/* Notificaciones Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="relative">
                                        <Bell className="h-5 w-5" />
                                        {unreadCount > 0 && (
                                            <Badge
                                                variant="destructive"
                                                className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
                                            >
                                                {unreadCount}
                                            </Badge>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
                                    <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {loading ? (
                                        <div className="text-center py-6 text-muted-foreground text-sm">Cargando...</div>
                                    ) : notifications.length === 0 ? (
                                        <div className="text-center py-6 text-muted-foreground text-sm">No hay notificaciones</div>
                                    ) : (
                                        notifications.slice(0, 8).map((notif) => (
                                            <DropdownMenuItem key={notif.id} asChild className={!notif.read ? 'bg-muted/50' : ''}>
                                                <Link href={notif.link || '/notifications'} className="flex gap-2 items-start w-full">
                                                    <span>{getNotificationIcon(notif.type)}</span>
                                                    <span className="flex-1">
                                                        <span className="block font-medium text-sm">{notif.title}</span>
                                                        <span className="block text-xs text-muted-foreground">{notif.message}</span>
                                                        <span className="block text-xs text-muted-foreground mt-1">{formatTimeAgo(notif.created_at)}</span>
                                                    </span>
                                                </Link>
                                            </DropdownMenuItem>
                                        ))
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/notifications" className="w-full text-center text-primary font-medium">Ver todas</Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Mensajes Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="relative">
                                        <MessageCircle className="h-5 w-5" />
                                        {unreadMessages > 0 && (
                                            <Badge
                                                variant="destructive"
                                                className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
                                            >
                                                {unreadMessages}
                                            </Badge>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
                                    <DropdownMenuLabel>Mensajes</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {loadingChats ? (
                                        <div className="text-center py-6 text-muted-foreground text-sm">Cargando...</div>
                                    ) : chats.length === 0 ? (
                                        <div className="text-center py-6 text-muted-foreground text-sm">No tienes mensajes</div>
                                    ) : (
                                        chats.slice(0, 8).map((chat) => (
                                            <DropdownMenuItem key={chat.id} asChild>
                                                <Link href={`/messages/${chat.user.id}`} className="flex gap-2 items-center w-full">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={chat.user.avatar} />
                                                        <AvatarFallback>{chat.user.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-medium text-sm truncate">{chat.user.name}</span>
                                                            <span className="text-xs text-muted-foreground">{chat.time || ''}</span>
                                                        </div>
                                                        <span className="block text-xs text-muted-foreground truncate">
                                                            {chat.lastMessage ? (chat.isFromMe ? `Tú: ${chat.lastMessage}` : chat.lastMessage) : 'Sin mensajes'}
                                                        </span>
                                                    </div>
                                                    {chat.unreadCount > 0 && (
                                                        <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                                                            {chat.unreadCount}
                                                        </Badge>
                                                    )}
                                                </Link>
                                            </DropdownMenuItem>
                                        ))
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/messages" className="w-full text-center text-primary font-medium">Ver todos</Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Perfil del Usuario */}
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.avatar} />
                                    <AvatarFallback>
                                        {user.full_name?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden md:block">
                                    <p className="text-sm font-medium">{user.full_name}</p>
                                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                                </div>
                            </div>

                            {/* Menú de Usuario */}
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/settings/profile">
                                        <Settings className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/logout" method="post" as="button">
                                        <LogOut className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/login">Iniciar Sesión</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href="/register">Registrarse</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

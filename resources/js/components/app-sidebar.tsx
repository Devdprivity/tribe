import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useSidebar } from '@/contexts/sidebar-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    MessageCircle,
    Bell,
    Settings,
    BookOpen,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    Briefcase,
    Hash,
    Bookmark,
    Calendar,
    Star,
    Zap,
    Award
} from 'lucide-react';

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
    read: boolean;
    created_at: string;
}

interface Chat {
    id: number;
    user: {
        id: number;
        name: string;
        username: string;
        avatar?: string;
        online: boolean;
    };
    lastMessage: string | null;
    time: string | null;
    unreadCount: number;
}

interface FavoriteChannel {
    id: number;
    name: string;
    slug: string;
    type: string;
    members_count: number;
    is_online?: boolean;
}

export function AppSidebar() {
    const props = usePage().props as { auth?: { user: User } };
    const user = props.auth?.user;

    // Estado del sidebar desde el contexto
    const { isCollapsed, toggleSidebar } = useSidebar();

    // Notificaciones
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Mensajes
    const [chats, setChats] = useState<Chat[]>([]);
    const [unreadMessages, setUnreadMessages] = useState(0);

    // Canales favoritos
    const [favoriteChannels, setFavoriteChannels] = useState<FavoriteChannel[]>([]);
    const [loadingChannels, setLoadingChannels] = useState(true);

    // El toggleSidebar ya viene del contexto, pero mantenemos el evento personalizado
    const handleToggleSidebar = () => {
        toggleSidebar();
        // Emitir evento para que el layout sepa del cambio
        window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { isCollapsed: !isCollapsed } }));
    };

    const navigationItems = [
        { name: 'Timeline', href: '/timeline', icon: TrendingUp, badge: null },
        { name: 'Desarrolladores', href: '/users', icon: Users, badge: null },
        { name: 'Canales', href: '/channels', icon: Hash, badge: null },
        { name: 'Certificaciones', href: '/certifications', icon: Award, badge: null },
        { name: 'Trabajos', href: '/jobs', icon: Briefcase, badge: 'Nuevo' },
        { name: 'Guardados', href: '/bookmarks', icon: Bookmark, badge: null },
    ];



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
        }
    };

    const fetchFavoriteChannels = async () => {
        try {
            setLoadingChannels(true);
            const response = await fetch('/api/channels/favorites', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin'
            });
            
            if (response.ok) {
                const data = await response.json();
                setFavoriteChannels(data.channels || []);
            } else {
                setFavoriteChannels([]);
            }
        } catch (error) {
            console.error('Error fetching favorite channels:', error);
            setFavoriteChannels([]);
        } finally {
            setLoadingChannels(false);
        }
    };

    const getChannelTypeColor = (type: string) => {
        switch (type) {
            case 'level':
                return 'bg-green-500/20';
            case 'industry':
                return 'bg-blue-500/20';
            case 'location':
                return 'bg-purple-500/20';
            case 'interest':
                return 'bg-orange-500/20';
            default:
                return 'bg-gray-500/20';
        }
    };

    const getChannelStatusColor = (isOnline?: boolean) => {
        return isOnline ? 'bg-green-400' : 'bg-gray-400';
    };

    useEffect(() => {
        fetchNotifications();
        fetchChats();
        fetchFavoriteChannels();
        
        const interval = setInterval(() => {
            fetchNotifications();
            fetchChats();
            fetchFavoriteChannels();
        }, 30000);
        
        return () => clearInterval(interval);
    }, []);

    // Si está colapsado, mostrar solo el orbe flotante
    if (isCollapsed) {
        return (
            <div className="fixed left-4 top-20 z-50">
                <div className="relative">
                    {/* Botón principal con avatar */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleToggleSidebar}
                        className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg text-white hover:bg-white/20 transition-all duration-200 border border-white/20"
                        title="Expandir sidebar"
                    >
                        {user ? (
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/20">
                                {user.avatar ? (
                                    <img 
                                        src={user.avatar} 
                                        alt={user.full_name || user.username}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-white font-bold text-lg">
                                        {user.full_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <ChevronRight className="h-6 w-6" />
                        )}
                    </Button>
                    

                    
                    {/* Indicador de que es expandible */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded-md opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        {user ? 'Expandir sidebar' : 'Iniciar sesión'}
                    </div>
                </div>
            </div>
        );
    }

    // Sidebar expandido - botón de colapsar en el borde derecho
    return (
        <div className="w-64 border-r border-white/10 apple-liquid-sidebar relative">
            {/* Botón de colapsar posicionado hacia afuera */}
            <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 z-10">
                <div className="w-6 h-16 bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-sm border-r border-white/20 rounded-r-full flex items-center justify-center cursor-pointer hover:from-white/25 hover:to-white/10 transition-all duration-300 shadow-lg"
                     onClick={handleToggleSidebar}
                     title="Colapsar sidebar">
                    <span className="text-white/90 font-bold text-xs">
                        ←
                    </span>
                </div>
            </div>

            <div className="flex flex-col h-screen">
                {/* Header simplificado - solo espacio para el botón */}
                <div className="p-4">
                    {/* Espacio vacío para mantener la altura */}
                </div>

                {/* Navegación Principal */}
                <nav className="flex-1 p-4 space-y-2">
                    <div className="space-y-1">
                        {navigationItems.map((item) => (
                            <Link key={item.name} href={item.href}>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-3 h-11 text-white hover:bg-white/10 hover:text-white transition-all duration-200 rounded-xl border border-transparent hover:border-white/20"
                                >
                                    <item.icon className="h-5 w-5 text-white/90 flex-shrink-0" />
                                    <span className="flex-1 text-left text-white font-medium">{item.name}</span>
                                    {item.badge && (
                                        <Badge variant="destructive" className="ml-auto text-xs bg-red-500/80 text-white border-red-400/50">
                                            {item.badge}
                                        </Badge>
                                    )}
                                </Button>
                            </Link>
                        ))}
                    </div>

                    {/* Separador */}
                    <div className="border-t border-white/10 my-6" />



                    {/* Canales Favoritos */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider px-3">
                            Canales Favoritos
                        </h3>
                        <div className="space-y-1">
                            {loadingChannels ? (
                                // Estado de carga
                                <div className="space-y-2">
                                    <div className="h-9 bg-white/5 rounded-xl animate-pulse"></div>
                                    <div className="h-9 bg-white/5 rounded-xl animate-pulse"></div>
                                    <div className="h-9 bg-white/5 rounded-xl animate-pulse"></div>
                                </div>
                            ) : favoriteChannels.length > 0 ? (
                                // Canales favoritos dinámicos
                                favoriteChannels.slice(0, 5).map((channel) => (
                                    <Link key={channel.id} href={`/channels/${channel.slug}`}>
                                        <Button 
                                            variant="ghost" 
                                            className="w-full justify-start gap-3 h-9 text-sm text-white hover:bg-white/10 hover:text-white transition-all duration-200 rounded-xl border border-transparent hover:border-white/20"
                                        >
                                            <div className={`w-2 h-2 ${getChannelStatusColor(channel.is_online)} rounded-full shadow-lg flex-shrink-0`} />
                                            <span className="font-medium">#{channel.name}</span>
                                            {channel.members_count > 0 && (
                                                <Badge variant="outline" className="ml-auto text-xs bg-white/10 text-white border-white/20">
                                                    {channel.members_count}
                                                </Badge>
                                            )}
                                        </Button>
                                    </Link>
                                ))
                            ) : (
                                // Estado vacío
                                <div className="text-center py-4">
                                    <Hash className="h-8 w-8 mx-auto mb-2 text-white/50" />
                                    <p className="text-xs text-white/50">No hay canales favoritos</p>
                                    <Link href="/channels">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="mt-2 text-xs bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"
                                        >
                                            Explorar canales
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Footer - Perfil del Usuario */}
                <div className="p-4 border-t border-white/10">
                    {user ? (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                            <Avatar className="h-8 w-8 ring-2 ring-white/20 flex-shrink-0">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                                    {user.full_name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate text-white">{user.full_name}</p>
                                <p className="text-xs text-white/70">@{user.username}</p>
                            </div>
                            <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20 rounded-lg">
                                <Link href="/settings">
                                    <Settings className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Button asChild className="w-full bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25 rounded-xl">
                                <Link href="/login">Iniciar Sesión</Link>
                            </Button>
                            <Button variant="outline" asChild className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 rounded-xl">
                                <Link href="/register">Registrarse</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

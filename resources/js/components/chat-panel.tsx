import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    MessageCircle,
    MoreHorizontal,
    Search,
    Circle,
    Users
} from 'lucide-react';

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

export function ChatPanel() {
    const page = usePage();
    const props = page.props as { auth?: { user: any } };
    const user = props.auth?.user;
    
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchConversations();

        // Actualizar conversaciones cada 30 segundos
        const interval = setInterval(fetchConversations, 30000);

        return () => clearInterval(interval);
    }, []);

    const fetchConversations = async () => {
        try {
            const response = await fetch('/api/messages/conversations');
            if (response.ok) {
                const data = await response.json();
                setChats(data.conversations);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredChats = chats.filter(chat =>
        chat.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const onlineCount = chats.filter(chat => chat.user.online).length;

    return (
        <div className="p-4 space-y-4">
            <Card className="apple-liquid-card">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2 text-white">
                            <MessageCircle className="h-5 w-5" />
                            Mensajes
                            {onlineCount > 0 && (
                                <Badge variant="secondary" className="ml-2 bg-green-500/80 text-white border-green-400/50">
                                    {onlineCount} en línea
                                </Badge>
                            )}
                        </CardTitle>
                        <div className="flex flex-col items-center">
                            <Avatar className="h-8 w-8 ring-2 ring-white/20">
                                <AvatarImage src={user?.avatar} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs font-bold">
                                    {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-white/70 mt-1 text-center">
                                {user?.full_name || user?.username || 'Usuario'}
                            </span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Búsqueda */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-white/70" />
                        <Input
                            placeholder="Buscar conversaciones..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
                        />
                    </div>

                    {/* Lista de chats */}
                    <div className="space-y-2">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/30 mx-auto mb-4"></div>
                                <p className="text-sm text-white/70">Cargando conversaciones...</p>
                            </div>
                        ) : filteredChats.length > 0 ? (
                            filteredChats.map((chat) => (
                                <Link
                                    key={chat.id}
                                    href={`/messages/${chat.user.id}`}
                                    className="block"
                                >
                                    <div className="p-3 rounded-lg border border-white/10 transition-colors cursor-pointer hover:bg-white/10 bg-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <Avatar className="h-10 w-10 ring-2 ring-white/20">
                                                    <AvatarImage src={chat.user.avatar} />
                                                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-bold">
                                                        {chat.user.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {chat.user.online && (
                                                    <Circle className="h-3 w-3 text-green-400 absolute -bottom-1 -right-1 fill-current" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-medium truncate text-white">
                                                        {chat.user.name}
                                                    </h4>
                                                    <span className="text-xs text-white/70">
                                                        {chat.time || ''}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-white/80 truncate mt-1">
                                                    {chat.lastMessage ? (
                                                        chat.isFromMe ? `Tú: ${chat.lastMessage}` : chat.lastMessage
                                                    ) : 'Sin mensajes'}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {chat.unreadCount > 0 && (
                                                    <Badge variant="destructive" className="h-5 w-5 p-0 text-xs bg-red-500/80 text-white border-red-400/50">
                                                        {chat.unreadCount}
                                                    </Badge>
                                                )}
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-white/10 hover:bg-white/20 text-white border border-transparent hover:border-white/20 rounded-lg">
                                                    <MoreHorizontal className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-white/70" />
                                <p className="text-sm text-white/70">
                                    {searchQuery ? 'No se encontraron conversaciones' : 'No tienes conversaciones'}
                                </p>
                                {!searchQuery && (
                                    <Button variant="outline" size="sm" className="mt-2 bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 rounded-lg apple-liquid-button" asChild>
                                        <Link href="/users">
                                            <Users className="h-4 w-4 mr-2 text-blue-400" />
                                            Buscar usuarios
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>


        </div>
    );
}

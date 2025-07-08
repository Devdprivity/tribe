import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
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
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <MessageCircle className="h-5 w-5" />
                            Mensajes
                            {onlineCount > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {onlineCount} en línea
                                </Badge>
                            )}
                        </CardTitle>
                        <Button variant="outline" size="sm">
                            <Users className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Búsqueda */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar conversaciones..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Lista de chats */}
                    <div className="space-y-2">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-sm text-muted-foreground">Cargando conversaciones...</p>
                            </div>
                        ) : filteredChats.length > 0 ? (
                            filteredChats.map((chat) => (
                                <Link
                                    key={chat.id}
                                    href={`/messages/${chat.user.id}`}
                                    className="block"
                                >
                                    <div className="p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 bg-background">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={chat.user.avatar} />
                                                    <AvatarFallback>
                                                        {chat.user.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {chat.user.online && (
                                                    <Circle className="h-3 w-3 text-green-500 absolute -bottom-1 -right-1 fill-current" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-medium truncate">
                                                        {chat.user.name}
                                                    </h4>
                                                    <span className="text-xs text-muted-foreground">
                                                        {chat.time || ''}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground truncate mt-1">
                                                    {chat.lastMessage ? (
                                                        chat.isFromMe ? `Tú: ${chat.lastMessage}` : chat.lastMessage
                                                    ) : 'Sin mensajes'}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {chat.unreadCount > 0 && (
                                                    <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                                                        {chat.unreadCount}
                                                    </Badge>
                                                )}
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                    <MoreHorizontal className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    {searchQuery ? 'No se encontraron conversaciones' : 'No tienes conversaciones'}
                                </p>
                                {!searchQuery && (
                                    <Button variant="outline" size="sm" className="mt-2" asChild>
                                        <Link href="/users">
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

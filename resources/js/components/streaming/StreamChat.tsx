import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
    Send, 
    Smile, 
    Heart, 
    MoreVertical,
    Users,
    MessageCircle
} from 'lucide-react';

interface ChatMessage {
    id: string;
    user: {
        id: number;
        name: string;
        avatar?: string;
        isStreamer?: boolean;
        isModerator?: boolean;
    };
    message: string;
    timestamp: string;
    type: 'message' | 'tip' | 'join' | 'leave';
    amount?: number;
}

interface StreamChatProps {
    streamId: string;
    isLive: boolean;
    viewerCount: number;
    onSendMessage?: (message: string) => void;
    onSendTip?: (amount: number) => void;
}

export default function StreamChat({ 
    streamId, 
    isLive, 
    viewerCount, 
    onSendMessage, 
    onSendTip 
}: StreamChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Mock data for demonstration
    useEffect(() => {
        const mockMessages: ChatMessage[] = [
            {
                id: '1',
                user: {
                    id: 1,
                    name: 'Streamer',
                    isStreamer: true
                },
                message: '¡Bienvenidos al stream!',
                timestamp: new Date().toISOString(),
                type: 'message'
            },
            {
                id: '2',
                user: {
                    id: 2,
                    name: 'Viewer1',
                    avatar: '/default-avatar.png'
                },
                message: '¡Hola! Excelente contenido',
                timestamp: new Date().toISOString(),
                type: 'message'
            },
            {
                id: '3',
                user: {
                    id: 3,
                    name: 'Viewer2',
                    isModerator: true
                },
                message: 'Tip enviado',
                timestamp: new Date().toISOString(),
                type: 'tip',
                amount: 5
            }
        ];
        setMessages(mockMessages);
        setIsConnected(true);
    }, [streamId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !onSendMessage) return;

        const message: ChatMessage = {
            id: Date.now().toString(),
            user: {
                id: 999,
                name: 'Tú',
                avatar: '/default-avatar.png'
            },
            message: newMessage,
            timestamp: new Date().toISOString(),
            type: 'message'
        };

        setMessages(prev => [...prev, message]);
        onSendMessage(newMessage);
        setNewMessage('');
    };

    const handleSendTip = (amount: number) => {
        if (!onSendTip) return;
        
        const tipMessage: ChatMessage = {
            id: Date.now().toString(),
            user: {
                id: 999,
                name: 'Tú',
                avatar: '/default-avatar.png'
            },
            message: `Tip de $${amount}`,
            timestamp: new Date().toISOString(),
            type: 'tip',
            amount
        };

        setMessages(prev => [...prev, tipMessage]);
        onSendTip(amount);
    };

    const getMessageIcon = (type: string) => {
        switch (type) {
            case 'tip':
                return <Heart className="h-3 w-3 text-red-500" />;
            case 'join':
                return <Users className="h-3 w-3 text-green-500" />;
            case 'leave':
                return <Users className="h-3 w-3 text-gray-500" />;
            default:
                return <MessageCircle className="h-3 w-3 text-blue-500" />;
        }
    };

    return (
        <Card className="h-full bg-white/5 border-white/10">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Chat en Vivo
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant={isLive ? "destructive" : "secondary"} className="text-xs">
                            {isLive ? 'EN VIVO' : 'OFFLINE'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                            {viewerCount} espectadores
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="p-0 flex flex-col h-full">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96">
                    {messages.map((message) => (
                        <div key={message.id} className="flex gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={message.user.avatar} />
                                <AvatarFallback className="text-xs">
                                    {message.user.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium text-white">
                                        {message.user.name}
                                    </span>
                                    {message.user.isStreamer && (
                                        <Badge variant="destructive" className="text-xs px-1 py-0">
                                            STREAMER
                                        </Badge>
                                    )}
                                    {message.user.isModerator && (
                                        <Badge variant="secondary" className="text-xs px-1 py-0">
                                            MOD
                                        </Badge>
                                    )}
                                    {getMessageIcon(message.type)}
                                    <span className="text-xs text-white/50">
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                                
                                <p className="text-sm text-white/80 break-words">
                                    {message.message}
                                </p>
                                
                                {message.type === 'tip' && message.amount && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <Heart className="h-3 w-3 text-red-500" />
                                        <span className="text-xs text-red-400 font-medium">
                                            ${message.amount} tip
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/10">
                    {isConnected ? (
                        <form onSubmit={handleSendMessage} className="space-y-3">
                            <div className="flex gap-2">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Escribe un mensaje..."
                                    className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/50"
                                    disabled={!isLive}
                                />
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={!newMessage.trim() || !isLive}
                                    className="bg-blue-500/80 hover:bg-blue-500 text-white"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            {/* Quick Tips */}
                            <div className="flex gap-2">
                                <span className="text-xs text-white/70">Tips rápidos:</span>
                                {[1, 5, 10, 25].map((amount) => (
                                    <Button
                                        key={amount}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSendTip(amount)}
                                        className="text-xs bg-white/10 hover:bg-white/20 text-white border-white/20"
                                    >
                                        ${amount}
                                    </Button>
                                ))}
                            </div>
                        </form>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-white/70 text-sm">Conectando al chat...</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

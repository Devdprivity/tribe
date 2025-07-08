import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MessageCircle, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  sentMessages: DirectMessage[];
  receivedMessages: DirectMessage[];
}

interface DirectMessage {
  id: number;
  message: string;
  from_user_id: number;
  to_user_id: number;
  read: boolean;
  created_at: string;
  fromUser: User;
  toUser: User;
}

interface Props {
  conversations: User[];
}

export default function MessagesIndex({ conversations }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConversations, setFilteredConversations] = useState(conversations);

  useEffect(() => {
    const filtered = conversations.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredConversations(filtered);
  }, [searchTerm, conversations]);

  const getLastMessage = (user: User) => {
    const allMessages = [
      ...user.sentMessages,
      ...user.receivedMessages
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return allMessages[0];
  };

  const getUnreadCount = (user: User) => {
    return user.sentMessages.filter(msg => !msg.read).length;
  };

  const formatMessage = (message: string) => {
    return message.length > 50 ? `${message.substring(0, 50)}...` : message;
  };

  return (
    <>
      <Head title="Mensajes Directos" />

      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Mensajes Directos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Chatea con otros desarrolladores de la comunidad
          </p>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar conversaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredConversations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay conversaciones
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm ? 'No se encontraron conversaciones con ese término.' : 'Aún no tienes conversaciones activas.'}
              </p>
              {!searchTerm && (
                <Button asChild>
                  <Link href="/users">
                    Explorar desarrolladores
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredConversations.map((user) => {
              const lastMessage = getLastMessage(user);
              const unreadCount = getUnreadCount(user);

              return (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <Link href={`/messages/${user.id}`} className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {user.name}
                          </h3>
                          {lastMessage && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDistanceToNow(new Date(lastMessage.created_at), {
                                addSuffix: true,
                                locale: es
                              })}
                            </span>
                          )}
                        </div>

                        {lastMessage && (
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {formatMessage(lastMessage.message)}
                            </p>
                            {unreadCount > 0 && (
                              <Badge variant="destructive" className="ml-2">
                                {unreadCount}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

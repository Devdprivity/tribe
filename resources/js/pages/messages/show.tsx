import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  open_to_work: boolean;
}

interface DirectMessage {
  id: number;
  message: string;
  from_user_id: number;
  to_user_id: number;
  read: boolean;
  read_at?: string;
  created_at: string;
  fromUser: User;
  toUser: User;
}

interface Props {
  otherUser: User;
  messages: DirectMessage[];
}

export default function MessagesShow({ otherUser, messages }: Props) {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = window.auth?.user?.id;

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);

    try {
      await router.post('/messages', {
        to_user_id: otherUser.id,
        message: newMessage.trim()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isOwnMessage = (message: DirectMessage) => {
    return message.from_user_id === currentUserId;
  };

  return (
    <>
      <Head title={`Chat con ${otherUser.name}`} />

      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/messages">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>

            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
              <AvatarFallback>
                {otherUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {otherUser.name}
              </h2>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {otherUser.email}
                </p>
                {otherUser.open_to_work && (
                  <Badge variant="secondary" className="text-xs">
                    Abierto a trabajo
                  </Badge>
                )}
              </div>
            </div>

            <Button variant="ghost" size="sm" asChild>
              <Link href={`/users/${otherUser.id}`}>
                <User className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No hay mensajes aún. ¡Inicia la conversación!
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwnMessage(message) ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {!isOwnMessage(message) && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                      <AvatarFallback className="text-xs">
                        {otherUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className={`rounded-lg px-4 py-2 ${
                    isOwnMessage(message)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  }`}>
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      isOwnMessage(message)
                        ? 'text-blue-100'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {formatDistanceToNow(new Date(message.created_at), {
                        addSuffix: true,
                        locale: es
                      })}
                      {isOwnMessage(message) && (
                        <span className="ml-2">
                          {message.read ? '✓✓' : '✓'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Escribe un mensaje..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              disabled={isSending}
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isSending}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

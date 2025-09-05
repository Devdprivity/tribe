import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    Users, 
    Crown, 
    Shield, 
    Mic, 
    MicOff, 
    Video, 
    VideoOff,
    MoreVertical,
    UserPlus
} from 'lucide-react';

interface Participant {
    id: number;
    name: string;
    avatar?: string;
    role: 'streamer' | 'moderator' | 'viewer';
    isSpeaking: boolean;
    isMuted: boolean;
    isVideoOn: boolean;
    joinTime: string;
    isOnline: boolean;
}

interface StreamParticipantsProps {
    streamId: string;
    onInviteUser?: (userId: number) => void;
    onMuteUser?: (userId: number) => void;
    onRemoveUser?: (userId: number) => void;
}

export default function StreamParticipants({ 
    streamId, 
    onInviteUser, 
    onMuteUser, 
    onRemoveUser 
}: StreamParticipantsProps) {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    // Mock data for demonstration
    useEffect(() => {
        const mockParticipants: Participant[] = [
            {
                id: 1,
                name: 'Streamer',
                role: 'streamer',
                isSpeaking: true,
                isMuted: false,
                isVideoOn: true,
                joinTime: new Date().toISOString(),
                isOnline: true
            },
            {
                id: 2,
                name: 'Moderator1',
                role: 'moderator',
                isSpeaking: false,
                isMuted: false,
                isVideoOn: true,
                joinTime: new Date().toISOString(),
                isOnline: true
            },
            {
                id: 3,
                name: 'Viewer1',
                role: 'viewer',
                isSpeaking: false,
                isMuted: true,
                isVideoOn: false,
                joinTime: new Date().toISOString(),
                isOnline: true
            },
            {
                id: 4,
                name: 'Viewer2',
                role: 'viewer',
                isSpeaking: false,
                isMuted: false,
                isVideoOn: true,
                joinTime: new Date().toISOString(),
                isOnline: false
            }
        ];
        setParticipants(mockParticipants);
        setIsConnected(true);
    }, [streamId]);

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'streamer':
                return <Crown className="h-3 w-3 text-yellow-500" />;
            case 'moderator':
                return <Shield className="h-3 w-3 text-blue-500" />;
            default:
                return <Users className="h-3 w-3 text-white/50" />;
        }
    };

    const getRoleBadge = (role: string) => {
        const variants = {
            streamer: 'destructive',
            moderator: 'secondary',
            viewer: 'outline'
        } as const;

        const labels = {
            streamer: 'STREAMER',
            moderator: 'MOD',
            viewer: 'VIEWER'
        };

        return (
            <Badge variant={variants[role as keyof typeof variants] || 'outline'} className="text-xs">
                {labels[role as keyof typeof labels] || role}
            </Badge>
        );
    };

    const handleMuteToggle = (userId: number) => {
        setParticipants(prev => 
            prev.map(p => 
                p.id === userId 
                    ? { ...p, isMuted: !p.isMuted }
                    : p
            )
        );
        onMuteUser?.(userId);
    };

    const handleVideoToggle = (userId: number) => {
        setParticipants(prev => 
            prev.map(p => 
                p.id === userId 
                    ? { ...p, isVideoOn: !p.isVideoOn }
                    : p
            )
        );
    };

    const onlineCount = participants.filter(p => p.isOnline).length;
    const speakingCount = participants.filter(p => p.isSpeaking).length;

    return (
        <Card className="h-full bg-white/5 border-white/10">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Participantes
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                            {onlineCount} en línea
                        </Badge>
                        {speakingCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                                {speakingCount} hablando
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="p-0">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {participants.map((participant) => (
                        <div
                            key={participant.id}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                participant.isSpeaking 
                                    ? 'bg-blue-500/20 border border-blue-500/30' 
                                    : 'bg-white/5 hover:bg-white/10'
                            }`}
                        >
                            {/* Avatar */}
                            <div className="relative">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={participant.avatar} />
                                    <AvatarFallback className="text-xs">
                                        {participant.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                
                                {/* Online Status */}
                                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${
                                    participant.isOnline ? 'bg-green-500' : 'bg-gray-500'
                                }`} />
                            </div>

                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-white truncate">
                                        {participant.name}
                                    </span>
                                    {getRoleIcon(participant.role)}
                                    {getRoleBadge(participant.role)}
                                </div>
                                
                                <div className="flex items-center gap-2 text-xs text-white/60">
                                    <span>
                                        {new Date(participant.joinTime).toLocaleTimeString()}
                                    </span>
                                    {participant.isSpeaking && (
                                        <span className="text-blue-400">Hablando</span>
                                    )}
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-1">
                                {/* Mute/Unmute */}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleMuteToggle(participant.id)}
                                    className={`h-8 w-8 p-0 ${
                                        participant.isMuted 
                                            ? 'text-red-400 hover:text-red-300' 
                                            : 'text-white/70 hover:text-white'
                                    }`}
                                >
                                    {participant.isMuted ? (
                                        <MicOff className="h-4 w-4" />
                                    ) : (
                                        <Mic className="h-4 w-4" />
                                    )}
                                </Button>

                                {/* Video On/Off */}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleVideoToggle(participant.id)}
                                    className={`h-8 w-8 p-0 ${
                                        participant.isVideoOn 
                                            ? 'text-green-400 hover:text-green-300' 
                                            : 'text-red-400 hover:text-red-300'
                                    }`}
                                >
                                    {participant.isVideoOn ? (
                                        <Video className="h-4 w-4" />
                                    ) : (
                                        <VideoOff className="h-4 w-4" />
                                    )}
                                </Button>

                                {/* More Options */}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-white/70 hover:text-white"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Invite Button */}
                <div className="p-3 border-t border-white/10">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onInviteUser?.(0)}
                        className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invitar Usuario
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

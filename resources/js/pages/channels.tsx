import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Hash,
    Users,
    Plus,
    Search,
    Lock,
    Code2,
    Briefcase,
    GraduationCap,
    MapPin,
    Star,
    TrendingUp
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import ChannelsSkeleton from '@/components/channels-skeleton';
import { useState, useEffect } from 'react';

interface User {
    id: number;
    username: string;
    full_name: string;
    avatar?: string;
    level: 'junior' | 'mid' | 'senior' | 'lead';
}

interface Channel {
    id: number;
    name: string;
    slug: string;
    description: string;
    type: 'technology' | 'level' | 'industry' | 'location';
    avatar?: string;
    members_count: number;
    is_private: boolean;
    is_member: boolean;
    is_admin: boolean;
    created_by: User;
    created_at: string;
    recent_activity?: string;
}

interface Props {
    channels: {
        data: Channel[];
        links: Record<string, unknown>;
        meta: Record<string, unknown>;
    };
    filters: {
        type?: string;
        search?: string;
    };
    my_channels?: Channel[];
    trending_channels?: Channel[];
}

const getChannelTypeIcon = (type: string) => {
    switch (type) {
        case 'technology': return Code2;
        case 'level': return GraduationCap;
        case 'industry': return Briefcase;
        case 'location': return MapPin;
        default: return Hash;
    }
};

const getChannelTypeColor = (type: string) => {
    switch (type) {
        case 'technology': return 'bg-blue-500';
        case 'level': return 'bg-green-500';
        case 'industry': return 'bg-purple-500';
        case 'location': return 'bg-orange-500';
        default: return 'bg-gray-500';
    }
};

const getChannelTypeLabel = (type: string) => {
    switch (type) {
        case 'technology': return 'Tecnología';
        case 'level': return 'Nivel';
        case 'industry': return 'Industria';
        case 'location': return 'Ubicación';
        default: return 'General';
    }
};

function ChannelCard({ channel }: { channel: Channel }) {
    const TypeIcon = getChannelTypeIcon(channel.type);

    return (
        <Card className="hover:shadow-md transition-shadow apple-liquid-card">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${getChannelTypeColor(channel.type)} ring-2 ring-white/20`}>
                            {channel.avatar ? (
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={channel.avatar} />
                                    <AvatarFallback className="text-white font-bold">
                                        <TypeIcon className="h-6 w-6 text-white" />
                                    </AvatarFallback>
                                </Avatar>
                            ) : (
                                <TypeIcon className="h-6 w-6 text-white" />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <Link href={`/channels/${channel.slug}`} className="font-semibold hover:underline text-white">
                                    {channel.name}
                                </Link>
                                {channel.is_private && (
                                    <Lock className="h-4 w-4 text-white/70" />
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-white/70">
                                <Badge variant="outline" className="text-xs bg-white/10 text-white border-white/20">
                                    {getChannelTypeLabel(channel.type)}
                                </Badge>
                                <span>•</span>
                                <Users className="h-3 w-3" />
                                <span>{channel.members_count.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {channel.is_member ? (
                            <Badge variant="secondary" className="bg-green-500/80 text-white border-green-400/50">
                                Miembro
                            </Badge>
                        ) : (
                            <Button size="sm" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 rounded-lg apple-liquid-button">
                                <Plus className="h-4 w-4 mr-1" />
                                Unirse
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <div className="space-y-3">
                    <CardDescription className="line-clamp-2 text-white/80">
                        {channel.description}
                    </CardDescription>

                    {channel.recent_activity && (
                        <div className="flex items-center gap-2 text-sm text-white/70">
                            <TrendingUp className="h-3 w-3" />
                            <span>{channel.recent_activity}</span>
                        </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-white/70">
                        <span>Por @{channel.created_by.username}</span>
                        <Link href={`/channels/${channel.slug}`} className="text-blue-400 hover:text-blue-300 hover:underline">
                            Ver canal →
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function ChannelSidebar({ myChannels, trendingChannels }: { myChannels?: Channel[]; trendingChannels?: Channel[] }) {
    return (
        <div className="space-y-6">
            {/* Mis Canales */}
            {myChannels && myChannels.length > 0 && (
                <Card className="apple-liquid-card border border-white/20 shadow-2xl">
                    <CardHeader className="border-b border-white/10 pb-4">
                        <CardTitle className="text-lg text-white font-bold">Mis Canales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                        {myChannels.slice(0, 5).map((channel) => (
                            <Link
                                key={channel.id}
                                href={`/channels/${channel.slug}`}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-200 bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 group"
                            >
                                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${getChannelTypeColor(channel.type)} ring-2 ring-white/20`}>
                                    <Hash className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate text-white group-hover:text-blue-300 transition-colors">{channel.name}</p>
                                    <p className="text-sm text-white/70">
                                        {channel.members_count} miembros
                                    </p>
                                </div>
                            </Link>
                        ))}
                        {myChannels.length > 5 && (
                            <Link href="/channels/my" className="text-sm text-blue-400 hover:text-blue-300 hover:underline block text-center p-2 rounded-lg hover:bg-white/5 transition-colors">
                                Ver todos ({myChannels.length}) →
                            </Link>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Canales Trending */}
            {trendingChannels && trendingChannels.length > 0 && (
                <Card className="apple-liquid-card border border-white/20 shadow-2xl">
                    <CardHeader className="border-b border-white/10 pb-4">
                        <CardTitle className="text-lg flex items-center gap-2 text-white font-bold">
                            <TrendingUp className="h-5 w-5 text-orange-400" />
                            Trending
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                        {trendingChannels.slice(0, 5).map((channel) => (
                            <Link
                                key={channel.id}
                                href={`/channels/${channel.slug}`}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-200 bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 group"
                            >
                                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${getChannelTypeColor(channel.type)} ring-2 ring-white/20`}>
                                    <Hash className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate text-white group-hover:text-blue-300 transition-colors">{channel.name}</p>
                                    <p className="text-sm text-white/70">
                                        {channel.members_count} miembros
                                    </p>
                                </div>
                                <Star className="h-4 w-4 text-orange-400" />
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default function Channels({ channels, filters, my_channels, trending_channels }: Props) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000); // Simulate API call
        return () => clearTimeout(timer);
    }, []);

    return (
        <AppLayout>
            <Head title="Canales" />

            {loading ? (
                <ChannelsSkeleton />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Contenido Principal */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white">Canales</h1>
                                <p className="text-white/70">
                                    Únete a comunidades de desarrolladores
                                </p>
                            </div>
                            <Button className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25 rounded-xl apple-liquid-button">
                                <Plus className="h-4 w-4 mr-2" />
                                Crear Canal
                            </Button>
                        </div>

                        {/* Búsqueda y Filtros */}
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-white/70" />
                                <Input
                                    placeholder="Buscar canales..."
                                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
                                    defaultValue={filters.search || ''}
                                />
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge 
                                    variant={!filters.type ? "default" : "outline"}
                                    className={!filters.type ? "bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25" : "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"}
                                >
                                    <Link href="/channels" className="text-white">Todos</Link>
                                </Badge>
                                <Badge 
                                    variant={filters.type === 'technology' ? "default" : "outline"}
                                    className={filters.type === 'technology' ? "bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25" : "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"}
                                >
                                    <Link href="/channels?type=technology" className="text-white">Tecnología</Link>
                                </Badge>
                                <Badge 
                                    variant={filters.type === 'level' ? "default" : "outline"}
                                    className={filters.type === 'level' ? "bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25" : "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"}
                                >
                                    <Link href="/channels?type=level" className="text-white">Nivel</Link>
                                </Badge>
                                <Badge 
                                    variant={filters.type === 'industry' ? "default" : "outline"}
                                    className={filters.type === 'industry' ? "bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25" : "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"}
                                >
                                    <Link href="/channels?type=industry" className="text-white">Industria</Link>
                                </Badge>
                                <Badge 
                                    variant={filters.type === 'location' ? "default" : "outline"}
                                    className={filters.type === 'location' ? "bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25" : "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"}
                                >
                                    <Link href="/channels?type=location" className="text-white">Ubicación</Link>
                                </Badge>
                            </div>
                        </div>

                        {/* Lista de Canales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {channels.data.length > 0 ? (
                                channels.data.map((channel) => (
                                    <ChannelCard key={channel.id} channel={channel} />
                                ))
                            ) : (
                                <div className="col-span-full">
                                    <Card className="apple-liquid-card">
                                        <CardContent className="pt-6 text-center">
                                            <Hash className="h-12 w-12 mx-auto mb-4 text-white/70" />
                                            <h3 className="text-lg font-semibold mb-2 text-white">No hay canales</h3>
                                            <p className="text-white/70 mb-4">
                                                No se encontraron canales con los filtros seleccionados.
                                            </p>
                                            <Button className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25 rounded-xl apple-liquid-button">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Crear el primero
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <ChannelSidebar
                            myChannels={my_channels}
                            trendingChannels={trending_channels}
                        />
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

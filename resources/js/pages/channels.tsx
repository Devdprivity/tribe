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
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${getChannelTypeColor(channel.type)}`}>
                            {channel.avatar ? (
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={channel.avatar} />
                                    <AvatarFallback>
                                        <TypeIcon className="h-6 w-6 text-white" />
                                    </AvatarFallback>
                                </Avatar>
                            ) : (
                                <TypeIcon className="h-6 w-6 text-white" />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <Link href={`/channels/${channel.slug}`} className="font-semibold hover:underline">
                                    {channel.name}
                                </Link>
                                {channel.is_private && (
                                    <Lock className="h-4 w-4 text-muted-foreground" />
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="outline" className="text-xs">
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
                            <Badge variant="secondary">Miembro</Badge>
                        ) : (
                            <Button size="sm" variant="outline">
                                <Plus className="h-4 w-4 mr-1" />
                                Unirse
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <div className="space-y-3">
                    <CardDescription className="line-clamp-2">
                        {channel.description}
                    </CardDescription>

                    {channel.recent_activity && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <TrendingUp className="h-3 w-3" />
                            <span>{channel.recent_activity}</span>
                        </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Por @{channel.created_by.username}</span>
                        <Link href={`/channels/${channel.slug}`} className="text-primary hover:underline">
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
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Mis Canales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {myChannels.slice(0, 5).map((channel) => (
                            <Link
                                key={channel.id}
                                href={`/channels/${channel.slug}`}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                            >
                                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${getChannelTypeColor(channel.type)}`}>
                                    <Hash className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{channel.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {channel.members_count} miembros
                                    </p>
                                </div>
                            </Link>
                        ))}
                        {myChannels.length > 5 && (
                            <Link href="/channels/my" className="text-sm text-primary hover:underline">
                                Ver todos ({myChannels.length}) →
                            </Link>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Canales Trending */}
            {trendingChannels && trendingChannels.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Trending
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {trendingChannels.slice(0, 5).map((channel) => (
                            <Link
                                key={channel.id}
                                href={`/channels/${channel.slug}`}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                            >
                                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${getChannelTypeColor(channel.type)}`}>
                                    <Hash className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{channel.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {channel.members_count} miembros
                                    </p>
                                </div>
                                <Star className="h-4 w-4 text-orange-500" />
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default function Channels({ channels, filters, my_channels, trending_channels }: Props) {
    return (
        <AppLayout>
            <Head title="Canales" />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Contenido Principal */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Canales</h1>
                            <p className="text-muted-foreground">
                                Únete a comunidades de desarrolladores
                            </p>
                        </div>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Crear Canal
                        </Button>
                    </div>

                    {/* Búsqueda y Filtros */}
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar canales..."
                                className="pl-10"
                                defaultValue={filters.search || ''}
                            />
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={!filters.type ? "default" : "outline"}>
                                <Link href="/channels">Todos</Link>
                            </Badge>
                            <Badge variant={filters.type === 'technology' ? "default" : "outline"}>
                                <Link href="/channels?type=technology">Tecnología</Link>
                            </Badge>
                            <Badge variant={filters.type === 'level' ? "default" : "outline"}>
                                <Link href="/channels?type=level">Nivel</Link>
                            </Badge>
                            <Badge variant={filters.type === 'industry' ? "default" : "outline"}>
                                <Link href="/channels?type=industry">Industria</Link>
                            </Badge>
                            <Badge variant={filters.type === 'location' ? "default" : "outline"}>
                                <Link href="/channels?type=location">Ubicación</Link>
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
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <Hash className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                        <h3 className="text-lg font-semibold mb-2">No hay canales</h3>
                                        <p className="text-muted-foreground mb-4">
                                            No se encontraron canales con los filtros seleccionados.
                                        </p>
                                        <Button>
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
        </AppLayout>
    );
}

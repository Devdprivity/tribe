import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
    Hash,
    Users,
    MessageCircle,
    Calendar,
    MapPin,
    Briefcase,
    Star,
    Plus,
    ArrowLeft,
    Settings,
    Crown,
    Shield,
    User,
    MoreHorizontal
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Channel {
    id: number;
    name: string;
    slug: string;
    description: string;
    type: string;
    avatar?: string;
    members_count: number;
    is_private: boolean;
    created_at: string;
    creator: {
        id: number;
        name: string;
        username: string;
        avatar?: string;
    };
    members: Array<{
        id: number;
        name: string;
        username: string;
        avatar?: string;
        pivot: {
            role: string;
        };
    }>;
}

interface Post {
    id: number;
    title: string;
    content: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        username: string;
        avatar?: string;
    };
    comments_count_calc: number;
}

interface Props {
    channel: Channel;
    posts: {
        data: Post[];
        links: any[];
        meta: any;
    };
    isMember: boolean;
    memberRole: string | null;
    canModerate: boolean;
}

const getChannelTypeIcon = (type: string) => {
    switch (type) {
        case 'technology':
            return <Hash className="h-5 w-5" />;
        case 'level':
            return <Star className="h-5 w-5" />;
        case 'industry':
            return <Briefcase className="h-5 w-5" />;
        case 'location':
            return <MapPin className="h-5 w-5" />;
        default:
            return <Hash className="h-5 w-5" />;
    }
};

const getChannelTypeColor = (type: string) => {
    switch (type) {
        case 'technology':
            return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
        case 'level':
            return 'bg-green-500/20 text-green-400 border-green-400/30';
        case 'industry':
            return 'bg-purple-500/20 text-purple-400 border-purple-400/30';
        case 'location':
            return 'bg-orange-500/20 text-orange-400 border-orange-400/30';
        default:
            return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
};

const getRoleIcon = (role: string) => {
    switch (role) {
        case 'admin':
            return <Crown className="h-4 w-4 text-yellow-400" />;
        case 'moderator':
            return <Shield className="h-4 w-4 text-blue-400" />;
        default:
            return <User className="h-4 w-4 text-gray-400" />;
    }
};

export default function ChannelShow({ channel, posts, isMember, memberRole, canModerate }: Props) {
    const page = usePage();
    const props = page.props as { auth?: { user: any } };
    const user = props.auth?.user;

    return (
        <AppLayout title={`#${channel.name}`} description={channel.description}>
            <Head title={`#${channel.name} - Canal`} />

            <div className="space-y-6">
                {/* Header del Canal */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/channels">
                            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                        </Link>
                        
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getChannelTypeColor(channel.type)} border`}>
                                {getChannelTypeIcon(channel.type)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">#{channel.name}</h1>
                                <p className="text-white/70">{channel.description}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {isMember ? (
                            <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30">
                                <Users className="h-4 w-4 mr-2" />
                                Miembro
                            </Button>
                        ) : (
                            <Button className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25">
                                <Plus className="h-4 w-4 mr-2" />
                                Unirse
                            </Button>
                        )}
                        
                        {canModerate && (
                            <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30">
                                <Settings className="h-4 w-4 mr-2" />
                                Administrar
                            </Button>
                        )}
                    </div>
                </div>

                {/* Estadísticas del Canal */}
                <Card className="apple-liquid-card border border-white/20 shadow-2xl">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{channel.members_count}</div>
                                <div className="text-sm text-white/70">Miembros</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{posts.data.length}</div>
                                <div className="text-sm text-white/70">Posts</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">
                                    {posts.data.reduce((acc, post) => acc + post.comments_count_calc, 0)}
                                </div>
                                <div className="text-sm text-white/70">Comentarios</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">
                                    {new Date(channel.created_at).toLocaleDateString()}
                                </div>
                                <div className="text-sm text-white/70">Creado</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contenido Principal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Posts del Canal */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white">Posts del Canal</h2>
                            {isMember && (
                                <Button className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Crear Post
                                </Button>
                            )}
                        </div>

                        {posts.data.length > 0 ? (
                            <div className="space-y-4">
                                {posts.data.map((post) => (
                                    <Card key={post.id} className="apple-liquid-card border border-white/20 shadow-2xl">
                                        <CardContent className="p-6">
                                            <div className="flex items-start gap-4">
                                                <Avatar className="h-10 w-10 ring-2 ring-white/20">
                                                    <AvatarImage src={post.user.avatar} />
                                                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                                                        {post.user.name?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-medium text-white">{post.user.name}</span>
                                                        <span className="text-sm text-white/70">@{post.user.username}</span>
                                                        <span className="text-sm text-white/50">
                                                            {new Date(post.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-white mb-2">{post.title}</h3>
                                                    <p className="text-white/80 mb-4 line-clamp-3">{post.content}</p>
                                                    <div className="flex items-center gap-4 text-sm text-white/70">
                                                        <div className="flex items-center gap-1">
                                                            <MessageCircle className="h-4 w-4" />
                                                            {post.comments_count_calc} comentarios
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="apple-liquid-card border border-white/20 shadow-2xl">
                                <CardContent className="p-8 text-center">
                                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-white/50" />
                                    <h3 className="text-lg font-semibold mb-2 text-white">No hay posts aún</h3>
                                    <p className="text-white/70 mb-4">
                                        Sé el primero en compartir algo en este canal.
                                    </p>
                                    {isMember && (
                                        <Button className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Crear el primer post
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar del Canal */}
                    <div className="space-y-6">
                        {/* Información del Canal */}
                        <Card className="apple-liquid-card border border-white/20 shadow-2xl">
                            <CardHeader className="border-b border-white/10 pb-4">
                                <CardTitle className="text-lg text-white font-bold">Información</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div>
                                    <div className="text-sm text-white/70 mb-1">Tipo</div>
                                    <Badge className={getChannelTypeColor(channel.type)}>
                                        {channel.type.charAt(0).toUpperCase() + channel.type.slice(1)}
                                    </Badge>
                                </div>
                                <div>
                                    <div className="text-sm text-white/70 mb-1">Creado por</div>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6 ring-1 ring-white/20">
                                            <AvatarImage src={channel.creator.avatar} />
                                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
                                                {channel.creator.name?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-white">{channel.creator.name}</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-white/70 mb-1">Creado</div>
                                    <div className="text-white">
                                        {new Date(channel.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                {channel.is_private && (
                                    <div>
                                        <div className="text-sm text-white/70 mb-1">Visibilidad</div>
                                        <Badge className="bg-red-500/20 text-red-400 border-red-400/30">
                                            Privado
                                        </Badge>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Miembros Recientes */}
                        <Card className="apple-liquid-card border border-white/20 shadow-2xl">
                            <CardHeader className="border-b border-white/10 pb-4">
                                <CardTitle className="text-lg text-white font-bold">Miembros Recientes</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                {channel.members.slice(0, 5).map((member) => (
                                    <div key={member.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8 ring-1 ring-white/20">
                                                <AvatarImage src={member.avatar} />
                                                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-sm">
                                                    {member.name?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="text-sm font-medium text-white">{member.name}</div>
                                                <div className="text-xs text-white/70">@{member.username}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {getRoleIcon(member.pivot.role)}
                                        </div>
                                    </div>
                                ))}
                                {channel.members.length > 5 && (
                                    <Link href={`/channels/${channel.slug}/members`} className="text-sm text-blue-400 hover:text-blue-300 hover:underline block text-center p-2 rounded-lg hover:bg-white/5 transition-colors">
                                        Ver todos ({channel.members.length}) →
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

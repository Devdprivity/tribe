import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Users as UsersIcon,
    MapPin,
    Github,
    Linkedin,
    ExternalLink,
    UserPlus,
    UserCheck,
    Search,
    Filter,
    Star,
    Calendar,
    Briefcase,
    TrendingUp
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import UsersSkeleton from '@/components/users-skeleton';
import { useState, useEffect } from 'react';

interface User {
    id: number;
    username: string;
    full_name: string;
    bio?: string;
    avatar?: string;
    level: 'junior' | 'mid' | 'senior' | 'lead';
    years_experience: number;
    location?: string;
    website?: string;
    github_username?: string;
    linkedin_profile?: string;
    is_open_to_work: boolean;
    followers_count: number;
    following_count: number;
    posts_count: number;
    created_at: string;
    is_following?: boolean;
    is_follower?: boolean;
}

interface Props {
    users: {
        data: User[];
        links: Record<string, unknown>;
        meta: Record<string, unknown>;
    };
    filters: {
        search?: string;
        level?: string;
        location?: string;
        open_to_work?: boolean;
    };
    featured_developers?: User[];
    new_members?: User[];
}

const getLevelColor = (level: string) => {
    switch (level) {
        case 'junior': return 'bg-green-500';
        case 'mid': return 'bg-blue-500';
        case 'senior': return 'bg-purple-500';
        case 'lead': return 'bg-orange-500';
        default: return 'bg-gray-500';
    }
};

const getLevelLabel = (level: string) => {
    switch (level) {
        case 'junior': return 'Junior';
        case 'mid': return 'Mid-level';
        case 'senior': return 'Senior';
        case 'lead': return 'Lead';
        default: return level;
    }
};

const formatExperience = (years: number) => {
    if (years === 0) return 'Menos de 1 año';
    if (years === 1) return '1 año';
    return `${years} años`;
};

const formatJoinDate = (date: string) => {
    const joinDate = new Date(date);
    const now = new Date();
    const diffInMs = now.getTime() - joinDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays < 30) return 'Nuevo miembro';
    if (diffInDays < 365) return `Se unió hace ${Math.floor(diffInDays / 30)} meses`;
    return `Se unió hace ${Math.floor(diffInDays / 365)} años`;
};

function UserCard({ 
    user, 
    isFollowing, 
    followersCount, 
    isLoading, 
    onFollow 
}: { 
    user: User; 
    isFollowing: boolean; 
    followersCount: number; 
    isLoading: boolean; 
    onFollow: (userId: number, currentFollowState: boolean) => void; 
}) {
    return (
        <Card className="hover:shadow-md transition-shadow apple-liquid-card">
            <CardHeader className="pb-4">
                <div className="flex items-start gap-6">
                    <Link href={`/users/${user.id}`}>
                        <Avatar className="h-20 w-20 ring-2 ring-white/20">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className={`${getLevelColor(user.level)} text-white font-bold text-xl`}>
                                {user.full_name?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <Link href={`/users/${user.id}`} className="font-semibold text-xl hover:underline text-white">
                                        {user.full_name}
                                    </Link>
                                    <Badge variant="outline" className="text-sm bg-white/10 text-white border-white/20 px-3 py-1">
                                        {getLevelLabel(user.level)}
                                    </Badge>
                                    {user.is_open_to_work && (
                                        <Badge variant="secondary" className="text-sm bg-green-500/80 text-white border-green-400/50 px-3 py-1">
                                            <Briefcase className="h-3 w-3 mr-1" />
                                            Disponible
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-white/70">
                                    <span>@{user.username}</span>
                                    <span>•</span>
                                    <span>{formatExperience(user.years_experience)} exp.</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant={isFollowing ? "outline" : "default"}
                                    size="sm" 
                                    onClick={() => onFollow(user.id, isFollowing)}
                                    disabled={isLoading}
                                    className={isFollowing 
                                        ? "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 rounded-xl apple-liquid-button px-4 py-2" 
                                        : "bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25 rounded-xl apple-liquid-button px-4 py-2"
                                    }
                                >
                                    {isLoading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : isFollowing ? (
                                        <>
                                            <UserCheck className="h-4 w-4 mr-2" />
                                            Siguiendo
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Seguir
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <div className="space-y-5">
                    {/* Bio */}
                    {user.bio && (
                        <CardDescription className="line-clamp-2 text-white/80 text-base leading-relaxed">
                            {user.bio}
                        </CardDescription>
                    )}

                    {/* Ubicación */}
                    {user.location && (
                        <div className="flex items-center gap-3 text-sm text-white/70">
                            <MapPin className="h-4 w-4" />
                            <span>{user.location}</span>
                        </div>
                    )}

                    {/* Estadísticas */}
                    <div className="grid grid-cols-3 gap-6 text-center py-4">
                        <div>
                            <div className="font-bold text-xl text-white">{user.posts_count}</div>
                            <div className="text-sm text-white/70">Posts</div>
                        </div>
                        <div>
                            <div className="font-bold text-xl text-white">{followersCount}</div>
                            <div className="text-sm text-white/70">Seguidores</div>
                        </div>
                        <div>
                            <div className="font-bold text-xl text-white">{user.following_count}</div>
                            <div className="text-sm text-white/70">Siguiendo</div>
                        </div>
                    </div>

                    {/* Enlaces sociales */}
                    <div className="flex items-center gap-3">
                        {user.github_username && (
                            <Button variant="outline" size="sm" asChild className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 rounded-lg apple-liquid-button px-4 py-2">
                                <a href={`https://github.com/${user.github_username}`} target="_blank" rel="noopener">
                                    <Github className="h-4 w-4 mr-2" />
                                    GitHub
                                </a>
                            </Button>
                        )}
                        {user.linkedin_profile && (
                            <Button variant="outline" size="sm" asChild className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 rounded-lg apple-liquid-button px-4 py-2">
                                <a href={user.linkedin_profile} target="_blank" rel="noopener">
                                    <Linkedin className="h-4 w-4 mr-2" />
                                    LinkedIn
                                </a>
                            </Button>
                        )}
                        {user.website && (
                            <Button variant="outline" size="sm" asChild className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 rounded-lg apple-liquid-button px-4 py-2">
                                <a href={user.website} target="_blank" rel="noopener">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Sitio Web
                                </a>
                            </Button>
                        )}
                    </div>

                    {/* Fecha de registro */}
                    <div className="text-sm text-white/70 border-t border-white/20 pt-4">
                        <Calendar className="h-4 w-4 inline mr-2" />
                        {formatJoinDate(user.created_at)}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function UserSidebar({ 
    featuredDevelopers, 
    newMembers, 
    userFollowStates, 
    userFollowersCounts, 
    followLoadingStates, 
    onFollow 
}: { 
    featuredDevelopers?: User[]; 
    newMembers?: User[]; 
    userFollowStates: Record<number, boolean>; 
    userFollowersCounts: Record<number, number>; 
    followLoadingStates: Record<number, boolean>; 
    onFollow: (userId: number, currentFollowState: boolean) => void; 
}) {
    return (
        <div className="space-y-6">
            {/* Desarrolladores Destacados */}
            {featuredDevelopers && featuredDevelopers.length > 0 && (
                <Card className="apple-liquid-card border border-white/20 shadow-2xl">
                    <CardHeader className="border-b border-white/10 pb-4">
                        <CardTitle className="text-lg flex items-center gap-2 text-white font-bold">
                            <Star className="h-5 w-5 text-yellow-400" />
                            Destacados
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        {featuredDevelopers.slice(0, 5).map((user) => (
                            <div key={user.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-200 group">
                                <div className="flex items-center gap-4">
                                    <Link href={`/users/${user.id}`}>
                                        <Avatar className="h-14 w-14 ring-2 ring-white/20 group-hover:ring-white/30 transition-all duration-200">
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback className={`${getLevelColor(user.level)} text-white font-bold text-lg`}>
                                                {user.full_name?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/users/${user.id}`} className="font-semibold hover:underline text-white hover:text-blue-300 transition-colors block truncate text-base">
                                            {user.full_name}
                                        </Link>
                                        <div className="flex items-center gap-3 text-sm text-white/70 mt-2">
                                            <Badge variant="outline" className="text-xs bg-white/10 text-white border-white/20 px-3 py-1 backdrop-blur-sm">
                                                {getLevelLabel(user.level)}
                                            </Badge>
                                            <span>•</span>
                                            <span className="truncate">{userFollowersCounts[user.id] || user.followers_count} seguidores</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Nuevos Miembros */}
            {newMembers && newMembers.length > 0 && (
                <Card className="apple-liquid-card border border-white/20 shadow-2xl">
                    <CardHeader className="border-b border-white/10 pb-4">
                        <CardTitle className="text-lg flex items-center gap-2 text-white font-bold">
                            <TrendingUp className="h-5 w-5 text-green-400" />
                            Nuevos Miembros
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        {newMembers.slice(0, 5).map((user) => (
                            <div key={user.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-200 group">
                                <div className="flex items-center gap-4">
                                    <Link href={`/users/${user.id}`}>
                                        <Avatar className="h-14 w-14 ring-2 ring-white/20 group-hover:ring-white/30 transition-all duration-200">
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback className={`${getLevelColor(user.level)} text-white font-bold text-lg`}>
                                                {user.full_name?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/users/${user.id}`} className="font-semibold hover:underline text-white hover:text-blue-300 transition-colors block truncate text-base">
                                            {user.full_name}
                                        </Link>
                                        <div className="flex items-center gap-3 text-sm text-white/70 mt-2">
                                            <Badge variant="outline" className="text-xs bg-white/10 text-white border-white/20 px-3 py-1 backdrop-blur-sm">
                                                {getLevelLabel(user.level)}
                                            </Badge>
                                            <span>•</span>
                                            <span className="truncate">@{user.username}</span>
                                        </div>
                                    </div>
                                    <Button 
                                        size="sm" 
                                        variant={userFollowStates[user.id] ? "outline" : "default"}
                                        onClick={() => onFollow(user.id, userFollowStates[user.id] || false)}
                                        disabled={followLoadingStates[user.id]}
                                        className={`${
                                            userFollowStates[user.id] 
                                                ? "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30" 
                                                : "bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25"
                                        } rounded-lg apple-liquid-button px-4 py-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0`}
                                    >
                                        {followLoadingStates[user.id] ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        ) : userFollowStates[user.id] ? (
                                            <UserCheck className="h-4 w-4" />
                                        ) : (
                                            <UserPlus className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Filtros rápidos */}
            <Card className="apple-liquid-card border border-white/20 shadow-2xl">
                <CardHeader className="border-b border-white/10 pb-4">
                    <CardTitle className="text-lg text-white font-bold">Filtros Rápidos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <Link href="/users?open_to_work=true" className="block bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-all duration-200 text-white hover:text-white border border-white/10 hover:border-white/20 hover:shadow-lg group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-all duration-200 flex-shrink-0">
                                <Briefcase className="h-5 w-5 text-green-400" />
                            </div>
                            <span className="text-sm font-medium">Disponibles para trabajar</span>
                        </div>
                    </Link>
                    <Link href="/users?level=junior" className="block bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-all duration-200 text-white hover:text-white border border-white/10 hover:border-white/20 hover:shadow-lg group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-all duration-200 flex-shrink-0">
                                <UsersIcon className="h-5 w-5 text-blue-400" />
                            </div>
                            <span className="text-sm font-medium">Desarrolladores junior</span>
                        </div>
                    </Link>
                    <Link href="/users?level=senior" className="block bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-all duration-200 text-white hover:text-white border border-white/10 hover:border-white/20 hover:shadow-lg group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-all duration-200 flex-shrink-0">
                                <UsersIcon className="h-5 w-5 text-purple-400" />
                            </div>
                            <span className="text-sm font-medium">Desarrolladores senior</span>
                        </div>
                    </Link>
                    <Link href="/users?has_github=true" className="block bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-all duration-200 text-white hover:text-white border border-white/10 hover:border-white/20 hover:shadow-lg group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gray-500/20 rounded-lg group-hover:bg-gray-500/30 transition-all duration-200 flex-shrink-0">
                                <Github className="h-5 w-5 text-gray-400" />
                            </div>
                            <span className="text-sm font-medium">Con perfil de GitHub</span>
                        </div>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}

export default function Users({ users, filters, featured_developers, new_members }: Props) {
    const [loading, setLoading] = useState(true);
    
    // Estado local para el seguimiento de usuarios
    const [userFollowStates, setUserFollowStates] = useState<Record<number, boolean>>({});
    const [userFollowersCounts, setUserFollowersCounts] = useState<Record<number, number>>({});
    const [followLoadingStates, setFollowLoadingStates] = useState<Record<number, boolean>>({});

    // Función para manejar seguir/dejar de seguir usuarios
    const handleFollow = async (userId: number, currentFollowState: boolean) => {
        // Evitar múltiples clicks
        if (followLoadingStates[userId]) return;
        
        // Actualizar estado de carga
        setFollowLoadingStates(prev => ({ ...prev, [userId]: true }));
        
        try {
            const response = await fetch(`/users/${userId}/${currentFollowState ? 'unfollow' : 'follow'}`, {
                method: currentFollowState ? 'DELETE' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                // Actualizar estado de seguimiento
                setUserFollowStates(prev => ({ ...prev, [userId]: !currentFollowState }));
                
                // Actualizar contador de seguidores
                setUserFollowersCounts(prev => ({
                    ...prev,
                    [userId]: prev[userId] + (currentFollowState ? -1 : 1)
                }));
            }
        } catch (error) {
            console.error('Error following user:', error);
        } finally {
            // Remover estado de carga
            setFollowLoadingStates(prev => ({ ...prev, [userId]: false }));
        }
    };

    // Inicializar estados locales con datos del servidor
    useEffect(() => {
        const initialFollowStates: Record<number, boolean> = {};
        const initialFollowersCounts: Record<number, number> = {};
        
        // Usuarios principales
        users.data.forEach(user => {
            initialFollowStates[user.id] = user.is_following || false;
            initialFollowersCounts[user.id] = user.followers_count;
        });
        
        // Desarrolladores destacados
        featured_developers?.forEach(user => {
            initialFollowStates[user.id] = user.is_following || false;
            initialFollowersCounts[user.id] = user.followers_count;
        });
        
        // Nuevos miembros
        new_members?.forEach(user => {
            initialFollowStates[user.id] = user.is_following || false;
            initialFollowersCounts[user.id] = user.followers_count;
        });
        
        setUserFollowStates(initialFollowStates);
        setUserFollowersCounts(initialFollowersCounts);
    }, [users.data, featured_developers, new_members]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000); // Simulate API call
        return () => clearTimeout(timer);
    }, []);

    return (
        <AppLayout>
            <Head title="Desarrolladores" />

            {loading ? (
                <UsersSkeleton />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Contenido Principal */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white">Desarrolladores</h1>
                                <p className="text-white/70">
                                    Conecta con la comunidad de desarrolladores
                                </p>
                            </div>
                            <Button className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25 rounded-xl apple-liquid-button">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Invitar Amigos
                            </Button>
                        </div>

                        {/* Búsqueda y Filtros */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="relative md:col-span-2">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-white/70" />
                                    <Input
                                        placeholder="Buscar desarrolladores..."
                                        className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
                                        defaultValue={filters.search || ''}
                                    />
                                </div>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-white/70" />
                                    <Input
                                        placeholder="Ubicación"
                                        className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
                                        defaultValue={filters.location || ''}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="cursor-pointer bg-white/10 text-white border-white/20 hover:bg-white/20">
                                    <Filter className="h-3 w-3 mr-1" />
                                    Todos los filtros
                                </Badge>
                                <Badge 
                                    variant={filters.level === 'junior' ? "default" : "outline"}
                                    className={filters.level === 'junior' ? "bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25" : "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"}
                                >
                                    <Link href="/users?level=junior" className="text-white">Junior</Link>
                                </Badge>
                                <Badge 
                                    variant={filters.level === 'mid' ? "default" : "outline"}
                                    className={filters.level === 'mid' ? "bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25" : "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"}
                                >
                                    <Link href="/users?level=mid" className="text-white">Mid-level</Link>
                                </Badge>
                                <Badge 
                                    variant={filters.level === 'senior' ? "default" : "outline"}
                                    className={filters.level === 'senior' ? "bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25" : "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"}
                                >
                                    <Link href="/users?level=senior" className="text-white">Senior</Link>
                                </Badge>
                                <Badge 
                                    variant={filters.open_to_work ? "default" : "outline"}
                                    className={`${filters.open_to_work ? "bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25" : "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"} min-w-[120px] px-4`}
                                >
                                    <Link href="/users?open_to_work=true" className="text-white flex items-center justify-center w-full">
                                        <Briefcase className="h-3 w-3 mr-2" />
                                        Disponible
                                    </Link>
                                </Badge>
                            </div>
                        </div>

                        {/* Lista de Desarrolladores */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {users.data.length > 0 ? (
                                users.data.map((user) => (
                                    <UserCard 
                                        key={user.id} 
                                        user={user} 
                                        isFollowing={userFollowStates[user.id] || false}
                                        followersCount={userFollowersCounts[user.id] || user.followers_count}
                                        isLoading={followLoadingStates[user.id] || false}
                                        onFollow={handleFollow}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full">
                                    <Card className="apple-liquid-card">
                                        <CardContent className="pt-6 text-center">
                                            <UsersIcon className="h-12 w-12 mx-auto mb-4 text-white/70" />
                                            <h3 className="text-lg font-semibold mb-2 text-white">No se encontraron desarrolladores</h3>
                                            <p className="text-white/70 mb-4">
                                                Prueba ajustando los filtros de búsqueda.
                                            </p>
                                            <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 rounded-xl apple-liquid-button">
                                                Limpiar filtros
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <UserSidebar
                            featuredDevelopers={featured_developers}
                            newMembers={new_members}
                            userFollowStates={userFollowStates}
                            userFollowersCounts={userFollowersCounts}
                            followLoadingStates={followLoadingStates}
                            onFollow={handleFollow}
                        />
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

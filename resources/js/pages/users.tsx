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

function UserCard({ user }: { user: User }) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                    <Link href={`/users/${user.id}`}>
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className={getLevelColor(user.level)}>
                                {user.full_name?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Link href={`/users/${user.id}`} className="font-semibold text-lg hover:underline">
                                        {user.full_name}
                                    </Link>
                                    <Badge variant="outline" className="text-xs">
                                        {getLevelLabel(user.level)}
                                    </Badge>
                                    {user.is_open_to_work && (
                                        <Badge variant="secondary" className="text-xs">
                                            <Briefcase className="h-3 w-3 mr-1" />
                                            Disponible
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>@{user.username}</span>
                                    <span>•</span>
                                    <span>{formatExperience(user.years_experience)} exp.</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {user.is_following ? (
                                    <Button variant="outline" size="sm">
                                        <UserCheck className="h-4 w-4 mr-1" />
                                        Siguiendo
                                    </Button>
                                ) : (
                                    <Button size="sm">
                                        <UserPlus className="h-4 w-4 mr-1" />
                                        Seguir
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <div className="space-y-4">
                    {/* Bio */}
                    {user.bio && (
                        <CardDescription className="line-clamp-2">
                            {user.bio}
                        </CardDescription>
                    )}

                    {/* Ubicación */}
                    {user.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{user.location}</span>
                        </div>
                    )}

                    {/* Estadísticas */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="font-semibold">{user.posts_count}</div>
                            <div className="text-xs text-muted-foreground">Posts</div>
                        </div>
                        <div>
                            <div className="font-semibold">{user.followers_count}</div>
                            <div className="text-xs text-muted-foreground">Seguidores</div>
                        </div>
                        <div>
                            <div className="font-semibold">{user.following_count}</div>
                            <div className="text-xs text-muted-foreground">Siguiendo</div>
                        </div>
                    </div>

                    {/* Enlaces sociales */}
                    <div className="flex items-center gap-2">
                        {user.github_username && (
                            <Button variant="outline" size="sm" asChild>
                                <a href={`https://github.com/${user.github_username}`} target="_blank" rel="noopener">
                                    <Github className="h-4 w-4" />
                                </a>
                            </Button>
                        )}
                        {user.linkedin_profile && (
                            <Button variant="outline" size="sm" asChild>
                                <a href={user.linkedin_profile} target="_blank" rel="noopener">
                                    <Linkedin className="h-4 w-4" />
                                </a>
                            </Button>
                        )}
                        {user.website && (
                            <Button variant="outline" size="sm" asChild>
                                <a href={user.website} target="_blank" rel="noopener">
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </Button>
                        )}
                    </div>

                    {/* Fecha de registro */}
                    <div className="text-xs text-muted-foreground border-t pt-3">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {formatJoinDate(user.created_at)}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function UserSidebar({ featuredDevelopers, newMembers }: { featuredDevelopers?: User[]; newMembers?: User[] }) {
    return (
        <div className="space-y-6">
            {/* Desarrolladores Destacados */}
            {featuredDevelopers && featuredDevelopers.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Star className="h-5 w-5" />
                            Destacados
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {featuredDevelopers.slice(0, 5).map((user) => (
                            <div key={user.id} className="flex items-center gap-3">
                                <Link href={`/users/${user.id}`}>
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback className={getLevelColor(user.level)}>
                                            {user.full_name?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div className="flex-1">
                                    <Link href={`/users/${user.id}`} className="font-medium hover:underline">
                                        {user.full_name}
                                    </Link>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Badge variant="outline" className="text-xs">
                                            {getLevelLabel(user.level)}
                                        </Badge>
                                        <span>•</span>
                                        <span>{user.followers_count} seguidores</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Nuevos Miembros */}
            {newMembers && newMembers.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Nuevos Miembros
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {newMembers.slice(0, 5).map((user) => (
                            <div key={user.id} className="flex items-center gap-3">
                                <Link href={`/users/${user.id}`}>
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback className={getLevelColor(user.level)}>
                                            {user.full_name?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div className="flex-1">
                                    <Link href={`/users/${user.id}`} className="font-medium hover:underline">
                                        {user.full_name}
                                    </Link>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Badge variant="outline" className="text-xs">
                                            {getLevelLabel(user.level)}
                                        </Badge>
                                        <span>•</span>
                                        <span>@{user.username}</span>
                                    </div>
                                </div>
                                <Button size="sm" variant="outline">
                                    <UserPlus className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Filtros rápidos */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filtros Rápidos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Link href="/users?open_to_work=true" className="block p-2 rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            <span className="text-sm">Disponibles para trabajar</span>
                        </div>
                    </Link>
                    <Link href="/users?level=junior" className="block p-2 rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center gap-2">
                            <UsersIcon className="h-4 w-4" />
                            <span className="text-sm">Desarrolladores junior</span>
                        </div>
                    </Link>
                    <Link href="/users?level=senior" className="block p-2 rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center gap-2">
                            <UsersIcon className="h-4 w-4" />
                            <span className="text-sm">Desarrolladores senior</span>
                        </div>
                    </Link>
                    <Link href="/users?has_github=true" className="block p-2 rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center gap-2">
                            <Github className="h-4 w-4" />
                            <span className="text-sm">Con perfil de GitHub</span>
                        </div>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}

export default function Users({ users, filters, featured_developers, new_members }: Props) {
    return (
        <AppLayout>
            <Head title="Desarrolladores" />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Contenido Principal */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Desarrolladores</h1>
                            <p className="text-muted-foreground">
                                Conecta con la comunidad de desarrolladores
                            </p>
                        </div>
                        <Button>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Invitar Amigos
                        </Button>
                    </div>

                    {/* Búsqueda y Filtros */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative md:col-span-2">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar desarrolladores..."
                                    className="pl-10"
                                    defaultValue={filters.search || ''}
                                />
                            </div>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Ubicación"
                                    className="pl-10"
                                    defaultValue={filters.location || ''}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="cursor-pointer">
                                <Filter className="h-3 w-3 mr-1" />
                                Todos los filtros
                            </Badge>
                            <Badge variant={filters.level === 'junior' ? "default" : "outline"}>
                                <Link href="/users?level=junior">Junior</Link>
                            </Badge>
                            <Badge variant={filters.level === 'mid' ? "default" : "outline"}>
                                <Link href="/users?level=mid">Mid-level</Link>
                            </Badge>
                            <Badge variant={filters.level === 'senior' ? "default" : "outline"}>
                                <Link href="/users?level=senior">Senior</Link>
                            </Badge>
                            <Badge variant={filters.open_to_work ? "default" : "outline"}>
                                <Link href="/users?open_to_work=true">
                                    <Briefcase className="h-3 w-3 mr-1" />
                                    Disponible
                                </Link>
                            </Badge>
                        </div>
                    </div>

                    {/* Lista de Desarrolladores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {users.data.length > 0 ? (
                            users.data.map((user) => (
                                <UserCard key={user.id} user={user} />
                            ))
                        ) : (
                            <div className="col-span-full">
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <UsersIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                        <h3 className="text-lg font-semibold mb-2">No se encontraron desarrolladores</h3>
                                        <p className="text-muted-foreground mb-4">
                                            Prueba ajustando los filtros de búsqueda.
                                        </p>
                                        <Button variant="outline">
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
                    />
                </div>
            </div>
        </AppLayout>
    );
}

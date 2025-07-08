import { usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import {
    User,
    MapPin,
    Github,
    Linkedin,
    ExternalLink,
    Settings,
    Briefcase,
    Calendar,
    Plus,
    Search,
    Bookmark
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

export function UserProfilePanel() {
    const props = usePage().props as { auth?: { user: User } };
    const user = props.auth?.user;

    if (!user) return null;

    return (
        <div className="p-4 space-y-4">
            {/* Perfil del Usuario */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className={getLevelColor(user.level)}>
                                {user.full_name?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg">{user.full_name}</h3>
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                            <div className="flex items-center gap-2 mt-1">
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
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/settings/profile">
                                <Settings className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Bio */}
                    {user.bio && (
                        <p className="text-sm text-muted-foreground">{user.bio}</p>
                    )}

                    {/* Ubicación */}
                    {user.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{user.location}</span>
                        </div>
                    )}

                    {/* Experiencia */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{user.years_experience} años de experiencia</span>
                    </div>

                    {/* Estadísticas */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="font-semibold text-lg">{user.posts_count}</div>
                            <div className="text-xs text-muted-foreground">Posts</div>
                        </div>
                        <div>
                            <div className="font-semibold text-lg">{user.followers_count}</div>
                            <div className="text-xs text-muted-foreground">Seguidores</div>
                        </div>
                        <div>
                            <div className="font-semibold text-lg">{user.following_count}</div>
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
                </CardContent>
            </Card>

            {/* Acciones Rápidas */}
            <Card>
                <CardHeader>
                    <h4 className="text-sm font-semibold">Acciones Rápidas</h4>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                        <Link href={`/users/${user.id}`}>
                            <User className="h-4 w-4 mr-2" />
                            Ver Perfil
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                        <Link href="/bookmarks">
                            <Bookmark className="h-4 w-4 mr-2" />
                            Favoritos
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                        <Link href="/my-jobs">
                            <Briefcase className="h-4 w-4 mr-2" />
                            Mis Trabajos
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                        <Link href="/posts/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Post
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                        <Link href="/jobs/create">
                            <Briefcase className="h-4 w-4 mr-2" />
                            Publicar Trabajo
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                        <Link href="/users">
                            <Search className="h-4 w-4 mr-2" />
                            Buscar Usuarios
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

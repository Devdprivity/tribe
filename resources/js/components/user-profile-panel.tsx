import { usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCreatePost } from '@/contexts/create-post-context';
import {
    User,
    Bookmark,
    Briefcase,
    Plus,
    MapPin,
    Calendar,
    Users,
    ExternalLink
} from 'lucide-react';

interface User {
    id: number;
    username: string;
    full_name: string;
    avatar?: string;
    bio?: string;
    location?: string;
    experience_years?: number;
    followers_count?: number;
    following_count?: number;
    is_admin?: boolean;
}

export function UserProfilePanel() {
    const props = usePage().props as { auth?: { user: User } };
    const user = props.auth?.user;
    const { openCreatePostModal } = useCreatePost();

    if (!user) {
        return (
            <div className="p-4">
                <Card className="apple-liquid-card">
                    <CardContent className="p-6 text-center">
                        <p className="text-white/70 mb-4">Inicia sesión para ver tu perfil</p>
                        <div className="space-y-2">
                            <Button asChild className="w-full bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25 rounded-xl apple-liquid-button">
                                <Link href="/login">Iniciar Sesión</Link>
                            </Button>
                            <Button variant="outline" asChild className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 rounded-xl apple-liquid-button">
                                <Link href="/register">Registrarse</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4">
            {/* Perfil del Usuario */}
            <Card className="apple-liquid-card">
                <CardContent className="p-6">
                    <div className="text-center mb-4">
                        <Avatar className="h-20 w-20 mx-auto mb-3 ring-4 ring-white/20">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-2xl font-bold">
                                {user.full_name?.charAt(0) || user.username?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        
                        <h3 className="text-xl font-bold text-white mb-1">{user.full_name}</h3>
                        <p className="text-white/70 mb-2">@{user.username}</p>
                        
                        {user.is_admin && (
                            <Badge className="bg-red-500/80 text-white border-red-400/50 mb-3">
                                Admin
                            </Badge>
                        )}
                    </div>

                    {user.bio && (
                        <p className="text-white/90 text-center mb-4">{user.bio}</p>
                    )}

                    <div className="space-y-3 text-sm">
                        {user.location && (
                            <div className="flex items-center gap-2 text-white/80">
                                <MapPin className="h-4 w-4" />
                                <span>{user.location}</span>
                            </div>
                        )}
                        
                        {user.experience_years && (
                            <div className="flex items-center gap-2 text-white/80">
                                <Calendar className="h-4 w-4" />
                                <span>{user.experience_years} años de experiencia</span>
                            </div>
                        )}
                        
                        <div className="flex justify-center gap-6 pt-2">
                            <div className="text-center">
                                <div className="text-lg font-bold text-white">{user.followers_count || 0}</div>
                                <div className="text-xs text-white/70">Seguidores</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-white">{user.following_count || 0}</div>
                                <div className="text-xs text-white/70">Siguiendo</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 text-center">
                        <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20 rounded-lg apple-liquid-button">
                            <Link href={`/users/${user.id}`}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Ver Perfil Completo
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Acciones Rápidas */}
            <Card className="apple-liquid-card">
                <CardHeader>
                    <h4 className="text-sm font-semibold text-white">Acciones Rápidas</h4>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Button variant="ghost" size="sm" className="w-full justify-start text-white hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20 rounded-lg apple-liquid-button" asChild>
                        <Link href={`/users/${user.id}`}>
                            <User className="h-4 w-4 mr-2" />
                            Mi Perfil
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-white hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20 rounded-lg apple-liquid-button" asChild>
                        <Link href="/messages">
                            <Bookmark className="h-4 w-4 mr-2" />
                            Mis Mensajes
                        </Link>
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={openCreatePostModal}
                        className="w-full justify-start text-white hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20 rounded-lg apple-liquid-button"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Post
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-white hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20 rounded-lg apple-liquid-button" asChild>
                        <Link href="/jobs/create">
                            <Briefcase className="h-4 w-4 mr-2" />
                            Publicar Trabajo
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-white hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20 rounded-lg apple-liquid-button" asChild>
                        <Link href="/users">
                            <Users className="h-4 w-4 mr-2" />
                            Buscar Usuarios
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Home,
    Users,
    MessageCircle,
    Briefcase,
    Hash,
    Bookmark,
    Settings,
    Plus,
    TrendingUp,
    Calendar,
    Star,
    Zap
} from 'lucide-react';

interface User {
    id: number;
    username: string;
    full_name: string;
    avatar?: string;
}

export function AppSidebar() {
    const props = usePage().props as { auth?: { user: User } };
    const user = props.auth?.user;

    const navigationItems = [
        { name: 'Inicio', href: '/dashboard', icon: Home, badge: null },
        { name: 'Timeline', href: '/timeline', icon: TrendingUp, badge: null },
        { name: 'Desarrolladores', href: '/users', icon: Users, badge: null },
        { name: 'Canales', href: '/channels', icon: Hash, badge: null },
        { name: 'Trabajos', href: '/jobs', icon: Briefcase, badge: 'Nuevo' },
        { name: 'Guardados', href: '/bookmarks', icon: Bookmark, badge: null },
    ];

    const quickActions = [
        { name: 'Crear Post', href: '/posts/create', icon: Plus, variant: 'default' as const },
        { name: 'Publicar Trabajo', href: '/jobs/create', icon: Briefcase, variant: 'outline' as const },
        { name: 'Ver Canales', href: '/channels', icon: Hash, variant: 'outline' as const },
    ];

    return (
        <div className="w-64 border-r bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <div className="flex flex-col h-screen">
                {/* Header */}
                <div className="p-4 border-b">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-xl">Tribe</span>
                    </Link>
                </div>

                {/* Navegación Principal */}
                <nav className="flex-1 p-4 space-y-2">
                    <div className="space-y-1">
                        {navigationItems.map((item) => (
                            <Link key={item.name} href={item.href}>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-3 h-11"
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span className="flex-1 text-left">{item.name}</span>
                                    {item.badge && (
                                        <Badge variant="destructive" className="ml-auto text-xs">
                                            {item.badge}
                                        </Badge>
                                    )}
                                </Button>
                            </Link>
                        ))}
                    </div>

                    {/* Separador */}
                    <div className="border-t my-4" />

                    {/* Acciones Rápidas */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
                            Acciones Rápidas
                        </h3>
                        {quickActions.map((action) => (
                            <Link key={action.name} href={action.href}>
                                <Button
                                    variant={action.variant}
                                    className="w-full justify-start gap-3 h-10"
                                >
                                    <action.icon className="h-4 w-4" />
                                    <span className="text-sm">{action.name}</span>
                                </Button>
                            </Link>
                        ))}
                    </div>

                    {/* Separador */}
                    <div className="border-t my-4" />

                    {/* Canales Favoritos */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
                            Canales Favoritos
                        </h3>
                        <div className="space-y-1">
                            <Button variant="ghost" className="w-full justify-start gap-3 h-9 text-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                <span>#laravel</span>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start gap-3 h-9 text-sm">
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                <span>#react</span>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start gap-3 h-9 text-sm">
                                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                <span>#javascript</span>
                            </Button>
                        </div>
                    </div>
                </nav>

                {/* Footer - Perfil del Usuario */}
                <div className="p-4 border-t">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>
                                    {user.full_name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user.full_name}</p>
                                <p className="text-xs text-muted-foreground">@{user.username}</p>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/settings">
                                    <Settings className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Button asChild className="w-full">
                                <Link href="/login">Iniciar Sesión</Link>
                            </Button>
                            <Button variant="outline" asChild className="w-full">
                                <Link href="/register">Registrarse</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

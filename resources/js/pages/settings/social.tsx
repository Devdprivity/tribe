import { Head, Link, useForm } from '@inertiajs/react';
import { Github, Mail, LinkIcon, Unlink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { UserProfilePanel } from '@/components/user-profile-panel';

interface SocialProps {
    user: {
        id: number;
        full_name: string;
        email: string;
        provider?: string;
        provider_id?: string;
        provider_avatar?: string;
        github_username?: string;
        last_login_at?: string;
    };
    connectedProviders: {
        github: boolean;
        google: boolean;
    };
}

export default function Social({ user, connectedProviders }: SocialProps) {
    const { delete: deleteRequest, processing } = useForm();

    const handleDisconnect = (provider: string) => {
        if (confirm(`¿Estás seguro de que quieres desconectar ${provider}?`)) {
            deleteRequest(route('social.disconnect', provider));
        }
    };

    return (
        <AppLayout>
            <Head title="Configuración Social" />

            <SettingsLayout>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Contenido Principal */}
                    <div className="lg:col-span-3 space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-white">Cuentas Sociales</h2>
                            <p className="text-white/70">
                                Gestiona tus conexiones con redes sociales y plataformas de desarrollo
                            </p>
                        </div>

                        <Separator className="bg-white/20" />

                        <div className="grid gap-4">
                            {/* GitHub */}
                            <Card className="apple-liquid-card">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 ring-2 ring-white/20">
                                                <Github className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg text-white">GitHub</CardTitle>
                                                <CardDescription className="text-white/80">
                                                    Conecta tu perfil de GitHub para mostrar tu experiencia
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {connectedProviders.github ? (
                                                <Badge variant="secondary" className="bg-green-500/80 text-white border-green-400/50">
                                                    <LinkIcon className="mr-1 h-3 w-3" />
                                                    Conectado
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                                                    <Unlink className="mr-1 h-3 w-3" />
                                                    Desconectado
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {connectedProviders.github ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-white/70">Usuario:</span>
                                                <span className="font-medium text-white">@{user.github_username}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-white/70">Último acceso:</span>
                                                <span className="text-sm text-white/90">
                                                    {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Nunca'}
                                                </span>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDisconnect('github')}
                                                disabled={processing}
                                                className="bg-red-500/80 hover:bg-red-500 text-white border-red-400/50 shadow-lg shadow-red-500/25 rounded-lg apple-liquid-button"
                                            >
                                                <Unlink className="mr-2 h-4 w-4" />
                                                Desconectar GitHub
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <p className="text-sm text-white/80">
                                                Conecta tu cuenta de GitHub para:
                                            </p>
                                            <ul className="text-sm text-white/80 space-y-1">
                                                <li>• Mostrar tus repositorios y contribuciones</li>
                                                <li>• Determinar automáticamente tu nivel de experiencia</li>
                                                <li>• Completar tu perfil con información de desarrollador</li>
                                                <li>• Acceso rápido con un solo clic</li>
                                            </ul>
                                            <Button asChild className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25 rounded-lg apple-liquid-button">
                                                <Link href="/auth/github">
                                                    <Github className="mr-2 h-4 w-4" />
                                                    Conectar GitHub
                                                </Link>
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Google */}
                            <Card className="apple-liquid-card">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 ring-2 ring-white/20">
                                                <Mail className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg text-white">Google</CardTitle>
                                                <CardDescription className="text-white/80">
                                                    Conecta tu cuenta de Google para acceso rápido
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {connectedProviders.google ? (
                                                <Badge variant="secondary" className="bg-green-500/80 text-white border-green-400/50">
                                                    <LinkIcon className="mr-1 h-3 w-3" />
                                                    Conectado
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                                                    <Unlink className="mr-1 h-3 w-3" />
                                                    Desconectado
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {connectedProviders.google ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-white/70">Email:</span>
                                                <span className="font-medium text-white">{user.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-white/70">Último acceso:</span>
                                                <span className="text-sm text-white/90">
                                                    {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Nunca'}
                                                </span>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDisconnect('google')}
                                                disabled={processing}
                                                className="bg-red-500/80 hover:bg-red-500 text-white border-red-400/50 shadow-lg shadow-red-500/25 rounded-lg apple-liquid-button"
                                            >
                                                <Unlink className="mr-2 h-4 w-4" />
                                                Desconectar Google
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <p className="text-sm text-white/80">
                                                Conecta tu cuenta de Google para:
                                            </p>
                                            <ul className="text-sm text-white/80 space-y-1">
                                                <li>• Acceso rápido con un solo clic</li>
                                                <li>• Sincronización automática de datos básicos</li>
                                                <li>• Recuperación fácil de cuenta</li>
                                            </ul>
                                            <Button asChild className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25 rounded-lg apple-liquid-button">
                                                <Link href="/auth/google">
                                                    <Mail className="mr-2 h-4 w-4" />
                                                    Conectar Google
                                                </Link>
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="apple-liquid-card border-yellow-200/20 bg-yellow-500/10">
                            <CardHeader>
                                <CardTitle className="text-yellow-300">
                                    Importante sobre las Conexiones Sociales
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-yellow-200">
                                <ul className="space-y-2 text-sm">
                                    <li>• Si solo tienes una cuenta social conectada, debes configurar una contraseña antes de desconectarla</li>
                                    <li>• Tus datos permanecen seguros y solo accedemos a información pública básica</li>
                                    <li>• Puedes cambiar estos ajustes en cualquier momento</li>
                                    <li>• Los permisos se pueden revisar directamente en GitHub/Google</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Panel Derecho */}
                    <div className="lg:col-span-2">
                        <UserProfilePanel />
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

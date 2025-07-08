import { Head, Link, useForm } from '@inertiajs/react';
import { Github, Mail, LinkIcon, Unlink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import SettingsLayout from '@/layouts/settings/layout';

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
        <SettingsLayout>
            <Head title="Configuración Social" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Cuentas Sociales</h2>
                    <p className="text-muted-foreground">
                        Gestiona tus conexiones con redes sociales y plataformas de desarrollo
                    </p>
                </div>

                <Separator />

                <div className="grid gap-4">
                    {/* GitHub */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                                        <Github className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">GitHub</CardTitle>
                                        <CardDescription>
                                            Conecta tu perfil de GitHub para mostrar tu experiencia
                                        </CardDescription>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {connectedProviders.github ? (
                                        <Badge variant="secondary" className="text-green-600">
                                            <LinkIcon className="mr-1 h-3 w-3" />
                                            Conectado
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">
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
                                        <span className="text-sm text-muted-foreground">Usuario:</span>
                                        <span className="font-medium">@{user.github_username}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">Último acceso:</span>
                                        <span className="text-sm">
                                            {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Nunca'}
                                        </span>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDisconnect('github')}
                                        disabled={processing}
                                    >
                                        <Unlink className="mr-2 h-4 w-4" />
                                        Desconectar GitHub
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-sm text-muted-foreground">
                                        Conecta tu cuenta de GitHub para:
                                    </p>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li>• Mostrar tus repositorios y contribuciones</li>
                                        <li>• Determinar automáticamente tu nivel de experiencia</li>
                                        <li>• Completar tu perfil con información de desarrollador</li>
                                        <li>• Acceso rápido con un solo clic</li>
                                    </ul>
                                    <Button asChild>
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
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Google</CardTitle>
                                        <CardDescription>
                                            Conecta tu cuenta de Google para acceso rápido
                                        </CardDescription>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {connectedProviders.google ? (
                                        <Badge variant="secondary" className="text-green-600">
                                            <LinkIcon className="mr-1 h-3 w-3" />
                                            Conectado
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">
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
                                        <span className="text-sm text-muted-foreground">Email:</span>
                                        <span className="font-medium">{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">Último acceso:</span>
                                        <span className="text-sm">
                                            {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Nunca'}
                                        </span>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDisconnect('google')}
                                        disabled={processing}
                                    >
                                        <Unlink className="mr-2 h-4 w-4" />
                                        Desconectar Google
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-sm text-muted-foreground">
                                        Conecta tu cuenta de Google para:
                                    </p>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li>• Acceso rápido con un solo clic</li>
                                        <li>• Sincronización automática de datos básicos</li>
                                        <li>• Recuperación fácil de cuenta</li>
                                    </ul>
                                    <Button asChild>
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

                <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
                    <CardHeader>
                        <CardTitle className="text-yellow-800 dark:text-yellow-200">
                            Importante sobre las Conexiones Sociales
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-yellow-700 dark:text-yellow-300">
                        <ul className="space-y-2 text-sm">
                            <li>• Si solo tienes una cuenta social conectada, debes configurar una contraseña antes de desconectarla</li>
                            <li>• Tus datos permanecen seguros y solo accedemos a información pública básica</li>
                            <li>• Puedes cambiar estos ajustes en cualquier momento</li>
                            <li>• Los permisos se pueden revisar directamente en GitHub/Google</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </SettingsLayout>
    );
}

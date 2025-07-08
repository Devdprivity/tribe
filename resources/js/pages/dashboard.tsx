import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Code2, Briefcase, TrendingUp } from 'lucide-react';

export default function Dashboard() {
    return (
        <AppLayout title="Dashboard" description="Bienvenido a Tribe - La comunidad de desarrolladores">
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Welcome Section */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold">¡Bienvenido a Tribe!</h1>
                    <p className="mt-2 text-muted-foreground">
                        La comunidad donde los desarrolladores comparten, aprenden y crecen juntos
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Desarrolladores</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+5,000</div>
                            <p className="text-xs text-muted-foreground">activos en la comunidad</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Snippets</CardTitle>
                            <Code2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+10,000</div>
                            <p className="text-xs text-muted-foreground">de código compartido</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Trabajos</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+500</div>
                            <p className="text-xs text-muted-foreground">oportunidades laborales</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Crecimiento</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+25%</div>
                            <p className="text-xs text-muted-foreground">este mes</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Comienza a explorar</CardTitle>
                            <CardDescription>
                                Descubre contenido, conecta con otros desarrolladores y comparte tu conocimiento
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <Link href="/timeline">
                                    <Button className="w-full justify-start" variant="outline">
                                        📱 Ver Timeline
                                    </Button>
                                </Link>
                                <Link href="/channels">
                                    <Button className="w-full justify-start" variant="outline">
                                        🗨️ Explorar Canales
                                    </Button>
                                </Link>
                                <Link href="/jobs">
                                    <Button className="w-full justify-start" variant="outline">
                                        💼 Ver Trabajos
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Configura tu perfil</CardTitle>
                            <CardDescription>
                                Completa tu perfil para conectar mejor con la comunidad
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <Link href="/settings/profile">
                                    <Button className="w-full justify-start" variant="outline">
                                        👤 Editar Perfil
                                    </Button>
                                </Link>
                                <Link href="/settings/social">
                                    <Button className="w-full justify-start" variant="outline">
                                        🔗 Conectar Redes Sociales
                                    </Button>
                                </Link>
                                <Link href="/settings/appearance">
                                    <Button className="w-full justify-start" variant="outline">
                                        🎨 Personalizar Apariencia
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Getting Started */}
                <Card>
                    <CardHeader>
                        <CardTitle>¿Cómo empezar?</CardTitle>
                        <CardDescription>
                            Sigue estos pasos para aprovechar al máximo Tribe
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                                        1
                                    </div>
                                    <h3 className="font-medium">Completa tu perfil</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Añade tu experiencia, tecnologías y proyectos para que otros desarrolladores te conozcan mejor.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                                        2
                                    </div>
                                    <h3 className="font-medium">Únete a canales</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Encuentra canales de tu interés y únete a conversaciones sobre tecnologías que te apasionan.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                                        3
                                    </div>
                                    <h3 className="font-medium">Comparte contenido</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Publica posts, comparte snippets de código, proyectos o experiencias que puedan ayudar a otros.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

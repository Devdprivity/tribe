import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus } from 'lucide-react';

export default function CreatePost() {
    return (
        <AppLayout title="Crear Post" description="Comparte tu conocimiento con la comunidad">
            <Head title="Crear Post" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/posts">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Crear Post</h1>
                        <p className="text-muted-foreground">
                            Comparte tu conocimiento con la comunidad
                        </p>
                    </div>
                </div>

                {/* Formulario */}
                <Card>
                    <CardHeader>
                        <CardTitle>Nuevo Post</CardTitle>
                        <CardDescription>
                            Escribe sobre lo que quieras compartir con la comunidad
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tipo de contenido</label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona el tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="text">Texto</SelectItem>
                                    <SelectItem value="code">Código</SelectItem>
                                    <SelectItem value="project">Proyecto</SelectItem>
                                    <SelectItem value="question">Pregunta</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Contenido</label>
                            <Textarea
                                placeholder="¿Qué quieres compartir con la comunidad?"
                                className="min-h-[200px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Etiquetas</label>
                            <Input placeholder="laravel, php, vue, etc." />
                            <p className="text-xs text-muted-foreground">
                                Separa las etiquetas con comas
                            </p>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" asChild>
                                <Link href="/posts">Cancelar</Link>
                            </Button>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Publicar Post
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

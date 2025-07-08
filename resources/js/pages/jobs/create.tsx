import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus } from 'lucide-react';

export default function CreateJob() {
    return (
        <AppLayout title="Publicar Trabajo" description="Publica una oferta de trabajo">
            <Head title="Publicar Trabajo" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/jobs">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Publicar Trabajo</h1>
                        <p className="text-muted-foreground">
                            Encuentra al desarrollador perfecto para tu equipo
                        </p>
                    </div>
                </div>

                {/* Formulario */}
                <Card>
                    <CardHeader>
                        <CardTitle>Nueva Oferta de Trabajo</CardTitle>
                        <CardDescription>
                            Describe el puesto y los requisitos
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Empresa</label>
                                <Input placeholder="Nombre de la empresa" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Título del puesto</label>
                                <Input placeholder="Desarrollador Laravel Senior" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ubicación</label>
                                <Input placeholder="Madrid, España" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Salario</label>
                                <Input placeholder="45.000€ - 55.000€" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tipo de contrato</label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="full-time">Tiempo completo</SelectItem>
                                        <SelectItem value="part-time">Tiempo parcial</SelectItem>
                                        <SelectItem value="contract">Por contrato</SelectItem>
                                        <SelectItem value="freelance">Freelance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Descripción</label>
                            <Textarea
                                placeholder="Describe el puesto, responsabilidades y requisitos..."
                                className="min-h-[200px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tecnologías requeridas</label>
                            <Input placeholder="Laravel, Vue.js, MySQL, Git" />
                            <p className="text-xs text-muted-foreground">
                                Separa las tecnologías con comas
                            </p>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" asChild>
                                <Link href="/jobs">Cancelar</Link>
                            </Button>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Publicar Trabajo
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

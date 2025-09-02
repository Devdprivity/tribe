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
                    <Button variant="ghost" size="sm" asChild className="bg-white/10 hover:bg-white/20 text-white border border-transparent hover:border-white/20 rounded-lg apple-liquid-button">
                        <Link href="/jobs">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Publicar Trabajo</h1>
                        <p className="text-white/70">
                            Encuentra al desarrollador perfecto para tu equipo
                        </p>
                    </div>
                </div>

                {/* Formulario */}
                <Card className="apple-liquid-card">
                    <CardHeader>
                        <CardTitle className="text-white">Nueva Oferta de Trabajo</CardTitle>
                        <CardDescription className="text-white/70">
                            Describe el puesto y los requisitos
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">Empresa</label>
                                <Input 
                                    placeholder="Nombre de la empresa" 
                                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">Título del puesto</label>
                                <Input 
                                    placeholder="Desarrollador Laravel Senior" 
                                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">Ubicación</label>
                                <Input 
                                    placeholder="Madrid, España" 
                                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">Salario</label>
                                <Input 
                                    placeholder="45.000€ - 55.000€" 
                                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">Tipo de contrato</label>
                                <Select>
                                    <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-white/40 focus:ring-white/20">
                                        <SelectValue placeholder="Selecciona" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white/10 backdrop-blur-xl border border-white/20">
                                        <SelectItem value="full-time" className="text-white hover:bg-white/20">Tiempo completo</SelectItem>
                                        <SelectItem value="part-time" className="text-white hover:bg-white/20">Tiempo parcial</SelectItem>
                                        <SelectItem value="contract" className="text-white hover:bg-white/20">Por contrato</SelectItem>
                                        <SelectItem value="freelance" className="text-white hover:bg-white/20">Freelance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Descripción</label>
                            <Textarea
                                placeholder="Describe el puesto, responsabilidades y requisitos..."
                                className="min-h-[200px] bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Tecnologías requeridas</label>
                            <Input 
                                placeholder="Laravel, Vue.js, MySQL, Git" 
                                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
                            />
                            <p className="text-xs text-white/50">
                                Separa las tecnologías con comas
                            </p>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" asChild className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 rounded-lg apple-liquid-button">
                                <Link href="/jobs">Cancelar</Link>
                            </Button>
                            <Button className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25 rounded-lg apple-liquid-button">
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

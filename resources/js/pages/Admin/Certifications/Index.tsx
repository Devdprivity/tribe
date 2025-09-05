import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Plus, 
    Search, 
    Filter,
    Edit,
    Trash2,
    Eye,
    BarChart3,
    Users,
    Clock,
    Trophy,
    Target,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Settings,
    BookOpen,
    DollarSign,
    TrendingUp,
    Download,
    Upload,
    Copy,
    MoreHorizontal
} from 'lucide-react';
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';

interface Certification {
    id: number;
    name: string;
    description: string;
    category: string;
    category_label: string;
    level: string;
    level_label: string;
    level_color: string;
    duration_hours: number;
    formatted_duration: string;
    price: number;
    formatted_price: string;
    passing_score: number;
    max_attempts: number;
    is_premium: boolean;
    is_active: boolean;
    validity_months: number | null;
    validity_label: string;
    skills_covered: string[];
    created_at: string;
    updated_at: string;
    stats: {
        total_attempts: number;
        completed_attempts: number;
        passed_attempts: number;
        pass_rate: number;
        average_score: number;
        average_completion_time: number;
        recent_activity: number;
    };
}

interface AdminStats {
    total_certifications: number;
    active_certifications: number;
    inactive_certifications: number;
    total_attempts: number;
    total_certificates_issued: number;
    average_pass_rate: number;
    most_popular_category: string;
    revenue_this_month: number;
}

interface Props {
    certifications: {
        data: Certification[];
        links: any;
        meta: any;
    };
    stats: AdminStats;
    categories: Record<string, string>;
    levels: Record<string, string>;
    filters: {
        search?: string;
        category?: string;
        level?: string;
        status?: string;
        price_range?: string;
    };
}

export default function AdminCertificationsIndex({ certifications, stats, categories, levels, filters }: Props) {
    const [activeTab, setActiveTab] = useState('certifications');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    const [selectedLevel, setSelectedLevel] = useState(filters.level || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedCategory) params.append('category', selectedCategory);
        if (selectedLevel) params.append('level', selectedLevel);
        if (selectedStatus) params.append('status', selectedStatus);
        
        window.location.href = `/admin/certifications?${params.toString()}`;
    };

    const handleSelectAll = () => {
        if (selectedItems.length === certifications.data.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(certifications.data.map(cert => cert.id));
        }
    };

    const handleSelectItem = (id: number) => {
        setSelectedItems(prev => 
            prev.includes(id) 
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const handleBulkAction = async (action: string) => {
        if (selectedItems.length === 0) return;

        const confirmed = confirm(`¿Estás seguro de ${action} ${selectedItems.length} certificación(es)?`);
        if (!confirmed) return;

        try {
            await fetch('/admin/certifications/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    action,
                    ids: selectedItems
                })
            });

            window.location.reload();
        } catch (error) {
            console.error('Error performing bulk action:', error);
            alert('Error al realizar la acción');
        }
    };

    const getStatusColor = (isActive: boolean): string => {
        return isActive ? 'text-green-500' : 'text-red-500';
    };

    const getPassRateColor = (rate: number): string => {
        if (rate >= 80) return 'text-green-500';
        if (rate >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Administrar Certificaciones" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Administrar Certificaciones</h1>
                        <p className="text-gray-400">Gestiona el catálogo completo de certificaciones</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => window.location.href = '/admin/certifications/import'}>
                            <Upload className="mr-2 h-4 w-4" />
                            Importar
                        </Button>
                        <Button onClick={() => window.location.href = '/admin/certifications/create'} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Certificación
                        </Button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-dark-100 border-dark-200">
                        <CardContent className="p-6 text-center">
                            <BookOpen className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                            <p className="text-2xl font-bold text-white">{stats.total_certifications}</p>
                            <p className="text-gray-400">Total Certificaciones</p>
                            <div className="flex justify-center gap-4 mt-2 text-sm">
                                <span className="text-green-500">{stats.active_certifications} activas</span>
                                <span className="text-red-500">{stats.inactive_certifications} inactivas</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-dark-100 border-dark-200">
                        <CardContent className="p-6 text-center">
                            <Users className="h-8 w-8 text-green-500 mx-auto mb-3" />
                            <p className="text-2xl font-bold text-white">{stats.total_attempts.toLocaleString()}</p>
                            <p className="text-gray-400">Intentos Totales</p>
                            <p className="text-sm text-gray-500 mt-2">
                                {stats.total_certificates_issued.toLocaleString()} certificados emitidos
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-dark-100 border-dark-200">
                        <CardContent className="p-6 text-center">
                            <Target className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                            <p className="text-2xl font-bold text-white">{stats.average_pass_rate}%</p>
                            <p className="text-gray-400">Tasa Promedio de Aprobación</p>
                            <p className="text-sm text-gray-500 mt-2">
                                Categoría popular: {stats.most_popular_category}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-dark-100 border-dark-200">
                        <CardContent className="p-6 text-center">
                            <DollarSign className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                            <p className="text-2xl font-bold text-white">${stats.revenue_this_month.toLocaleString()}</p>
                            <p className="text-gray-400">Ingresos Este Mes</p>
                            <p className="text-sm text-green-500 mt-2">
                                <TrendingUp className="inline h-3 w-3 mr-1" />
                                +15% vs mes anterior
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="certifications">Certificaciones</TabsTrigger>
                        <TabsTrigger value="analytics">Analíticas</TabsTrigger>
                        <TabsTrigger value="settings">Configuración</TabsTrigger>
                    </TabsList>

                    <TabsContent value="certifications" className="space-y-6">
                        {/* Filters */}
                        <Card className="bg-dark-100 border-dark-200">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Buscar certificaciones..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 bg-dark-200 border-dark-300 text-white"
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>

                                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                        <SelectTrigger className="w-48 bg-dark-200 border-dark-300 text-white">
                                            <SelectValue placeholder="Categoría" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-dark-200 border-dark-300">
                                            <SelectItem value="all">Todas las categorías</SelectItem>
                                            {Object.entries(categories).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                                        <SelectTrigger className="w-48 bg-dark-200 border-dark-300 text-white">
                                            <SelectValue placeholder="Nivel" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-dark-200 border-dark-300">
                                            <SelectItem value="all">Todos los niveles</SelectItem>
                                            {Object.entries(levels).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                        <SelectTrigger className="w-32 bg-dark-200 border-dark-300 text-white">
                                            <SelectValue placeholder="Estado" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-dark-200 border-dark-300">
                                            <SelectItem value="all">Todos</SelectItem>
                                            <SelectItem value="active">Activas</SelectItem>
                                            <SelectItem value="inactive">Inactivas</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Filtrar
                                    </Button>
                                </div>

                                {/* Bulk Actions */}
                                {selectedItems.length > 0 && (
                                    <div className="flex items-center gap-2 p-3 bg-blue-50/5 border border-blue-600 rounded-lg">
                                        <p className="text-blue-400 font-medium">
                                            {selectedItems.length} certificación(es) seleccionada(s)
                                        </p>
                                        <div className="flex gap-2 ml-auto">
                                            <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')}>
                                                Activar
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => handleBulkAction('deactivate')}>
                                                Desactivar
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => handleBulkAction('delete')} className="text-red-400 border-red-600">
                                                Eliminar
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Certifications Table */}
                        <Card className="bg-dark-100 border-dark-200">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b border-dark-300">
                                            <tr>
                                                <th className="p-4 text-left">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedItems.length === certifications.data.length && certifications.data.length > 0}
                                                        onChange={handleSelectAll}
                                                        className="rounded border-gray-600 bg-dark-300 text-blue-600"
                                                    />
                                                </th>
                                                <th className="p-4 text-left text-white font-medium">Certificación</th>
                                                <th className="p-4 text-left text-white font-medium">Estado</th>
                                                <th className="p-4 text-left text-white font-medium">Estadísticas</th>
                                                <th className="p-4 text-left text-white font-medium">Configuración</th>
                                                <th className="p-4 text-left text-white font-medium">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {certifications.data.map((cert) => (
                                                <tr key={cert.id} className="border-b border-dark-300 hover:bg-dark-200">
                                                    <td className="p-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedItems.includes(cert.id)}
                                                            onChange={() => handleSelectItem(cert.id)}
                                                            className="rounded border-gray-600 bg-dark-300 text-blue-600"
                                                        />
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-start space-x-3">
                                                            <div className="flex-1">
                                                                <h4 className="text-white font-medium mb-1">{cert.name}</h4>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <Badge variant="secondary" className={cert.level_color}>
                                                                        {cert.level_label}
                                                                    </Badge>
                                                                    <Badge variant="outline">
                                                                        {cert.category_label}
                                                                    </Badge>
                                                                    {cert.is_premium && (
                                                                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                                                                            Premium
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <p className="text-gray-400 text-sm line-clamp-2">
                                                                    {cert.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center">
                                                                {cert.is_active ? (
                                                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                                                ) : (
                                                                    <XCircle className="h-4 w-4 text-red-500 mr-2" />
                                                                )}
                                                                <span className={getStatusColor(cert.is_active)}>
                                                                    {cert.is_active ? 'Activa' : 'Inactiva'}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-500">
                                                                Actualizada: {cert.updated_at}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="space-y-1 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-400">Intentos:</span>
                                                                <span className="text-white">{cert.stats.total_attempts}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-400">Aprobación:</span>
                                                                <span className={getPassRateColor(cert.stats.pass_rate)}>
                                                                    {cert.stats.pass_rate}%
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-400">Promedio:</span>
                                                                <span className="text-white">{cert.stats.average_score}%</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="space-y-1 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-400">Precio:</span>
                                                                <span className="text-white">{cert.formatted_price}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-400">Duración:</span>
                                                                <span className="text-white">{cert.formatted_duration}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-400">Intentos:</span>
                                                                <span className="text-white">{cert.max_attempts}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => window.location.href = `/certifications/${cert.id}`}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => window.location.href = `/admin/certifications/${cert.id}/edit`}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button size="sm" variant="outline">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent className="bg-dark-200 border-dark-300">
                                                                    <DropdownMenuItem onClick={() => window.location.href = `/admin/certifications/${cert.id}/analytics`}>
                                                                        <BarChart3 className="mr-2 h-4 w-4" />
                                                                        Ver Analíticas
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => window.location.href = `/admin/certifications/${cert.id}/questions`}>
                                                                        <BookOpen className="mr-2 h-4 w-4" />
                                                                        Gestionar Preguntas
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => window.location.href = `/admin/certifications/${cert.id}/clone`}>
                                                                        <Copy className="mr-2 h-4 w-4" />
                                                                        Duplicar
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem 
                                                                        className="text-red-400"
                                                                        onClick={() => {
                                                                            if (confirm('¿Estás seguro de eliminar esta certificación?')) {
                                                                                window.location.href = `/admin/certifications/${cert.id}/delete`;
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Eliminar
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {certifications && certifications.meta && certifications.meta.last_page && certifications.meta.last_page > 1 && (
                                    <div className="flex justify-center p-6 border-t border-dark-300">
                                        <nav className="flex items-center space-x-2">
                                            {certifications.links.map((link, index) => (
                                                <Button
                                                    key={index}
                                                    variant={link.active ? "default" : "outline"}
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && (window.location.href = link.url)}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </nav>
                                    </div>
                                )}

                                {/* Empty State */}
                                {certifications.data.length === 0 && (
                                    <div className="text-center py-12">
                                        <BookOpen className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-white mb-2">
                                            No se encontraron certificaciones
                                        </h3>
                                        <p className="text-gray-400 mb-4">
                                            Intenta ajustar tus filtros de búsqueda
                                        </p>
                                        <Button onClick={() => window.location.href = '/admin/certifications/create'}>
                                            Crear Primera Certificación
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6">
                        <Card className="bg-dark-100 border-dark-200">
                            <CardHeader>
                                <CardTitle className="text-white">Analíticas Generales</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-400">
                                    Las analíticas detalladas estarán disponibles en la próxima actualización.
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-6">
                        <Card className="bg-dark-100 border-dark-200">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center">
                                    <Settings className="mr-2 h-5 w-5" />
                                    Configuración del Sistema
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-400">
                                    La configuración del sistema estará disponible en la próxima actualización.
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}
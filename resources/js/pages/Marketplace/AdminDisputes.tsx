import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    AlertTriangle, 
    CheckCircle, 
    Clock, 
    Eye, 
    Filter,
    Search,
    User,
    Calendar,
    DollarSign,
    MessageSquare,
    FileText,
    Shield
} from 'lucide-react';

interface Dispute {
    id: number;
    purchase_id: number;
    buyer_id: number;
    seller_id: number;
    status: 'open' | 'in_review' | 'resolved' | 'escalated';
    reason: string;
    description: string;
    evidence: string;
    resolution?: string;
    admin_notes?: string;
    created_at: string;
    updated_at: string;
    purchase: {
        id: number;
        product: {
            id: number;
            name: string;
            price: number;
            image_url?: string;
        };
        buyer: {
            id: number;
            name: string;
            email: string;
        };
        seller: {
            id: number;
            name: string;
            email: string;
        };
        amount: number;
        status: string;
    };
    responses: Array<{
        id: number;
        user_id: number;
        message: string;
        evidence?: string;
        created_at: string;
        user: {
            name: string;
        };
    }>;
}

interface AdminDisputesProps {
    disputes: Dispute[];
    stats: {
        total: number;
        open: number;
        in_review: number;
        resolved: number;
        escalated: number;
    };
}

export default function AdminDisputes({ disputes, stats }: AdminDisputesProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

    const filteredDisputes = disputes.filter(dispute => {
        const matchesSearch = dispute.purchase.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            dispute.purchase.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            dispute.purchase.seller.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        const variants = {
            open: 'destructive',
            in_review: 'secondary',
            resolved: 'default',
            escalated: 'outline'
        } as const;

        const labels = {
            open: 'Abierta',
            in_review: 'En Revisión',
            resolved: 'Resuelta',
            escalated: 'Escalada'
        };

        return (
            <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
                {labels[status as keyof typeof labels] || status}
            </Badge>
        );
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'open':
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            case 'in_review':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'resolved':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'escalated':
                return <Shield className="h-4 w-4 text-purple-500" />;
            default:
                return <AlertTriangle className="h-4 w-4" />;
        }
    };

    const handleResolveDispute = (disputeId: number) => {
        router.visit(`/disputes/${disputeId}/resolve`, {
            method: 'get'
        });
    };

    const handleAssignDispute = (disputeId: number) => {
        router.visit(`/disputes/${disputeId}/assign`, {
            method: 'get'
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Administración de Disputas" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Administración de Disputas
                        </h1>
                        <p className="text-white/70">
                            Gestiona y resuelve disputas entre compradores y vendedores
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                        <Card className="bg-white/5 border-white/10">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-white/70">Total</p>
                                        <p className="text-2xl font-bold text-white">{stats.total}</p>
                                    </div>
                                    <AlertTriangle className="h-8 w-8 text-white/50" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 border-white/10">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-white/70">Abiertas</p>
                                        <p className="text-2xl font-bold text-red-400">{stats.open}</p>
                                    </div>
                                    <AlertTriangle className="h-8 w-8 text-red-400/50" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 border-white/10">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-white/70">En Revisión</p>
                                        <p className="text-2xl font-bold text-yellow-400">{stats.in_review}</p>
                                    </div>
                                    <Clock className="h-8 w-8 text-yellow-400/50" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 border-white/10">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-white/70">Resueltas</p>
                                        <p className="text-2xl font-bold text-green-400">{stats.resolved}</p>
                                    </div>
                                    <CheckCircle className="h-8 w-8 text-green-400/50" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 border-white/10">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-white/70">Escaladas</p>
                                        <p className="text-2xl font-bold text-purple-400">{stats.escalated}</p>
                                    </div>
                                    <Shield className="h-8 w-8 text-purple-400/50" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="bg-white/5 border-white/10 mb-6">
                        <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                                        <input
                                            type="text"
                                            placeholder="Buscar por producto, comprador o vendedor..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex gap-2">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    >
                                        <option value="all">Todos los estados</option>
                                        <option value="open">Abiertas</option>
                                        <option value="in_review">En Revisión</option>
                                        <option value="resolved">Resueltas</option>
                                        <option value="escalated">Escaladas</option>
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Disputes List */}
                    <div className="space-y-4">
                        {filteredDisputes.map((dispute) => (
                            <Card key={dispute.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                {getStatusIcon(dispute.status)}
                                                <h3 className="text-lg font-semibold text-white">
                                                    Disputa #{dispute.id}
                                                </h3>
                                                {getStatusBadge(dispute.status)}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <div>
                                                    <p className="text-sm text-white/70 mb-1">Producto</p>
                                                    <div className="flex items-center gap-2">
                                                        {dispute.purchase.product.image_url && (
                                                            <img
                                                                src={dispute.purchase.product.image_url}
                                                                alt={dispute.purchase.product.name}
                                                                className="w-8 h-8 rounded object-cover"
                                                            />
                                                        )}
                                                        <p className="text-white font-medium">
                                                            {dispute.purchase.product.name}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-sm text-white/70 mb-1">Comprador</p>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-white/50" />
                                                        <p className="text-white">{dispute.purchase.buyer.name}</p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-sm text-white/70 mb-1">Vendedor</p>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-white/50" />
                                                        <p className="text-white">{dispute.purchase.seller.name}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <p className="text-sm text-white/70 mb-1">Motivo</p>
                                                    <p className="text-white">{dispute.reason}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-white/70 mb-1">Monto</p>
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="h-4 w-4 text-white/50" />
                                                        <p className="text-white font-medium">
                                                            ${dispute.purchase.amount.toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <p className="text-sm text-white/70 mb-1">Descripción</p>
                                                <p className="text-white/80 text-sm line-clamp-2">
                                                    {dispute.description}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-white/50">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>Creada: {new Date(dispute.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MessageSquare className="h-4 w-4" />
                                                    <span>{dispute.responses.length} respuestas</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 ml-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedDispute(dispute)}
                                                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                Ver Detalles
                                            </Button>

                                            {dispute.status === 'open' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAssignDispute(dispute.id)}
                                                    className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border-yellow-400/30"
                                                >
                                                    <Shield className="h-4 w-4 mr-2" />
                                                    Asignar
                                                </Button>
                                            )}

                                            {dispute.status === 'in_review' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleResolveDispute(dispute.id)}
                                                    className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-400/30"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Resolver
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {filteredDisputes.length === 0 && (
                            <Card className="bg-white/5 border-white/10">
                                <CardContent className="p-8 text-center">
                                    <AlertTriangle className="h-12 w-12 text-white/30 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        No se encontraron disputas
                                    </h3>
                                    <p className="text-white/70">
                                        No hay disputas que coincidan con los filtros seleccionados.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Dispute Detail Modal */}
            {selectedDispute && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
                        onClick={() => setSelectedDispute(null)}
                    />
                    <div className="relative max-w-4xl max-h-[90vh] overflow-y-auto bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-6">
                        <button 
                            onClick={() => setSelectedDispute(null)}
                            className="absolute top-4 right-4 text-white/70 hover:text-white"
                        >
                            ✕
                        </button>

                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Disputa #{selectedDispute.id}
                            </h2>
                            <div className="flex items-center gap-3">
                                {getStatusIcon(selectedDispute.status)}
                                {getStatusBadge(selectedDispute.status)}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Información del Producto</h3>
                                <div className="space-y-2">
                                    <p className="text-white/70">Nombre: <span className="text-white">{selectedDispute.purchase.product.name}</span></p>
                                    <p className="text-white/70">Precio: <span className="text-white">${selectedDispute.purchase.product.price.toFixed(2)}</span></p>
                                    <p className="text-white/70">Monto de la compra: <span className="text-white">${selectedDispute.purchase.amount.toFixed(2)}</span></p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Partes Involucradas</h3>
                                <div className="space-y-2">
                                    <p className="text-white/70">Comprador: <span className="text-white">{selectedDispute.purchase.buyer.name}</span></p>
                                    <p className="text-white/70">Email: <span className="text-white">{selectedDispute.purchase.buyer.email}</span></p>
                                    <p className="text-white/70">Vendedor: <span className="text-white">{selectedDispute.purchase.seller.name}</span></p>
                                    <p className="text-white/70">Email: <span className="text-white">{selectedDispute.purchase.seller.email}</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-white mb-3">Detalles de la Disputa</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-white/70 mb-1">Motivo:</p>
                                    <p className="text-white">{selectedDispute.reason}</p>
                                </div>
                                <div>
                                    <p className="text-white/70 mb-1">Descripción:</p>
                                    <p className="text-white">{selectedDispute.description}</p>
                                </div>
                                {selectedDispute.evidence && (
                                    <div>
                                        <p className="text-white/70 mb-1">Evidencia:</p>
                                        <p className="text-white">{selectedDispute.evidence}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedDispute.responses.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-white mb-3">Respuestas</h3>
                                <div className="space-y-3">
                                    {selectedDispute.responses.map((response) => (
                                        <div key={response.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-white font-medium">{response.user.name}</p>
                                                <p className="text-white/50 text-sm">
                                                    {new Date(response.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                            <p className="text-white/80">{response.message}</p>
                                            {response.evidence && (
                                                <p className="text-white/60 text-sm mt-2">
                                                    Evidencia: {response.evidence}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedDispute.resolution && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-white mb-3">Resolución</h3>
                                <p className="text-white">{selectedDispute.resolution}</p>
                            </div>
                        )}

                        {selectedDispute.admin_notes && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-white mb-3">Notas del Administrador</h3>
                                <p className="text-white">{selectedDispute.admin_notes}</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setSelectedDispute(null)}
                                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                            >
                                Cerrar
                            </Button>
                            
                            {selectedDispute.status === 'open' && (
                                <Button
                                    onClick={() => handleAssignDispute(selectedDispute.id)}
                                    className="bg-yellow-500/80 hover:bg-yellow-500 text-white border-yellow-400/50"
                                >
                                    <Shield className="h-4 w-4 mr-2" />
                                    Asignar Disputa
                                </Button>
                            )}

                            {selectedDispute.status === 'in_review' && (
                                <Button
                                    onClick={() => handleResolveDispute(selectedDispute.id)}
                                    className="bg-green-500/80 hover:bg-green-500 text-white border-green-400/50"
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Resolver Disputa
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
    AlertTriangle, 
    CheckCircle, 
    XCircle,
    DollarSign,
    User,
    Calendar,
    MessageSquare,
    FileText,
    ArrowLeft
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

interface ResolveDisputeProps {
    dispute: Dispute;
}

export default function ResolveDispute({ dispute }: ResolveDisputeProps) {
    const [resolutionType, setResolutionType] = useState<'favor_buyer' | 'favor_seller' | 'partial_refund' | 'no_fault'>('favor_buyer');
    const [refundAmount, setRefundAmount] = useState<number>(dispute.purchase.amount);
    const [adminNotes, setAdminNotes] = useState<string>('');

    const { data, setData, post, processing, errors } = useForm({
        resolution_type: resolutionType,
        refund_amount: refundAmount,
        resolution: '',
        admin_notes: adminNotes,
        refund_seller: false,
        refund_buyer: false
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        setData({
            resolution_type: resolutionType,
            refund_amount: refundAmount,
            resolution: data.resolution,
            admin_notes: adminNotes,
            refund_seller: resolutionType === 'favor_seller',
            refund_buyer: resolutionType === 'favor_buyer' || resolutionType === 'partial_refund'
        });

        post(`/disputes/${dispute.id}/resolve`, {
            onSuccess: () => {
                router.visit('/disputes/admin');
            }
        });
    };

    const getResolutionDescription = (type: string) => {
        switch (type) {
            case 'favor_buyer':
                return 'El comprador tiene razón. Se procesará un reembolso completo.';
            case 'favor_seller':
                return 'El vendedor tiene razón. No se procesará reembolso.';
            case 'partial_refund':
                return 'Ambas partes tienen responsabilidad. Se procesará un reembolso parcial.';
            case 'no_fault':
                return 'No se puede determinar la responsabilidad. Se procesará un reembolso completo.';
            default:
                return '';
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Resolver Disputa #${dispute.id}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <Button
                                variant="outline"
                                onClick={() => router.visit('/disputes/admin')}
                                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                            <h1 className="text-3xl font-bold text-white">
                                Resolver Disputa #{dispute.id}
                            </h1>
                        </div>
                        <p className="text-white/70">
                            Revisa la información y determina la resolución de esta disputa
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Dispute Information */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Product Information */}
                            <Card className="bg-white/5 border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Información del Producto
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-white/70 mb-1">Producto</p>
                                            <div className="flex items-center gap-2">
                                                {dispute.purchase.product.image_url && (
                                                    <img
                                                        src={dispute.purchase.product.image_url}
                                                        alt={dispute.purchase.product.name}
                                                        className="w-10 h-10 rounded object-cover"
                                                    />
                                                )}
                                                <p className="text-white font-medium">
                                                    {dispute.purchase.product.name}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-white/70 mb-1">Monto de la compra</p>
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4 text-white/50" />
                                                <p className="text-white font-medium">
                                                    ${dispute.purchase.amount.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Parties Information */}
                            <Card className="bg-white/5 border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Partes Involucradas
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-white/70 mb-1">Comprador</p>
                                            <p className="text-white font-medium">{dispute.purchase.buyer.name}</p>
                                            <p className="text-white/60 text-sm">{dispute.purchase.buyer.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-white/70 mb-1">Vendedor</p>
                                            <p className="text-white font-medium">{dispute.purchase.seller.name}</p>
                                            <p className="text-white/60 text-sm">{dispute.purchase.seller.email}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Dispute Details */}
                            <Card className="bg-white/5 border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5" />
                                        Detalles de la Disputa
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-white/70 mb-1">Motivo</p>
                                            <p className="text-white">{dispute.reason}</p>
                                        </div>
                                        <div>
                                            <p className="text-white/70 mb-1">Descripción</p>
                                            <p className="text-white">{dispute.description}</p>
                                        </div>
                                        {dispute.evidence && (
                                            <div>
                                                <p className="text-white/70 mb-1">Evidencia</p>
                                                <p className="text-white">{dispute.evidence}</p>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-white/50">
                                            <Calendar className="h-4 w-4" />
                                            <span>Creada: {new Date(dispute.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Responses */}
                            {dispute.responses.length > 0 && (
                                <Card className="bg-white/5 border-white/10">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center gap-2">
                                            <MessageSquare className="h-5 w-5" />
                                            Respuestas ({dispute.responses.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {dispute.responses.map((response) => (
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
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Resolution Form */}
                        <div className="space-y-6">
                            <Card className="bg-white/5 border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5" />
                                        Resolución
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Resolution Type */}
                                        <div>
                                            <label className="text-sm font-medium text-white mb-2 block">
                                                Tipo de Resolución
                                            </label>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="resolution_type"
                                                        value="favor_buyer"
                                                        checked={resolutionType === 'favor_buyer'}
                                                        onChange={(e) => setResolutionType(e.target.value as any)}
                                                        className="text-blue-500"
                                                    />
                                                    <span className="text-white text-sm">A favor del comprador</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="resolution_type"
                                                        value="favor_seller"
                                                        checked={resolutionType === 'favor_seller'}
                                                        onChange={(e) => setResolutionType(e.target.value as any)}
                                                        className="text-blue-500"
                                                    />
                                                    <span className="text-white text-sm">A favor del vendedor</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="resolution_type"
                                                        value="partial_refund"
                                                        checked={resolutionType === 'partial_refund'}
                                                        onChange={(e) => setResolutionType(e.target.value as any)}
                                                        className="text-blue-500"
                                                    />
                                                    <span className="text-white text-sm">Reembolso parcial</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="resolution_type"
                                                        value="no_fault"
                                                        checked={resolutionType === 'no_fault'}
                                                        onChange={(e) => setResolutionType(e.target.value as any)}
                                                        className="text-blue-500"
                                                    />
                                                    <span className="text-white text-sm">Sin responsabilidad</span>
                                                </label>
                                            </div>
                                            <p className="text-white/60 text-xs mt-1">
                                                {getResolutionDescription(resolutionType)}
                                            </p>
                                        </div>

                                        {/* Refund Amount */}
                                        {(resolutionType === 'favor_buyer' || resolutionType === 'partial_refund' || resolutionType === 'no_fault') && (
                                            <div>
                                                <label className="text-sm font-medium text-white mb-2 block">
                                                    Monto del Reembolso
                                                </label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max={dispute.purchase.amount}
                                                        value={refundAmount}
                                                        onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                                                        className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                    />
                                                </div>
                                                <p className="text-white/60 text-xs mt-1">
                                                    Máximo: ${dispute.purchase.amount.toFixed(2)}
                                                </p>
                                            </div>
                                        )}

                                        {/* Resolution Description */}
                                        <div>
                                            <label className="text-sm font-medium text-white mb-2 block">
                                                Descripción de la Resolución
                                            </label>
                                            <Textarea
                                                value={data.resolution}
                                                onChange={(e) => setData('resolution', e.target.value)}
                                                placeholder="Explica la decisión tomada y las razones..."
                                                className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:ring-blue-500/50"
                                                rows={4}
                                            />
                                            {errors.resolution && (
                                                <p className="text-red-400 text-xs mt-1">{errors.resolution}</p>
                                            )}
                                        </div>

                                        {/* Admin Notes */}
                                        <div>
                                            <label className="text-sm font-medium text-white mb-2 block">
                                                Notas del Administrador
                                            </label>
                                            <Textarea
                                                value={adminNotes}
                                                onChange={(e) => setAdminNotes(e.target.value)}
                                                placeholder="Notas internas (no visibles para los usuarios)..."
                                                className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:ring-blue-500/50"
                                                rows={3}
                                            />
                                        </div>

                                        {/* Submit Buttons */}
                                        <div className="flex gap-3 pt-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => router.visit('/disputes/admin')}
                                                className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20"
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="flex-1 bg-green-500/80 hover:bg-green-500 text-white border-green-400/50"
                                            >
                                                {processing ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                                        Resolviendo...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Resolver Disputa
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Resolution Preview */}
                            <Card className="bg-white/5 border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white text-sm">
                                        Vista Previa de la Resolución
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <p className="text-white/70">
                                            <span className="font-medium">Tipo:</span> {getResolutionDescription(resolutionType)}
                                        </p>
                                        {(resolutionType === 'favor_buyer' || resolutionType === 'partial_refund' || resolutionType === 'no_fault') && (
                                            <p className="text-white/70">
                                                <span className="font-medium">Reembolso:</span> ${refundAmount.toFixed(2)}
                                            </p>
                                        )}
                                        <p className="text-white/70">
                                            <span className="font-medium">Estado:</span> Resuelta
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

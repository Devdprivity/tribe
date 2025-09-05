import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
    AlertTriangle, 
    ArrowLeft,
    DollarSign,
    User,
    Calendar,
    FileText,
    Upload,
    X
} from 'lucide-react';

interface Purchase {
    id: number;
    product: {
        id: number;
        name: string;
        price: number;
        image_url?: string;
    };
    seller: {
        id: number;
        name: string;
        email: string;
    };
    amount: number;
    status: string;
    created_at: string;
}

interface CreateDisputeProps {
    purchase: Purchase;
}

export default function CreateDispute({ purchase }: CreateDisputeProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        reason: '',
        description: '',
        evidence: '',
        files: [] as File[]
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles(prev => [...prev, ...files]);
        setData('files', [...data.files, ...files]);
    };

    const removeFile = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        setData('files', newFiles);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        post(`/disputes/create/${purchase.id}`, {
            onSuccess: () => {
                router.visit('/marketplace/my-purchases');
            }
        });
    };

    const disputeReasons = [
        { value: 'product_not_delivered', label: 'Producto no entregado' },
        { value: 'product_not_as_described', label: 'Producto no es como se describe' },
        { value: 'product_defective', label: 'Producto defectuoso' },
        { value: 'seller_unresponsive', label: 'Vendedor no responde' },
        { value: 'unauthorized_charge', label: 'Cargo no autorizado' },
        { value: 'refund_not_processed', label: 'Reembolso no procesado' },
        { value: 'other', label: 'Otro' }
    ];

    return (
        <AuthenticatedLayout>
            <Head title={`Crear Disputa - ${purchase.product.name}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <Button
                                variant="outline"
                                onClick={() => router.visit('/marketplace/my-purchases')}
                                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                            <h1 className="text-3xl font-bold text-white">
                                Crear Disputa
                            </h1>
                        </div>
                        <p className="text-white/70">
                            Reporta un problema con tu compra para que podamos ayudarte a resolverlo
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Purchase Information */}
                        <div className="lg:col-span-1">
                            <Card className="bg-white/5 border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Información de la Compra
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-white/70 mb-1">Producto</p>
                                            <div className="flex items-center gap-2">
                                                {purchase.product.image_url && (
                                                    <img
                                                        src={purchase.product.image_url}
                                                        alt={purchase.product.name}
                                                        className="w-10 h-10 rounded object-cover"
                                                    />
                                                )}
                                                <p className="text-white font-medium">
                                                    {purchase.product.name}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-white/70 mb-1">Vendedor</p>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-white/50" />
                                                <p className="text-white">{purchase.seller.name}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-white/70 mb-1">Monto</p>
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4 text-white/50" />
                                                <p className="text-white font-medium">
                                                    ${purchase.amount.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-white/70 mb-1">Fecha de compra</p>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-white/50" />
                                                <p className="text-white text-sm">
                                                    {new Date(purchase.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-white/70 mb-1">Estado</p>
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {purchase.status}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Help Information */}
                            <Card className="bg-white/5 border-white/10 mt-6">
                                <CardHeader>
                                    <CardTitle className="text-white text-sm">
                                        ¿Necesitas ayuda?
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm text-white/70">
                                        <p>• Asegúrate de contactar al vendedor primero</p>
                                        <p>• Proporciona evidencia clara del problema</p>
                                        <p>• Sé específico en tu descripción</p>
                                        <p>• Incluye capturas de pantalla si es necesario</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Dispute Form */}
                        <div className="lg:col-span-2">
                            <Card className="bg-white/5 border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5" />
                                        Detalles de la Disputa
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Reason */}
                                        <div>
                                            <label className="text-sm font-medium text-white mb-2 block">
                                                Motivo de la Disputa *
                                            </label>
                                            <select
                                                value={data.reason}
                                                onChange={(e) => setData('reason', e.target.value)}
                                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            >
                                                <option value="">Selecciona un motivo</option>
                                                {disputeReasons.map((reason) => (
                                                    <option key={reason.value} value={reason.value}>
                                                        {reason.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.reason && (
                                                <p className="text-red-400 text-xs mt-1">{errors.reason}</p>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="text-sm font-medium text-white mb-2 block">
                                                Descripción del Problema *
                                            </label>
                                            <Textarea
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                placeholder="Describe detalladamente el problema que has experimentado. Incluye fechas, comunicaciones con el vendedor, y cualquier información relevante..."
                                                className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:ring-blue-500/50"
                                                rows={6}
                                            />
                                            {errors.description && (
                                                <p className="text-red-400 text-xs mt-1">{errors.description}</p>
                                            )}
                                        </div>

                                        {/* Evidence */}
                                        <div>
                                            <label className="text-sm font-medium text-white mb-2 block">
                                                Evidencia Adicional
                                            </label>
                                            <Textarea
                                                value={data.evidence}
                                                onChange={(e) => setData('evidence', e.target.value)}
                                                placeholder="Proporciona cualquier evidencia adicional, como enlaces a conversaciones, capturas de pantalla, o cualquier otra información que respalde tu caso..."
                                                className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:ring-blue-500/50"
                                                rows={4}
                                            />
                                            {errors.evidence && (
                                                <p className="text-red-400 text-xs mt-1">{errors.evidence}</p>
                                            )}
                                        </div>

                                        {/* File Upload */}
                                        <div>
                                            <label className="text-sm font-medium text-white mb-2 block">
                                                Archivos de Evidencia
                                            </label>
                                            <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*,.pdf,.doc,.docx,.txt"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    id="file-upload"
                                                />
                                                <label
                                                    htmlFor="file-upload"
                                                    className="cursor-pointer flex flex-col items-center gap-2"
                                                >
                                                    <Upload className="h-8 w-8 text-white/50" />
                                                    <span className="text-white/70 text-sm">
                                                        Haz clic para subir archivos
                                                    </span>
                                                    <span className="text-white/50 text-xs">
                                                        Imágenes, PDFs, documentos (máx. 10MB cada uno)
                                                    </span>
                                                </label>
                                            </div>

                                            {/* Selected Files */}
                                            {selectedFiles.length > 0 && (
                                                <div className="mt-4 space-y-2">
                                                    <p className="text-sm text-white/70">Archivos seleccionados:</p>
                                                    {selectedFiles.map((file, index) => (
                                                        <div key={index} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-3">
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="h-4 w-4 text-white/50" />
                                                                <span className="text-white text-sm">{file.name}</span>
                                                                <span className="text-white/50 text-xs">
                                                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                                </span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFile(index)}
                                                                className="text-red-400 hover:text-red-300"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Terms and Conditions */}
                                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                            <h4 className="text-white font-medium mb-2">Términos y Condiciones</h4>
                                            <div className="space-y-2 text-sm text-white/70">
                                                <p>• Al crear una disputa, aceptas que nuestro equipo de soporte revise tu caso</p>
                                                <p>• Proporcionar información falsa puede resultar en la suspensión de tu cuenta</p>
                                                <p>• Las disputas se resuelven típicamente dentro de 5-7 días hábiles</p>
                                                <p>• Te notificaremos por email sobre el progreso de tu disputa</p>
                                            </div>
                                        </div>

                                        {/* Submit Buttons */}
                                        <div className="flex gap-3 pt-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => router.visit('/marketplace/my-purchases')}
                                                className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20"
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={processing || !data.reason || !data.description}
                                                className="flex-1 bg-red-500/80 hover:bg-red-500 text-white border-red-400/50"
                                            >
                                                {processing ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                                        Creando Disputa...
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertTriangle className="h-4 w-4 mr-2" />
                                                        Crear Disputa
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

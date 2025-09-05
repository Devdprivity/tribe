import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Shield, 
    Search, 
    CheckCircle, 
    XCircle,
    AlertTriangle,
    Award,
    Calendar,
    User,
    BookOpen,
    Globe,
    QrCode,
    Download,
    Share2,
    ExternalLink,
    Lock,
    Verified
} from 'lucide-react';

interface VerifiedCertificate {
    id: number;
    certificate_number: string;
    verification_code: string;
    user: {
        name: string;
        email: string;
        avatar?: string;
    };
    certification: {
        name: string;
        category_label: string;
        level_label: string;
        level_color: string;
        issuer: string;
    };
    score: number;
    performance_grade: string;
    issued_at: string;
    expires_at: string | null;
    formatted_issued_at: string;
    formatted_expires_at: string | null;
    is_expired: boolean;
    is_expiring_soon: boolean;
    validity_status: {
        is_valid: boolean;
        label: string;
        color: string;
        description: string;
    };
    verification_url: string;
    certificate_url: string;
    skills_validated: string[];
}

interface Props {
    certificate?: VerifiedCertificate;
    verification_code?: string;
    certificate_number?: string;
    error_message?: string;
}

export default function CertificateVerify({ certificate, verification_code, certificate_number, error_message }: Props) {
    const [searchType, setSearchType] = useState<'code' | 'number'>('code');
    const [searchValue, setSearchValue] = useState(verification_code || certificate_number || '');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async () => {
        if (!searchValue.trim()) return;
        
        setIsSearching(true);
        
        const params = new URLSearchParams();
        if (searchType === 'code') {
            params.append('code', searchValue);
        } else {
            params.append('number', searchValue);
        }
        
        window.location.href = `/certifications/verify?${params.toString()}`;
    };

    const handleShare = () => {
        if (certificate && navigator.share) {
            navigator.share({
                title: `Certificado - ${certificate.certification.name}`,
                text: `Certificado verificado de ${certificate.user.name} en ${certificate.certification.name}`,
                url: window.location.href
            });
        } else if (certificate) {
            navigator.clipboard.writeText(window.location.href);
            alert('Enlace de verificación copiado al portapapeles');
        }
    };

    const getScoreColor = (score: number): string => {
        if (score >= 95) return 'text-green-500';
        if (score >= 90) return 'text-blue-500';
        if (score >= 80) return 'text-yellow-500';
        if (score >= 70) return 'text-orange-500';
        return 'text-red-500';
    };

    const getGradeColor = (grade: string): string => {
        if (['A+', 'A'].includes(grade)) return 'text-green-500';
        if (['B+', 'B'].includes(grade)) return 'text-blue-500';
        if (['C+', 'C'].includes(grade)) return 'text-yellow-500';
        if (['D+', 'D'].includes(grade)) return 'text-orange-500';
        return 'text-red-500';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Verificación de Certificados" />
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <Shield className="h-12 w-12 text-blue-500 mr-4" />
                        <div>
                            <h1 className="text-3xl font-bold text-white">Verificación de Certificados</h1>
                            <p className="text-gray-400">Verifica la autenticidad de cualquier certificado de Tribe</p>
                        </div>
                    </div>
                </div>

                {/* Search Form */}
                <Card className="bg-dark-100 border-dark-200 mb-8">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center">
                            <Search className="mr-2 h-5 w-5" />
                            Verificar Certificado
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            {/* Search Type Toggle */}
                            <div className="flex items-center space-x-4">
                                <Label className="text-white">Buscar por:</Label>
                                <div className="flex space-x-2">
                                    <Button
                                        variant={searchType === 'code' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSearchType('code')}
                                    >
                                        Código de Verificación
                                    </Button>
                                    <Button
                                        variant={searchType === 'number' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSearchType('number')}
                                    >
                                        Número de Certificado
                                    </Button>
                                </div>
                            </div>

                            {/* Search Input */}
                            <div className="space-y-2">
                                <Label htmlFor="search" className="text-white">
                                    {searchType === 'code' 
                                        ? 'Código de Verificación (ej: VER-ABC123-2024)' 
                                        : 'Número de Certificado (ej: CERT-001234)'
                                    }
                                </Label>
                                <div className="flex space-x-2">
                                    <Input
                                        id="search"
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        placeholder={searchType === 'code' 
                                            ? 'Ingresa el código de verificación'
                                            : 'Ingresa el número de certificado'
                                        }
                                        className="bg-dark-200 border-dark-300 text-white"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <Button 
                                        onClick={handleSearch} 
                                        disabled={isSearching || !searchValue.trim()}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Search className="mr-2 h-4 w-4" />
                                        {isSearching ? 'Verificando...' : 'Verificar'}
                                    </Button>
                                </div>
                            </div>

                            {/* Help Text */}
                            <div className="bg-blue-50/5 p-4 rounded-lg">
                                <div className="flex items-start space-x-3">
                                    <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                                    <div className="text-sm text-gray-300">
                                        <p className="font-medium text-blue-400 mb-1">¿Cómo verificar un certificado?</p>
                                        <ul className="space-y-1 text-gray-400">
                                            <li>• El código de verificación se encuentra en el certificado PDF</li>
                                            <li>• El número de certificado aparece en la parte superior del documento</li>
                                            <li>• Ambos métodos proporcionan la misma información de verificación</li>
                                            <li>• Los certificados expirados también pueden ser verificados</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Error Message */}
                {error_message && (
                    <Card className="bg-red-50/5 border-red-600 mb-8">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-3">
                                <XCircle className="h-8 w-8 text-red-500" />
                                <div>
                                    <h3 className="text-red-500 font-semibold mb-1">Certificado No Encontrado</h3>
                                    <p className="text-gray-300">{error_message}</p>
                                    <div className="mt-3 text-sm text-gray-400">
                                        <p>Posibles causas:</p>
                                        <ul className="list-disc list-inside mt-1 space-y-1">
                                            <li>El código o número ingresado es incorrecto</li>
                                            <li>El certificado ha sido revocado</li>
                                            <li>El formato del código no es válido</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Certificate Verification Result */}
                {certificate && (
                    <div className="space-y-6">
                        {/* Verification Status */}
                        <Card className={`border-2 ${certificate.validity_status.is_valid ? 'border-green-500 bg-green-50/5' : 'border-red-500 bg-red-50/5'}`}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                                            certificate.validity_status.is_valid ? 'bg-green-600' : 'bg-red-600'
                                        }`}>
                                            {certificate.validity_status.is_valid ? (
                                                <Verified className="h-8 w-8 text-white" />
                                            ) : (
                                                <XCircle className="h-8 w-8 text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <h2 className={`text-2xl font-bold ${certificate.validity_status.color}`}>
                                                {certificate.validity_status.label}
                                            </h2>
                                            <p className="text-gray-400">
                                                {certificate.validity_status.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Button
                                            variant="outline"
                                            onClick={handleShare}
                                        >
                                            <Share2 className="mr-2 h-4 w-4" />
                                            Compartir
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Certificate Details */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Certificate Info */}
                            <div className="lg:col-span-2">
                                <Card className="bg-dark-100 border-dark-200">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center">
                                            <Award className="mr-2 h-5 w-5 text-yellow-500" />
                                            Información del Certificado
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Certificate Title */}
                                        <div>
                                            <h3 className="text-xl font-semibold text-white mb-2">
                                                {certificate.certification.name}
                                            </h3>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="secondary" className={certificate.certification.level_color}>
                                                    {certificate.certification.level_label}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {certificate.certification.category_label}
                                                </Badge>
                                                {certificate.is_expiring_soon && (
                                                    <Badge className="bg-yellow-600">
                                                        Por Vencer
                                                    </Badge>
                                                )}
                                                {certificate.is_expired && (
                                                    <Badge className="bg-red-600">
                                                        Expirado
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Certificate Holder */}
                                        <div className="flex items-center space-x-3 p-4 bg-dark-200 rounded-lg">
                                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                                {certificate.user.avatar ? (
                                                    <img 
                                                        src={certificate.user.avatar} 
                                                        alt={certificate.user.name}
                                                        className="w-12 h-12 rounded-full"
                                                    />
                                                ) : (
                                                    <User className="h-6 w-6 text-white" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">Certificado otorgado a:</p>
                                                <p className="text-lg font-semibold text-white">{certificate.user.name}</p>
                                                <p className="text-sm text-gray-400">{certificate.user.email}</p>
                                            </div>
                                        </div>

                                        {/* Performance */}
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="text-center p-4 bg-dark-200 rounded-lg">
                                                <p className={`text-3xl font-bold ${getScoreColor(certificate.score)}`}>
                                                    {certificate.score}%
                                                </p>
                                                <p className="text-gray-400">Puntuación Final</p>
                                            </div>
                                            <div className="text-center p-4 bg-dark-200 rounded-lg">
                                                <p className={`text-3xl font-bold ${getGradeColor(certificate.performance_grade)}`}>
                                                    {certificate.performance_grade}
                                                </p>
                                                <p className="text-gray-400">Grado Obtenido</p>
                                            </div>
                                        </div>

                                        {/* Skills Validated */}
                                        {certificate.skills_validated.length > 0 && (
                                            <div>
                                                <h4 className="text-white font-medium mb-3 flex items-center">
                                                    <BookOpen className="mr-2 h-4 w-4" />
                                                    Habilidades Validadas
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {certificate.skills_validated.map((skill, index) => (
                                                        <Badge key={index} variant="outline" className="text-sm">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-3 pt-4 border-t border-dark-300">
                                            <Button
                                                onClick={() => window.open(certificate.certificate_url, '_blank')}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Ver Certificado Completo
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => window.open(certificate.verification_url, '_blank')}
                                            >
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                Enlace Permanente
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Verification Details Sidebar */}
                            <div className="space-y-6">
                                {/* Verification Info */}
                                <Card className="bg-dark-100 border-dark-200">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center text-lg">
                                            <Lock className="mr-2 h-5 w-5" />
                                            Detalles de Verificación
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 text-sm">
                                        <div>
                                            <p className="text-gray-400">Número de Certificado:</p>
                                            <p className="text-white font-mono">{certificate.certificate_number}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Código de Verificación:</p>
                                            <p className="text-white font-mono">{certificate.verification_code}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Fecha de Emisión:</p>
                                            <p className="text-white">{certificate.formatted_issued_at}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Fecha de Vencimiento:</p>
                                            <p className="text-white">
                                                {certificate.formatted_expires_at || 'Sin vencimiento'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Institución Emisora:</p>
                                            <p className="text-white">{certificate.certification.issuer || 'Tribe Academy'}</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* QR Code */}
                                <Card className="bg-dark-100 border-dark-200">
                                    <CardHeader>
                                        <CardTitle className="text-white text-lg">Verificación Rápida</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-center">
                                        <div className="w-32 h-32 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
                                            <QrCode className="h-24 w-24 text-gray-800" />
                                        </div>
                                        <p className="text-sm text-gray-400">
                                            Escanea este código QR para verificación rápida
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Security Notice */}
                                <Card className="bg-blue-50/5 border-blue-600">
                                    <CardContent className="p-4">
                                        <div className="flex items-start space-x-3">
                                            <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                                            <div className="text-sm">
                                                <p className="font-medium text-blue-400 mb-2">Certificado Seguro</p>
                                                <ul className="space-y-1 text-gray-400">
                                                    <li>• Verificación criptográfica</li>
                                                    <li>• No puede ser falsificado</li>
                                                    <li>• Validez verificable 24/7</li>
                                                    <li>• Registro inmutable</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Validity Warnings */}
                                {(certificate.is_expired || certificate.is_expiring_soon) && (
                                    <Card className={`border-2 ${certificate.is_expired ? 'border-red-500 bg-red-50/5' : 'border-yellow-500 bg-yellow-50/5'}`}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start space-x-3">
                                                <AlertTriangle className={`h-5 w-5 mt-0.5 ${certificate.is_expired ? 'text-red-500' : 'text-yellow-500'}`} />
                                                <div className="text-sm">
                                                    <p className={`font-medium mb-1 ${certificate.is_expired ? 'text-red-400' : 'text-yellow-400'}`}>
                                                        {certificate.is_expired ? 'Certificado Expirado' : 'Certificado por Vencer'}
                                                    </p>
                                                    <p className="text-gray-400">
                                                        {certificate.is_expired 
                                                            ? 'Este certificado ha expirado y puede requerir renovación.'
                                                            : 'Este certificado vencerá pronto. Considera renovarlo.'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* No Search Performed */}
                {!certificate && !error_message && !verification_code && !certificate_number && (
                    <Card className="bg-dark-100 border-dark-200">
                        <CardContent className="text-center py-12">
                            <Shield className="h-16 w-16 text-gray-500 mx-auto mb-6" />
                            <h3 className="text-xl font-semibold text-white mb-4">
                                Verificación de Certificados de Tribe
                            </h3>
                            <div className="max-w-2xl mx-auto text-gray-400 space-y-4">
                                <p>
                                    Verifica la autenticidad de cualquier certificado emitido por Tribe Academy. 
                                    Nuestro sistema de verificación garantiza que todos los certificados sean auténticos 
                                    y no puedan ser falsificados.
                                </p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                                    <div className="text-center">
                                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
                                        <h4 className="text-white font-medium mb-2">100% Seguro</h4>
                                        <p className="text-sm">Verificación criptográfica que no puede ser falsificada</p>
                                    </div>
                                    
                                    <div className="text-center">
                                        <Globe className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                                        <h4 className="text-white font-medium mb-2">Acceso Global</h4>
                                        <p className="text-sm">Verifica certificados desde cualquier lugar del mundo</p>
                                    </div>
                                    
                                    <div className="text-center">
                                        <Clock className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                                        <h4 className="text-white font-medium mb-2">24/7 Disponible</h4>
                                        <p className="text-sm">Sistema de verificación disponible las 24 horas</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
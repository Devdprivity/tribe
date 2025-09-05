import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Award, 
    Download, 
    Share2, 
    Calendar,
    Shield,
    Star,
    QrCode,
    ExternalLink,
    Printer,
    Eye,
    EyeOff,
    Globe,
    Lock,
    CheckCircle,
    Trophy,
    Medal,
    Verified
} from 'lucide-react';

interface Certificate {
    id: number;
    certificate_number: string;
    verification_code: string;
    user: {
        name: string;
        email: string;
        avatar?: string;
        profile?: {
            title?: string;
            location?: string;
        };
    };
    certification: {
        id: number;
        name: string;
        category_label: string;
        level_label: string;
        level_color: string;
        description: string;
        skills_covered: string[];
        issuer?: string;
        logo?: string;
    };
    score: number;
    performance_grade: string;
    issued_at: string;
    expires_at: string | null;
    formatted_issued_at: string;
    formatted_expires_at: string | null;
    certificate_age: string;
    is_expired: boolean;
    is_expiring_soon: boolean;
    is_public: boolean;
    validity_label: string;
    verification_url: string;
    certificate_url: string;
    skills_validated: string[];
    qr_code_url?: string;
    attempt?: {
        time_spent_minutes: number;
        completed_at: string;
    };
}

interface Props {
    certificate: Certificate;
    is_owner: boolean;
    can_view_private: boolean;
}

export default function CertificateView({ certificate, is_owner, can_view_private }: Props) {
    const [showPersonalInfo, setShowPersonalInfo] = useState(is_owner || certificate.is_public);
    const [isPrintMode, setIsPrintMode] = useState(false);

    const handleDownload = () => {
        window.open(certificate.certificate_url, '_blank');
    };

    const handlePrint = () => {
        setIsPrintMode(true);
        setTimeout(() => {
            window.print();
            setIsPrintMode(false);
        }, 100);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `Certificado - ${certificate.certification.name}`,
                text: `Certificado de ${certificate.user.name} en ${certificate.certification.name}`,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Enlace copiado al portapapeles');
        }
    };

    const handleVerify = () => {
        window.open(certificate.verification_url, '_blank');
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

    if (!can_view_private && !certificate.is_public && !is_owner) {
        return (
            <AuthenticatedLayout>
                <Head title="Certificado Privado" />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Card className="bg-dark-100 border-dark-200">
                        <CardContent className="text-center py-12">
                            <Lock className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">Certificado Privado</h3>
                            <p className="text-gray-400 mb-4">
                                Este certificado es privado y no puede ser visualizado públicamente.
                            </p>
                            <Button onClick={() => window.history.back()}>
                                Volver
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title={`Certificado - ${certificate.certification.name}`} />
            
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Actions Bar - Hidden in print mode */}
                {!isPrintMode && (
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">Certificado Digital</h1>
                            <p className="text-gray-400">Certificado verificable emitido por Tribe Academy</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {is_owner && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowPersonalInfo(!showPersonalInfo)}
                                >
                                    {showPersonalInfo ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                                    {showPersonalInfo ? 'Ocultar Info' : 'Mostrar Info'}
                                </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={handlePrint}>
                                <Printer className="mr-2 h-4 w-4" />
                                Imprimir
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleShare}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Compartir
                            </Button>
                            <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
                                <Download className="mr-2 h-4 w-4" />
                                Descargar PDF
                            </Button>
                        </div>
                    </div>
                )}

                {/* Certificate Document */}
                <div className={`${isPrintMode ? 'print:block' : ''}`}>
                    <Card className="bg-white border-gray-200 shadow-2xl">
                        <CardContent className="p-0">
                            {/* Certificate Header */}
                            <div className="relative overflow-hidden">
                                {/* Background Pattern */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50">
                                    <div className="absolute inset-0 opacity-5">
                                        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-blue-200 rounded-full"></div>
                                        <div className="absolute top-20 right-20 w-24 h-24 border border-blue-200 rounded-full"></div>
                                        <div className="absolute bottom-20 left-20 w-20 h-20 border border-blue-200 rounded-full"></div>
                                    </div>
                                </div>

                                {/* Header Content */}
                                <div className="relative z-10 p-12 text-center">
                                    <div className="flex items-center justify-center mb-8">
                                        {certificate.certification.logo ? (
                                            <img 
                                                src={certificate.certification.logo} 
                                                alt="Logo" 
                                                className="h-16 w-auto mr-4"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                                                <Award className="h-10 w-10 text-white" />
                                            </div>
                                        )}
                                        <div className="text-left">
                                            <h1 className="text-2xl font-bold text-gray-800">
                                                {certificate.certification.issuer || 'Tribe Academy'}
                                            </h1>
                                            <p className="text-gray-600">Plataforma de Certificaciones Técnicas</p>
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <h2 className="text-4xl font-bold text-gray-800 mb-4">
                                            CERTIFICADO DE COMPETENCIA
                                        </h2>
                                        <div className="w-32 h-1 bg-blue-600 mx-auto"></div>
                                    </div>

                                    {/* Recipient */}
                                    <div className="mb-8">
                                        <p className="text-lg text-gray-600 mb-2">Se certifica que</p>
                                        {showPersonalInfo ? (
                                            <div>
                                                <h3 className="text-3xl font-bold text-gray-800 mb-2">
                                                    {certificate.user.name}
                                                </h3>
                                                {certificate.user.profile?.title && (
                                                    <p className="text-lg text-gray-600 mb-1">
                                                        {certificate.user.profile.title}
                                                    </p>
                                                )}
                                                {certificate.user.profile?.location && (
                                                    <p className="text-gray-500">
                                                        {certificate.user.profile.location}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <div className="inline-block bg-gray-200 px-6 py-3 rounded">
                                                    <p className="text-gray-600">
                                                        [Información personal oculta]
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Certification Details */}
                                    <div className="mb-8">
                                        <p className="text-lg text-gray-600 mb-4">
                                            ha demostrado competencia y dominio en
                                        </p>
                                        <h4 className="text-2xl font-bold text-gray-800 mb-4">
                                            {certificate.certification.name}
                                        </h4>
                                        <div className="flex items-center justify-center gap-4 mb-4">
                                            <Badge 
                                                className={`px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200`}
                                            >
                                                {certificate.certification.level_label}
                                            </Badge>
                                            <Badge className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                {certificate.certification.category_label}
                                            </Badge>
                                        </div>
                                        <p className="text-gray-600 max-w-2xl mx-auto">
                                            {certificate.certification.description}
                                        </p>
                                    </div>

                                    {/* Performance */}
                                    <div className="mb-8">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                                            <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
                                                <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                                                <p className="text-2xl font-bold text-gray-800">{certificate.score}%</p>
                                                <p className="text-gray-600">Puntuación</p>
                                            </div>
                                            <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
                                                <Medal className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                                                <p className="text-2xl font-bold text-gray-800">{certificate.performance_grade}</p>
                                                <p className="text-gray-600">Grado</p>
                                            </div>
                                            <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
                                                <Calendar className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                                <p className="text-lg font-bold text-gray-800">{certificate.formatted_issued_at}</p>
                                                <p className="text-gray-600">Fecha</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    {certificate.skills_validated.length > 0 && (
                                        <div className="mb-8">
                                            <h5 className="text-lg font-semibold text-gray-800 mb-4">
                                                Habilidades Validadas
                                            </h5>
                                            <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
                                                {certificate.skills_validated.map((skill, index) => (
                                                    <span 
                                                        key={index}
                                                        className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-full text-sm"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Certificate Numbers and Verification */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                        <div className="text-center">
                                            <h6 className="text-sm font-semibold text-gray-600 mb-2">
                                                NÚMERO DE CERTIFICADO
                                            </h6>
                                            <p className="text-lg font-mono text-gray-800 bg-gray-50 px-4 py-2 rounded border">
                                                {certificate.certificate_number}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <h6 className="text-sm font-semibold text-gray-600 mb-2">
                                                CÓDIGO DE VERIFICACIÓN
                                            </h6>
                                            <p className="text-lg font-mono text-gray-800 bg-gray-50 px-4 py-2 rounded border">
                                                {certificate.verification_code}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Validity */}
                                    <div className="mb-8">
                                        <div className="flex items-center justify-center mb-2">
                                            <Verified className="h-6 w-6 text-green-500 mr-2" />
                                            <span className="text-green-600 font-semibold">
                                                {certificate.is_expired ? 'Certificado Expirado' : 'Certificado Válido'}
                                            </span>
                                        </div>
                                        <p className="text-gray-600">
                                            {certificate.expires_at 
                                                ? `Válido hasta: ${certificate.formatted_expires_at}`
                                                : 'Certificado con validez permanente'
                                            }
                                        </p>
                                    </div>

                                    {/* Footer */}
                                    <div className="border-t border-gray-200 pt-8">
                                        <div className="flex items-center justify-between">
                                            <div className="text-left">
                                                <div className="w-32 h-16 border-b-2 border-gray-300 mb-2"></div>
                                                <p className="text-sm text-gray-600 font-semibold">Director Académico</p>
                                                <p className="text-xs text-gray-500">Tribe Academy</p>
                                            </div>
                                            
                                            <div className="text-center">
                                                {certificate.qr_code_url ? (
                                                    <img 
                                                        src={certificate.qr_code_url} 
                                                        alt="QR Code" 
                                                        className="w-20 h-20 mx-auto mb-2"
                                                    />
                                                ) : (
                                                    <div className="w-20 h-20 bg-gray-100 border-2 border-gray-300 rounded mx-auto mb-2 flex items-center justify-center">
                                                        <QrCode className="h-12 w-12 text-gray-400" />
                                                    </div>
                                                )}
                                                <p className="text-xs text-gray-500">Verificar en línea</p>
                                            </div>
                                            
                                            <div className="text-right">
                                                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                                                    <Shield className="h-10 w-10 text-white" />
                                                </div>
                                                <p className="text-xs text-gray-500">Sello Digital</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Verification URL */}
                                    <div className="text-center mt-8 pt-4 border-t border-gray-200">
                                        <p className="text-xs text-gray-500">
                                            Verifica la autenticidad de este certificado en:
                                        </p>
                                        <p className="text-sm text-blue-600 font-mono">
                                            {window.location.origin}/certifications/verify
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Info - Not shown in print */}
                {!isPrintMode && (
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Verification */}
                        <Card className="bg-dark-100 border-dark-200">
                            <CardContent className="p-6 text-center">
                                <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                <h3 className="text-white font-semibold mb-2">Certificado Verificable</h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Este certificado puede ser verificado por terceros usando el código de verificación.
                                </p>
                                <Button variant="outline" onClick={handleVerify} className="w-full">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Verificar Ahora
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Privacy */}
                        <Card className="bg-dark-100 border-dark-200">
                            <CardContent className="p-6 text-center">
                                {certificate.is_public ? (
                                    <Globe className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                                ) : (
                                    <Lock className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                                )}
                                <h3 className="text-white font-semibold mb-2">
                                    {certificate.is_public ? 'Certificado Público' : 'Certificado Privado'}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    {certificate.is_public 
                                        ? 'Este certificado es visible públicamente en el perfil del usuario.'
                                        : 'Este certificado es privado y solo puede ser visto por el propietario.'
                                    }
                                </p>
                            </CardContent>
                        </Card>

                        {/* Stats */}
                        {certificate.attempt && (
                            <Card className="bg-dark-100 border-dark-200">
                                <CardContent className="p-6 text-center">
                                    <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                                    <h3 className="text-white font-semibold mb-2">Detalles del Examen</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Tiempo empleado:</span>
                                            <span className="text-white">{certificate.attempt.time_spent_minutes} min</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Completado:</span>
                                            <span className="text-white">{certificate.attempt.completed_at}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:block, .print\\:block * {
                        visibility: visible;
                    }
                    .print\\:block {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    @page {
                        size: A4;
                        margin: 0;
                    }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
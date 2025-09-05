import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Award, 
    Calendar, 
    Search,
    Filter,
    Download,
    ExternalLink,
    Shield,
    Star,
    Trophy,
    CheckCircle,
    Globe,
    Eye,
    User,
    BookOpen,
    Target,
    TrendingUp,
    Mail,
    MapPin,
    Link as LinkIcon,
    Share2,
    Verified
} from 'lucide-react';

interface UserCertificate {
    id: number;
    certification: {
        id: number;
        name: string;
        category_label: string;
        level_label: string;
        level_color: string;
        description: string;
        skills_covered: string[];
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
    certificate_number: string;
    verification_code: string;
    certificate_url: string;
    verification_url: string;
    skills_validated: string[];
}

interface UserProfile {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    profile?: {
        title?: string;
        bio?: string;
        location?: string;
        website?: string;
        social_links?: Record<string, string>;
        years_experience?: number;
        specializations?: string[];
        skills?: string[];
    };
    portfolio?: {
        slug: string;
        tagline?: string;
        is_public: boolean;
        available_for_hire: boolean;
        rating?: number;
        views_count: number;
    };
}

interface CertificateStats {
    total_certificates: number;
    active_certificates: number;
    expired_certificates: number;
    average_score: number;
    highest_score: number;
    categories_covered: number;
    skills_validated_count: number;
    most_recent_date: string;
    certificates_this_year: number;
}

interface Props {
    user: UserProfile;
    certificates: UserCertificate[];
    stats: CertificateStats;
    categories: Record<string, string>;
    levels: Record<string, string>;
    skills_breakdown: Record<string, number>;
    is_owner: boolean;
    can_contact: boolean;
}

export default function PublicCertificatePortfolio({ 
    user, 
    certificates, 
    stats, 
    categories, 
    levels, 
    skills_breakdown,
    is_owner,
    can_contact 
}: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    // Filter certificates
    const filteredCertificates = certificates.filter(cert => {
        const matchesSearch = cert.certification.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || cert.certification.category_label === selectedCategory;
        const matchesLevel = !selectedLevel || cert.certification.level_label === selectedLevel;
        const matchesStatus = !selectedStatus || 
            (selectedStatus === 'active' && !cert.is_expired) ||
            (selectedStatus === 'expired' && cert.is_expired);
        return matchesSearch && matchesCategory && matchesLevel && matchesStatus;
    });

    // Get unique categories and levels from certificates
    const availableCategories = [...new Set(certificates.map(cert => cert.certification.category_label))];
    const availableLevels = [...new Set(certificates.map(cert => cert.certification.level_label))];

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `Certificaciones de ${user.name}`,
                text: `Mira las certificaciones técnicas de ${user.name} en Tribe Academy`,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Enlace copiado al portapapeles');
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

    // Check if user profile is private
    if (!user.portfolio?.is_public && !is_owner) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Card className="bg-dark-100 border-dark-200 max-w-md w-full mx-4">
                    <CardContent className="text-center py-12">
                        <Shield className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Perfil Privado</h3>
                        <p className="text-gray-400 mb-4">
                            Este portafolio de certificaciones es privado.
                        </p>
                        <Button onClick={() => window.location.href = '/'}>
                            Volver al Inicio
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <Head title={`Certificaciones de ${user.name} | Tribe Academy`} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-6">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                {user.avatar ? (
                                    <img 
                                        src={user.avatar} 
                                        alt={user.name}
                                        className="w-24 h-24 rounded-full border-4 border-blue-500"
                                    />
                                ) : (
                                    <div className="w-24 h-24 bg-blue-600 rounded-full border-4 border-blue-500 flex items-center justify-center">
                                        <User className="h-12 w-12 text-white" />
                                    </div>
                                )}
                            </div>

                            {/* User Info */}
                            <div className="flex-1">
                                <div className="flex items-center mb-2">
                                    <h1 className="text-3xl font-bold text-white mr-3">{user.name}</h1>
                                    {user.portfolio?.is_public && (
                                        <Verified className="h-6 w-6 text-blue-500" title="Perfil verificado" />
                                    )}
                                </div>
                                
                                {user.profile?.title && (
                                    <p className="text-xl text-blue-400 mb-2">{user.profile.title}</p>
                                )}
                                
                                {user.portfolio?.tagline && (
                                    <p className="text-gray-300 mb-4">{user.portfolio.tagline}</p>
                                )}

                                <div className="flex items-center gap-6 text-sm text-gray-400">
                                    {user.profile?.location && (
                                        <div className="flex items-center">
                                            <MapPin className="h-4 w-4 mr-1" />
                                            {user.profile.location}
                                        </div>
                                    )}
                                    {user.profile?.website && (
                                        <a 
                                            href={user.profile.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center hover:text-blue-400 transition-colors"
                                        >
                                            <LinkIcon className="h-4 w-4 mr-1" />
                                            Sitio web
                                        </a>
                                    )}
                                    <div className="flex items-center">
                                        <Eye className="h-4 w-4 mr-1" />
                                        {user.portfolio?.views_count || 0} visualizaciones
                                    </div>
                                </div>

                                {/* Availability Status */}
                                {user.portfolio?.available_for_hire && (
                                    <div className="mt-4">
                                        <Badge className="bg-green-600 text-white">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Disponible para contratar
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <Button variant="outline" onClick={handleShare}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Compartir
                            </Button>
                            {can_contact && !is_owner && (
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Mail className="mr-2 h-4 w-4" />
                                    Contactar
                                </Button>
                            )}
                            {user.portfolio?.slug && (
                                <Button 
                                    variant="outline"
                                    onClick={() => window.location.href = `/portfolio/${user.portfolio?.slug}`}
                                >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Ver Portafolio Completo
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Bio */}
                    {user.profile?.bio && (
                        <div className="mt-6 p-4 bg-dark-100 border border-dark-200 rounded-lg">
                            <p className="text-gray-300">{user.profile.bio}</p>
                        </div>
                    )}
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-dark-100 border-dark-200">
                        <CardContent className="p-6 text-center">
                            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                            <p className="text-2xl font-bold text-white">{stats.total_certificates}</p>
                            <p className="text-gray-400">Certificaciones</p>
                            <p className="text-sm text-gray-500 mt-1">
                                {stats.certificates_this_year} este año
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-dark-100 border-dark-200">
                        <CardContent className="p-6 text-center">
                            <Target className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                            <p className="text-2xl font-bold text-white">{stats.average_score}%</p>
                            <p className="text-gray-400">Puntuación Promedio</p>
                            <p className="text-sm text-green-500 mt-1">
                                Máxima: {stats.highest_score}%
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-dark-100 border-dark-200">
                        <CardContent className="p-6 text-center">
                            <BookOpen className="h-8 w-8 text-green-500 mx-auto mb-3" />
                            <p className="text-2xl font-bold text-white">{stats.categories_covered}</p>
                            <p className="text-gray-400">Categorías</p>
                            <p className="text-sm text-gray-500 mt-1">
                                {stats.skills_validated_count} skills validadas
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-dark-100 border-dark-200">
                        <CardContent className="p-6 text-center">
                            <Calendar className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                            <p className="text-2xl font-bold text-white">{stats.active_certificates}</p>
                            <p className="text-gray-400">Vigentes</p>
                            <p className="text-sm text-gray-500 mt-1">
                                Última: {stats.most_recent_date}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Filters */}
                        <Card className="bg-dark-100 border-dark-200 mb-8">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Buscar certificaciones..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 bg-dark-200 border-dark-300 text-white"
                                        />
                                    </div>

                                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                        <SelectTrigger className="w-48 bg-dark-200 border-dark-300 text-white">
                                            <SelectValue placeholder="Categoría" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-dark-200 border-dark-300">
                                            <SelectItem value="all">Todas</SelectItem>
                                            {availableCategories.map(category => (
                                                <SelectItem key={category} value={category}>{category}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                                        <SelectTrigger className="w-32 bg-dark-200 border-dark-300 text-white">
                                            <SelectValue placeholder="Nivel" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-dark-200 border-dark-300">
                                            <SelectItem value="all">Todos</SelectItem>
                                            {availableLevels.map(level => (
                                                <SelectItem key={level} value={level}>{level}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                        <SelectTrigger className="w-32 bg-dark-200 border-dark-300 text-white">
                                            <SelectValue placeholder="Estado" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-dark-200 border-dark-300">
                                            <SelectItem value="">Todos</SelectItem>
                                            <SelectItem value="active">Vigentes</SelectItem>
                                            <SelectItem value="expired">Expirados</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Certificates Grid */}
                        <div className="space-y-6">
                            {filteredCertificates.map((cert) => (
                                <Card key={cert.id} className="bg-dark-100 border-dark-200 hover:border-blue-500 transition-colors">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <h3 className="text-lg font-semibold text-white">
                                                        {cert.certification.name}
                                                    </h3>
                                                    <Badge variant="secondary" className={cert.certification.level_color}>
                                                        {cert.certification.level_label}
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        {cert.certification.category_label}
                                                    </Badge>
                                                    {cert.is_expired && (
                                                        <Badge className="bg-red-600">
                                                            Expirado
                                                        </Badge>
                                                    )}
                                                    {cert.is_expiring_soon && !cert.is_expired && (
                                                        <Badge className="bg-yellow-600">
                                                            Por Vencer
                                                        </Badge>
                                                    )}
                                                </div>

                                                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                                                    {cert.certification.description}
                                                </p>

                                                {/* Skills */}
                                                <div className="mb-4">
                                                    <p className="text-gray-400 text-xs mb-2">Habilidades validadas:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {cert.skills_validated.slice(0, 5).map((skill, index) => (
                                                            <Badge key={index} variant="outline" className="text-xs">
                                                                {skill}
                                                            </Badge>
                                                        ))}
                                                        {cert.skills_validated.length > 5 && (
                                                            <Badge variant="outline" className="text-xs">
                                                                +{cert.skills_validated.length - 5} más
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-400">Puntuación</p>
                                                        <p className={`font-semibold ${getScoreColor(cert.score)}`}>
                                                            {cert.score}% ({cert.performance_grade})
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-400">Obtenido</p>
                                                        <p className="text-white">{cert.formatted_issued_at}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-400">Vencimiento</p>
                                                        <p className="text-white">
                                                            {cert.formatted_expires_at || 'Sin vencimiento'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-400">Certificado</p>
                                                        <p className="text-white font-mono text-xs">
                                                            {cert.certificate_number}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2 ml-4">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => window.open(cert.verification_url, '_blank')}
                                                >
                                                    <Shield className="mr-1 h-4 w-4" />
                                                    Verificar
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => window.open(cert.certificate_url, '_blank')}
                                                >
                                                    <Download className="mr-1 h-4 w-4" />
                                                    Ver
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {filteredCertificates.length === 0 && (
                                <Card className="bg-dark-100 border-dark-200">
                                    <CardContent className="text-center py-12">
                                        <Trophy className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-white mb-2">
                                            No se encontraron certificaciones
                                        </h3>
                                        <p className="text-gray-400">
                                            Intenta ajustar los filtros de búsqueda
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Skills Breakdown */}
                        {Object.keys(skills_breakdown).length > 0 && (
                            <Card className="bg-dark-100 border-dark-200">
                                <CardHeader>
                                    <CardTitle className="text-white text-lg flex items-center">
                                        <Star className="mr-2 h-5 w-5" />
                                        Skills Principales
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {Object.entries(skills_breakdown)
                                            .sort(([,a], [,b]) => b - a)
                                            .slice(0, 8)
                                            .map(([skill, count]) => (
                                                <div key={skill} className="flex items-center justify-between">
                                                    <span className="text-white text-sm">{skill}</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {count} cert{count !== 1 ? 's' : ''}
                                                    </Badge>
                                                </div>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Specializations */}
                        {user.profile?.specializations && user.profile.specializations.length > 0 && (
                            <Card className="bg-dark-100 border-dark-200">
                                <CardHeader>
                                    <CardTitle className="text-white text-lg">Especializaciones</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {user.profile.specializations.map((spec, index) => (
                                            <Badge key={index} variant="secondary" className="text-sm">
                                                {spec}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Experience */}
                        {user.profile?.years_experience && (
                            <Card className="bg-dark-100 border-dark-200">
                                <CardHeader>
                                    <CardTitle className="text-white text-lg">Experiencia</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-blue-500 mb-1">
                                            {user.profile.years_experience}+
                                        </p>
                                        <p className="text-gray-400">Años de experiencia</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Contact Info */}
                        {can_contact && (
                            <Card className="bg-dark-100 border-dark-200">
                                <CardHeader>
                                    <CardTitle className="text-white text-lg">Contacto</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                        <Mail className="mr-2 h-4 w-4" />
                                        Enviar Mensaje
                                    </Button>
                                    
                                    {/* Social Links */}
                                    {user.profile?.social_links && (
                                        <div className="pt-3 border-t border-dark-300">
                                            <p className="text-gray-400 text-sm mb-3">Redes sociales:</p>
                                            <div className="space-y-2">
                                                {Object.entries(user.profile.social_links).map(([platform, url]) => (
                                                    <a
                                                        key={platform}
                                                        href={url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center text-blue-400 hover:text-blue-300 transition-colors text-sm"
                                                    >
                                                        <ExternalLink className="h-3 w-3 mr-2" />
                                                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Verification Notice */}
                        <Card className="bg-blue-50/5 border-blue-600">
                            <CardContent className="p-4">
                                <div className="flex items-start space-x-3">
                                    <Verified className="h-5 w-5 text-blue-500 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-medium text-blue-400 mb-2">Certificaciones Verificadas</p>
                                        <p className="text-gray-400">
                                            Todas las certificaciones mostradas han sido verificadas por Tribe Academy 
                                            y pueden ser validadas por terceros usando los códigos de verificación.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-dark-300 text-center">
                    <div className="flex items-center justify-center space-x-2 text-gray-400">
                        <Globe className="h-4 w-4" />
                        <span>Powered by</span>
                        <a href="/" className="text-blue-400 hover:text-blue-300 font-medium">
                            Tribe Academy
                        </a>
                        <span>•</span>
                        <span>Certificaciones verificables y seguras</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
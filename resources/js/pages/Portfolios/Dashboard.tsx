import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  User, 
  Settings, 
  Eye, 
  Edit,
  Plus,
  MoreVertical,
  TrendingUp,
  Users,
  MessageSquare,
  Award,
  Code,
  Briefcase,
  GraduationCap,
  Star,
  ExternalLink,
  Calendar,
  MapPin,
  Share2,
  Download,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { useState } from 'react';

interface Portfolio {
  id: number;
  slug: string;
  title: string;
  bio: string;
  tagline: string;
  specializations: string[];
  tech_stack: string[];
  avatar_url?: string;
  location: string;
  available_for_hire: boolean;
  views_count: number;
  rating: number;
  reviews_count: number;
  formatted_specializations: string[];
  availability_status: string;
  availability_color: string;
  last_updated: string;
  profile_completion_status: {
    percentage: number;
    status: string;
    color: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
    username: string;
    avatar_url?: string;
  };
  projects: Project[];
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  testimonials: Testimonial[];
  analytics: Analytics;
}

interface Project {
  id: number;
  title: string;
  description: string;
  image_url?: string;
  demo_url?: string;
  github_url?: string;
  technologies: string[];
  is_featured: boolean;
  completed_at: string;
}

interface Experience {
  id: number;
  company: string;
  position: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  location: string;
}

interface Education {
  id: number;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date?: string;
}

interface Skill {
  id: number;
  name: string;
  category: string;
  proficiency_level: number;
  is_primary: boolean;
}

interface Testimonial {
  id: number;
  client_name: string;
  content: string;
  rating: number;
  is_approved: boolean;
  created_at: string;
}

interface Analytics {
  views_this_month: number;
  profile_visits: number;
  contact_clicks: number;
  recent_activity: Array<{
    type: string;
    description: string;
    date: string;
  }>;
}

export default function Dashboard() {
  const { portfolio } = usePage<{ portfolio: Portfolio }>().props;
  const [activeTab, setActiveTab] = useState('overview');

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletionStatus = (percentage: number) => {
    if (percentage >= 90) return 'Excelente';
    if (percentage >= 70) return 'Bueno';
    if (percentage >= 50) return 'Regular';
    return 'Necesita mejoras';
  };

  const recentActivity = portfolio.analytics.recent_activity || [
    { type: 'view', description: 'Tu portfolio fue visto', date: 'hace 2 horas' },
    { type: 'contact', description: 'Alguien descargó tu CV', date: 'hace 1 día' },
    { type: 'update', description: 'Actualizaste tu biografía', date: 'hace 3 días' },
  ];

  return (
    <AuthenticatedLayout>
      <Head title={`Dashboard - ${portfolio.title}`} />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mi Portfolio</h1>
                <p className="mt-2 text-gray-600">
                  Administra tu portfolio profesional y revisa tus estadísticas.
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-3">
                <Button variant="outline" asChild>
                  <Link href={route('portfolios.show', portfolio.slug)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Portfolio
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={route('portfolios.edit', portfolio.slug)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Resumen</TabsTrigger>
                  <TabsTrigger value="content">Contenido</TabsTrigger>
                  <TabsTrigger value="analytics">Estadísticas</TabsTrigger>
                  <TabsTrigger value="settings">Configuración</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  {/* Profile Completion */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Target className="w-5 h-5 mr-2" />
                          Completitud del Perfil
                        </span>
                        <span className={`text-sm font-medium ${getCompletionColor(portfolio.profile_completion_status.percentage)}`}>
                          {getCompletionStatus(portfolio.profile_completion_status.percentage)}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Progreso general</span>
                        <span className="text-sm font-medium">
                          {portfolio.profile_completion_status.percentage}%
                        </span>
                      </div>
                      <Progress value={portfolio.profile_completion_status.percentage} />
                      
                      {portfolio.profile_completion_status.percentage < 90 && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Completa tu perfil para mejorar tu visibilidad. Considera agregar más proyectos, 
                            habilidades y experiencia profesional.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {portfolio.projects.length}
                          </div>
                          <div className="text-sm text-gray-600">Proyectos</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {portfolio.skills.length}
                          </div>
                          <div className="text-sm text-gray-600">Habilidades</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <Eye className="w-8 h-8 text-blue-500" />
                          <div className="ml-4">
                            <div className="text-2xl font-bold">{portfolio.views_count}</div>
                            <div className="text-sm text-gray-600">Vistas totales</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <Users className="w-8 h-8 text-green-500" />
                          <div className="ml-4">
                            <div className="text-2xl font-bold">{portfolio.analytics.profile_visits || 0}</div>
                            <div className="text-sm text-gray-600">Visitas este mes</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <MessageSquare className="w-8 h-8 text-orange-500" />
                          <div className="ml-4">
                            <div className="text-2xl font-bold">{portfolio.analytics.contact_clicks || 0}</div>
                            <div className="text-sm text-gray-600">Contactos</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        Actividad Reciente
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              activity.type === 'view' ? 'bg-blue-500' :
                              activity.type === 'contact' ? 'bg-green-500' :
                              'bg-gray-500'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900">{activity.description}</p>
                              <p className="text-xs text-gray-500">{activity.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Content Management Tab */}
                <TabsContent value="content" className="space-y-6">
                  {/* Projects */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Code className="w-5 h-5 mr-2" />
                          Proyectos ({portfolio.projects.length})
                        </span>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar Proyecto
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {portfolio.projects.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Code className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No tienes proyectos agregados aún.</p>
                          <Button variant="outline" className="mt-3">
                            <Plus className="w-4 h-4 mr-2" />
                            Agregar tu primer proyecto
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {portfolio.projects.slice(0, 3).map((project) => (
                            <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center space-x-4">
                                {project.image_url && (
                                  <img 
                                    src={project.image_url} 
                                    alt={project.title}
                                    className="w-12 h-12 rounded object-cover"
                                  />
                                )}
                                <div>
                                  <h3 className="font-medium">{project.title}</h3>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <div className="flex flex-wrap gap-1">
                                      {project.technologies.slice(0, 3).map((tech, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {tech}
                                        </Badge>
                                      ))}
                                    </div>
                                    {project.is_featured && (
                                      <Badge variant="default" className="text-xs">Destacado</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem>Editar</DropdownMenuItem>
                                  <DropdownMenuItem>
                                    {project.is_featured ? 'Quitar destacado' : 'Destacar'}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          ))}
                          {portfolio.projects.length > 3 && (
                            <Button variant="outline" className="w-full">
                              Ver todos los proyectos ({portfolio.projects.length})
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Experience */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Briefcase className="w-5 h-5 mr-2" />
                          Experiencia ({portfolio.experiences.length})
                        </span>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar Experiencia
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {portfolio.experiences.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No has agregado experiencia profesional.</p>
                          <Button variant="outline" className="mt-3">
                            <Plus className="w-4 h-4 mr-2" />
                            Agregar experiencia
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {portfolio.experiences.slice(0, 3).map((exp) => (
                            <div key={exp.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <h3 className="font-medium">{exp.position}</h3>
                                <p className="text-blue-600">{exp.company}</p>
                                <p className="text-sm text-gray-500">
                                  {new Date(exp.start_date).getFullYear()} - 
                                  {exp.is_current ? ' Presente' : new Date(exp.end_date!).getFullYear()}
                                  {exp.is_current && (
                                    <Badge variant="default" className="ml-2">Actual</Badge>
                                  )}
                                </p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem>Editar</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Skills */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Award className="w-5 h-5 mr-2" />
                          Habilidades ({portfolio.skills.length})
                        </span>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar Habilidad
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {portfolio.skills.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No has agregado habilidades técnicas.</p>
                          <Button variant="outline" className="mt-3">
                            <Plus className="w-4 h-4 mr-2" />
                            Agregar habilidades
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {portfolio.skills.slice(0, 6).map((skill) => (
                            <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">
                                    {skill.name}
                                    {skill.is_primary && (
                                      <Badge variant="default" className="ml-2 text-xs">Principal</Badge>
                                    )}
                                  </span>
                                </div>
                                <Progress value={skill.proficiency_level} className="h-2" />
                                <div className="text-xs text-gray-500 mt-1">
                                  {skill.proficiency_level}% competencia
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem>Editar</DropdownMenuItem>
                                  <DropdownMenuItem>
                                    {skill.is_primary ? 'Quitar principal' : 'Marcar principal'}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2" />
                        Estadísticas del Portfolio
                      </CardTitle>
                      <CardDescription>
                        Rendimiento de tu portfolio en los últimos 30 días
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-3xl font-bold text-blue-600">
                            {portfolio.views_count}
                          </div>
                          <div className="text-sm text-blue-700">Vistas totales</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-3xl font-bold text-green-600">
                            {portfolio.analytics.views_this_month || 0}
                          </div>
                          <div className="text-sm text-green-700">Este mes</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-3xl font-bold text-purple-600">
                            {portfolio.analytics.contact_clicks || 0}
                          </div>
                          <div className="text-sm text-purple-700">Contactos</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-3xl font-bold text-orange-600">
                            {Math.round((portfolio.analytics.contact_clicks || 0) / Math.max(portfolio.views_count, 1) * 100)}%
                          </div>
                          <div className="text-sm text-orange-700">Conversión</div>
                        </div>
                      </div>

                      <Alert className="mt-6">
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription>
                          Tu portfolio ha recibido {portfolio.analytics.views_this_month || 0} vistas este mes. 
                          Continúa actualizando tu contenido para mejorar tu visibilidad.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuración del Portfolio</CardTitle>
                      <CardDescription>
                        Administra la configuración y privacidad de tu portfolio
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">Disponibilidad laboral</h3>
                          <p className="text-sm text-gray-500">
                            {portfolio.available_for_hire 
                              ? 'Estás marcado como disponible para nuevas oportunidades' 
                              : 'No estás buscando trabajo actualmente'
                            }
                          </p>
                        </div>
                        <Badge variant={portfolio.available_for_hire ? 'default' : 'secondary'}>
                          {portfolio.availability_status}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">Visibilidad del portfolio</h3>
                          <p className="text-sm text-gray-500">
                            Tu portfolio es público y puede ser encontrado por reclutadores
                          </p>
                        </div>
                        <Badge variant="default">
                          Público
                        </Badge>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="font-medium">Acciones rápidas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Button variant="outline" asChild>
                            <Link href={route('portfolios.edit', portfolio.slug)}>
                              <Settings className="w-4 h-4 mr-2" />
                              Configuración completa
                            </Link>
                          </Button>
                          <Button variant="outline">
                            <Share2 className="w-4 h-4 mr-2" />
                            Compartir portfolio
                          </Button>
                          <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Exportar datos
                          </Button>
                          <Button variant="outline">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Ver analytics completos
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Summary */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={portfolio.avatar_url || portfolio.user.avatar_url} />
                      <AvatarFallback>
                        {portfolio.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-lg font-semibold">{portfolio.user.name}</h2>
                      <p className="text-sm text-gray-600">{portfolio.tagline}</p>
                      <div className="flex items-center mt-1">
                        <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                        <span className="text-xs text-gray-500">{portfolio.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Vistas del perfil:</span>
                      <span className="font-medium">{portfolio.views_count}</span>
                    </div>
                    {portfolio.rating > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Calificación:</span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span className="font-medium">{portfolio.rating}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Última actualización:</span>
                      <span className="font-medium">{portfolio.last_updated}</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <Button className="w-full" asChild>
                    <Link href={route('portfolios.show', portfolio.slug)}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver mi portfolio público
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href={route('portfolios.edit', portfolio.slug)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar información básica
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar proyecto
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Gestionar testimonios
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Ver analytics detallados
                  </Button>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Consejos para mejorar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    {portfolio.profile_completion_status.percentage < 80 && (
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                        <span>Completa tu perfil para mejorar tu visibilidad</span>
                      </div>
                    )}
                    {portfolio.projects.length < 3 && (
                      <div className="flex items-start space-x-2">
                        <Code className="w-4 h-4 text-blue-500 mt-0.5" />
                        <span>Agrega más proyectos para mostrar tu experiencia</span>
                      </div>
                    )}
                    {portfolio.testimonials.length === 0 && (
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>Solicita testimonios de clientes o colegas</span>
                      </div>
                    )}
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>Actualiza tu portfolio regularmente</span>
                    </div>
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
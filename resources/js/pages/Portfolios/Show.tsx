import { Head, Link, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Calendar, 
  Star, 
  Eye, 
  Heart, 
  Share2, 
  MessageCircle, 
  ExternalLink, 
  Github, 
  Globe, 
  Linkedin, 
  Twitter,
  Mail,
  Phone,
  Download,
  Award,
  Briefcase,
  GraduationCap,
  Code,
  User
} from 'lucide-react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';

interface Portfolio {
  id: number;
  user_id: number;
  slug: string;
  title: string;
  bio: string;
  tagline: string;
  specializations: string[];
  tech_stack: string[];
  avatar_url?: string;
  resume_url?: string;
  contact_info: {
    email?: string;
    phone?: string;
    website?: string;
  };
  social_links: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    portfolio?: string;
  };
  location: string;
  available_for_hire: boolean;
  preferred_work_types: string[];
  hourly_rate?: number;
  currency: string;
  views_count: number;
  rating: number;
  reviews_count: number;
  formatted_specializations: string[];
  availability_status: string;
  availability_color: string;
  rating_stars: string;
  formatted_hourly_rate?: string;
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
  description: string;
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
  description?: string;
  grade?: string;
}

interface Skill {
  id: number;
  name: string;
  category: string;
  proficiency_level: number;
  years_experience: number;
  is_primary: boolean;
}

interface Testimonial {
  id: number;
  client_name: string;
  client_position?: string;
  client_company?: string;
  content: string;
  rating: number;
  project_name?: string;
  is_approved: boolean;
  created_at: string;
}

export default function Show() {
  const { portfolio } = usePage<{ portfolio: Portfolio }>().props;

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'github': return Github;
      case 'linkedin': return Linkedin;
      case 'twitter': return Twitter;
      case 'portfolio': return Globe;
      default: return ExternalLink;
    }
  };

  const getWorkTypeLabel = (type: string) => {
    const labels = {
      'full_time': 'Tiempo Completo',
      'part_time': 'Medio Tiempo',
      'freelance': 'Freelance',
      'contract': 'Contrato',
      'remote': 'Remoto',
      'hybrid': 'Híbrido',
      'onsite': 'Presencial'
    };
    return labels[type] || type;
  };

  const getSkillCategoryColor = (category: string) => {
    const colors = {
      'frontend': 'bg-blue-100 text-blue-800',
      'backend': 'bg-green-100 text-green-800',
      'database': 'bg-purple-100 text-purple-800',
      'devops': 'bg-orange-100 text-orange-800',
      'mobile': 'bg-pink-100 text-pink-800',
      'design': 'bg-indigo-100 text-indigo-800',
      'tools': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AuthenticatedLayout>
      <Head title={`Portfolio de ${portfolio.user.name}`} />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="relative">
              {/* Cover Image Placeholder */}
              <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg"></div>
              
              <div className="px-6 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
                  {/* Avatar */}
                  <div className="relative -mt-12 sm:-mt-16">
                    <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white">
                      <AvatarImage src={portfolio.avatar_url || portfolio.user.avatar_url} />
                      <AvatarFallback className="text-2xl">
                        {portfolio.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Basic Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">{portfolio.title}</h1>
                        <p className="text-lg text-gray-600 mt-1">{portfolio.tagline}</p>
                        
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {portfolio.location}
                          </div>
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {portfolio.views_count.toLocaleString()} vistas
                          </div>
                          {portfolio.rating > 0 && (
                            <div className="flex items-center">
                              <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                              {portfolio.rating} ({portfolio.reviews_count} reseñas)
                            </div>
                          )}
                        </div>

                        {/* Availability Status */}
                        <div className="mt-3">
                          <Badge variant={portfolio.available_for_hire ? "default" : "secondary"}>
                            {portfolio.availability_status}
                          </Badge>
                          {portfolio.formatted_hourly_rate && (
                            <Badge variant="outline" className="ml-2">
                              {portfolio.formatted_hourly_rate}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-3 mt-4 sm:mt-0">
                        <Button variant="outline" size="sm">
                          <Heart className="w-4 h-4 mr-2" />
                          Guardar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="w-4 h-4 mr-2" />
                          Compartir
                        </Button>
                        <Button size="sm">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Contactar
                        </Button>
                      </div>
                    </div>

                    {/* Specializations & Tech Stack */}
                    <div className="mt-4 space-y-3">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Especialidades</h3>
                        <div className="flex flex-wrap gap-2">
                          {portfolio.formatted_specializations.map((spec, index) => (
                            <Badge key={index} variant="secondary">{spec}</Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Stack Tecnológico</h3>
                        <div className="flex flex-wrap gap-2">
                          {portfolio.tech_stack.map((tech, index) => (
                            <Badge key={index} variant="outline">{tech}</Badge>
                          ))}
                        </div>
                      </div>

                      {portfolio.preferred_work_types.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Modalidades de Trabajo</h3>
                          <div className="flex flex-wrap gap-2">
                            {portfolio.preferred_work_types.map((type, index) => (
                              <Badge key={index} variant="outline">{getWorkTypeLabel(type)}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview">Resumen</TabsTrigger>
                  <TabsTrigger value="projects">Proyectos</TabsTrigger>
                  <TabsTrigger value="experience">Experiencia</TabsTrigger>
                  <TabsTrigger value="education">Educación</TabsTrigger>
                  <TabsTrigger value="skills">Habilidades</TabsTrigger>
                  <TabsTrigger value="testimonials">Testimonios</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Acerca de mí
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-line">{portfolio.bio}</p>
                    </CardContent>
                  </Card>

                  {/* Featured Projects */}
                  {portfolio.projects.filter(p => p.is_featured).length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Proyectos Destacados</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {portfolio.projects
                            .filter(project => project.is_featured)
                            .map((project) => (
                              <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                {project.image_url && (
                                  <img 
                                    src={project.image_url} 
                                    alt={project.title}
                                    className="w-full h-32 object-cover rounded mb-3"
                                  />
                                )}
                                <h4 className="font-semibold text-lg mb-2">{project.title}</h4>
                                <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                                
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {project.technologies.map((tech, techIndex) => (
                                    <Badge key={techIndex} variant="outline" className="text-xs">
                                      {tech}
                                    </Badge>
                                  ))}
                                </div>

                                <div className="flex space-x-2">
                                  {project.demo_url && (
                                    <Button variant="outline" size="sm" asChild>
                                      <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-3 h-3 mr-1" />
                                        Demo
                                      </a>
                                    </Button>
                                  )}
                                  {project.github_url && (
                                    <Button variant="outline" size="sm" asChild>
                                      <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                                        <Github className="w-3 h-3 mr-1" />
                                        Código
                                      </a>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Projects Tab */}
                <TabsContent value="projects">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Code className="w-5 h-5 mr-2" />
                        Todos los Proyectos ({portfolio.projects.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {portfolio.projects.map((project) => (
                          <div key={project.id} className="border rounded-lg p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-xl font-semibold">{project.title}</h3>
                                {project.is_featured && (
                                  <Badge className="mt-2">Destacado</Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(project.completed_at).toLocaleDateString()}
                              </div>
                            </div>

                            {project.image_url && (
                              <img 
                                src={project.image_url} 
                                alt={project.title}
                                className="w-full h-48 object-cover rounded mb-4"
                              />
                            )}

                            <p className="text-gray-700 mb-4">{project.description}</p>

                            <div className="flex flex-wrap gap-2 mb-4">
                              {project.technologies.map((tech, index) => (
                                <Badge key={index} variant="outline">{tech}</Badge>
                              ))}
                            </div>

                            <div className="flex space-x-3">
                              {project.demo_url && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Ver Demo
                                  </a>
                                </Button>
                              )}
                              {project.github_url && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                                    <Github className="w-4 h-4 mr-2" />
                                    Ver Código
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Experience Tab */}
                <TabsContent value="experience">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Briefcase className="w-5 h-5 mr-2" />
                        Experiencia Profesional
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {portfolio.experiences.map((exp) => (
                          <div key={exp.id} className="relative pl-8 pb-6">
                            <div className="absolute left-0 top-0 w-3 h-3 bg-blue-500 rounded-full"></div>
                            {exp !== portfolio.experiences[portfolio.experiences.length - 1] && (
                              <div className="absolute left-1.5 top-3 w-0.5 h-full bg-gray-200"></div>
                            )}
                            
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="text-lg font-semibold">{exp.position}</h3>
                                <p className="text-blue-600 font-medium">{exp.company}</p>
                                <p className="text-sm text-gray-500">{exp.location}</p>
                              </div>
                              <div className="text-right text-sm text-gray-500">
                                <div>{new Date(exp.start_date).toLocaleDateString()}</div>
                                <div>-</div>
                                <div>{exp.is_current ? 'Presente' : new Date(exp.end_date!).toLocaleDateString()}</div>
                                {exp.is_current && (
                                  <Badge variant="default" className="mt-1">Actual</Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-700">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Education Tab */}
                <TabsContent value="education">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <GraduationCap className="w-5 h-5 mr-2" />
                        Educación
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {portfolio.education.map((edu) => (
                          <div key={edu.id} className="border-l-4 border-blue-500 pl-6">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="text-lg font-semibold">{edu.degree}</h3>
                                <p className="text-blue-600 font-medium">{edu.field_of_study}</p>
                                <p className="text-gray-600">{edu.institution}</p>
                                {edu.grade && (
                                  <p className="text-sm text-gray-500">Calificación: {edu.grade}</p>
                                )}
                              </div>
                              <div className="text-right text-sm text-gray-500">
                                <div>{new Date(edu.start_date).getFullYear()}</div>
                                <div>-</div>
                                <div>{edu.end_date ? new Date(edu.end_date).getFullYear() : 'Presente'}</div>
                              </div>
                            </div>
                            {edu.description && (
                              <p className="text-gray-700">{edu.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Skills Tab */}
                <TabsContent value="skills">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Award className="w-5 h-5 mr-2" />
                        Habilidades Técnicas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {Object.entries(
                          portfolio.skills.reduce((acc, skill) => {
                            if (!acc[skill.category]) acc[skill.category] = [];
                            acc[skill.category].push(skill);
                            return acc;
                          }, {} as Record<string, Skill[]>)
                        ).map(([category, skills]) => (
                          <div key={category}>
                            <h3 className="text-lg font-semibold mb-4 capitalize">
                              <Badge className={getSkillCategoryColor(category)}>
                                {category}
                              </Badge>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {skills.map((skill) => (
                                <div key={skill.id} className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium">
                                      {skill.name}
                                      {skill.is_primary && (
                                        <Badge variant="default" className="ml-2 text-xs">
                                          Principal
                                        </Badge>
                                      )}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      {skill.years_experience} año{skill.years_experience !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                  <Progress value={skill.proficiency_level} className="h-2" />
                                  <div className="text-xs text-gray-500 text-right">
                                    {skill.proficiency_level}% competencia
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Testimonials Tab */}
                <TabsContent value="testimonials">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Testimonios ({portfolio.testimonials.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {portfolio.testimonials.map((testimonial) => (
                          <div key={testimonial.id} className="border rounded-lg p-6">
                            <div className="flex items-start space-x-4">
                              <Avatar>
                                <AvatarFallback>
                                  {testimonial.client_name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="font-semibold">{testimonial.client_name}</h4>
                                  <div className="flex">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < testimonial.rating
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                {testimonial.client_position && testimonial.client_company && (
                                  <p className="text-sm text-gray-500 mb-2">
                                    {testimonial.client_position} en {testimonial.client_company}
                                  </p>
                                )}
                                {testimonial.project_name && (
                                  <Badge variant="outline" className="mb-3">
                                    Proyecto: {testimonial.project_name}
                                  </Badge>
                                )}
                                <blockquote className="text-gray-700 italic">
                                  "{testimonial.content}"
                                </blockquote>
                                <p className="text-xs text-gray-400 mt-2">
                                  {new Date(testimonial.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Información de Contacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {portfolio.contact_info.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <a 
                        href={`mailto:${portfolio.contact_info.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {portfolio.contact_info.email}
                      </a>
                    </div>
                  )}

                  {portfolio.contact_info.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <a 
                        href={`tel:${portfolio.contact_info.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {portfolio.contact_info.phone}
                      </a>
                    </div>
                  )}

                  {portfolio.contact_info.website && (
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <a 
                        href={portfolio.contact_info.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Sitio web
                      </a>
                    </div>
                  )}

                  {portfolio.resume_url && (
                    <div className="pt-2">
                      <Button variant="outline" className="w-full" asChild>
                        <a href={portfolio.resume_url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          Descargar CV
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Social Links */}
              {Object.keys(portfolio.social_links).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Redes Sociales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(portfolio.social_links).map(([platform, url]) => {
                        if (!url) return null;
                        const IconComponent = getSocialIcon(platform);
                        return (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <IconComponent className="w-5 h-5 text-gray-600" />
                            <span className="capitalize text-sm">{platform}</span>
                            <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                          </a>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Profile Completion */}
              <Card>
                <CardHeader>
                  <CardTitle>Completitud del Perfil</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Progreso</span>
                      <span className="text-sm text-gray-500">
                        {portfolio.profile_completion_status.percentage}%
                      </span>
                    </div>
                    <Progress value={portfolio.profile_completion_status.percentage} />
                    <p className={`text-sm ${portfolio.profile_completion_status.color}`}>
                      Estado: {portfolio.profile_completion_status.status}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {portfolio.projects.length}
                      </div>
                      <div className="text-xs text-gray-500">Proyectos</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {portfolio.experiences.length}
                      </div>
                      <div className="text-xs text-gray-500">Trabajos</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {portfolio.skills.length}
                      </div>
                      <div className="text-xs text-gray-500">Habilidades</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {portfolio.testimonials.length}
                      </div>
                      <div className="text-xs text-gray-500">Testimonios</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Última actualización:</span>
                      <span>{portfolio.last_updated}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Miembro desde:</span>
                      <span>{new Date(portfolio.user.email).getFullYear()}</span>
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
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Save, 
  Eye, 
  Plus, 
  X, 
  AlertCircle, 
  Upload,
  Globe,
  Github,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  Trash2,
  Edit3,
  Code,
  Briefcase,
  GraduationCap,
  Award,
  MessageCircle,
  ArrowLeft
} from 'lucide-react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { useState, useRef, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

const SPECIALIZATIONS = [
  { value: 'full_stack', label: 'Full Stack Developer' },
  { value: 'frontend', label: 'Frontend Developer' },
  { value: 'backend', label: 'Backend Developer' },
  { value: 'mobile', label: 'Mobile Developer' },
  { value: 'data_scientist', label: 'Data Scientist' },
  { value: 'ml_engineer', label: 'ML Engineer' },
  { value: 'devops', label: 'DevOps Engineer' },
  { value: 'ui_ux', label: 'UI/UX Designer' },
  { value: 'game_dev', label: 'Game Developer' },
  { value: 'blockchain', label: 'Blockchain Developer' },
  { value: 'cloud_architect', label: 'Cloud Architect' },
  { value: 'cybersecurity', label: 'Cybersecurity Specialist' },
  { value: 'product_manager', label: 'Product Manager' },
  { value: 'tech_lead', label: 'Tech Lead' },
];

const WORK_TYPES = [
  { value: 'full_time', label: 'Tiempo Completo' },
  { value: 'part_time', label: 'Medio Tiempo' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'contract', label: 'Contrato' },
  { value: 'remote', label: 'Remoto' },
  { value: 'hybrid', label: 'Híbrido' },
  { value: 'onsite', label: 'Presencial' },
];

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'MXN', label: 'MXN ($)' },
  { value: 'COP', label: 'COP ($)' },
  { value: 'ARS', label: 'ARS ($)' },
];

interface Portfolio {
  id: number;
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
  is_public: boolean;
  profile_completion_status: {
    percentage: number;
    status: string;
    color: string;
  };
  projects: any[];
  experiences: any[];
  education: any[];
  skills: any[];
  testimonials: any[];
}

export default function Edit() {
  const { portfolio } = usePage<{ portfolio: Portfolio }>().props;
  const [techInput, setTechInput] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const { data, setData, put, processing, errors, progress } = useForm({
    title: portfolio.title || '',
    bio: portfolio.bio || '',
    tagline: portfolio.tagline || '',
    specializations: portfolio.specializations || [],
    tech_stack: portfolio.tech_stack || [],
    avatar_url: portfolio.avatar_url || '',
    resume_url: portfolio.resume_url || '',
    contact_info: {
      email: portfolio.contact_info?.email || '',
      phone: portfolio.contact_info?.phone || '',
      website: portfolio.contact_info?.website || '',
    },
    social_links: {
      github: portfolio.social_links?.github || '',
      linkedin: portfolio.social_links?.linkedin || '',
      twitter: portfolio.social_links?.twitter || '',
      portfolio: portfolio.social_links?.portfolio || '',
    },
    location: portfolio.location || '',
    available_for_hire: portfolio.available_for_hire ?? true,
    preferred_work_types: portfolio.preferred_work_types || [],
    hourly_rate: portfolio.hourly_rate?.toString() || '',
    currency: portfolio.currency || 'USD',
    is_public: portfolio.is_public ?? true,
  });

  const handleSpecializationToggle = (value: string) => {
    setData('specializations', 
      data.specializations.includes(value)
        ? data.specializations.filter(s => s !== value)
        : [...data.specializations, value]
    );
  };

  const handleWorkTypeToggle = (value: string) => {
    setData('preferred_work_types', 
      data.preferred_work_types.includes(value)
        ? data.preferred_work_types.filter(t => t !== value)
        : [...data.preferred_work_types, value]
    );
  };

  const addTechStack = () => {
    if (techInput.trim() && !data.tech_stack.includes(techInput.trim())) {
      setData('tech_stack', [...data.tech_stack, techInput.trim()]);
      setTechInput('');
    }
  };

  const removeTechStack = (tech: string) => {
    setData('tech_stack', data.tech_stack.filter(t => t !== tech));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTechStack();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('portfolios.update', portfolio.slug));
  };

  const handlePreview = () => {
    window.open(route('portfolios.show', portfolio.slug), '_blank');
  };

  const calculateCompletion = () => {
    let completed = 0;
    const total = 10;

    if (data.title) completed++;
    if (data.bio) completed++;
    if (data.tagline) completed++;
    if (data.location) completed++;
    if (data.specializations.length > 0) completed++;
    if (data.tech_stack.length > 0) completed++;
    if (data.contact_info.email || data.contact_info.phone || data.contact_info.website) completed++;
    if (data.social_links.github || data.social_links.linkedin || data.social_links.twitter || data.social_links.portfolio) completed++;
    if (data.hourly_rate && data.currency) completed++;
    if (data.preferred_work_types.length > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const completion = calculateCompletion();

  return (
    <AuthenticatedLayout>
      <Head title={`Editar Portfolio - ${portfolio.title}`} />

      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.history.back()}
                    className="flex items-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                  </Button>
                  <h1 className="text-3xl font-bold text-gray-900">Editar Portfolio</h1>
                </div>
                <p className="text-gray-600">
                  Actualiza tu información profesional y mantén tu portfolio al día.
                </p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={handlePreview} className="flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Portfolio
                </Button>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Completitud del perfil</span>
                <span className="text-sm text-gray-500">{completion}% completado</span>
              </div>
              <Progress value={completion} className="w-full" />
              <p className="text-xs text-gray-500 mt-2">
                Progreso actual del portfolio - completa más campos para mejor visibilidad
              </p>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
                <TabsTrigger value="basic" className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Básico</span>
                </TabsTrigger>
                <TabsTrigger value="professional" className="flex items-center">
                  <Code className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Profesional</span>
                </TabsTrigger>
                <TabsTrigger value="contact" className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Contacto</span>
                </TabsTrigger>
                <TabsTrigger value="social" className="flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Social</span>
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center">
                  <Edit3 className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Contenido</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center">
                  <Award className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Config</span>
                </TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Información Básica</CardTitle>
                    <CardDescription>
                      Información principal que aparece en tu portfolio
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="title">Título del Portfolio *</Label>
                        <Input
                          id="title"
                          value={data.title}
                          onChange={(e) => setData('title', e.target.value)}
                          placeholder="ej. Juan Pérez - Full Stack Developer"
                          className={errors.title ? 'border-red-500' : ''}
                        />
                        {errors.title && (
                          <p className="text-sm text-red-600">{errors.title}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Ubicación *</Label>
                        <Input
                          id="location"
                          value={data.location}
                          onChange={(e) => setData('location', e.target.value)}
                          placeholder="ej. Ciudad de México, México"
                          className={errors.location ? 'border-red-500' : ''}
                        />
                        {errors.location && (
                          <p className="text-sm text-red-600">{errors.location}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tagline">Tagline</Label>
                      <Input
                        id="tagline"
                        value={data.tagline}
                        onChange={(e) => setData('tagline', e.target.value)}
                        placeholder="ej. Desarrollador apasionado por crear soluciones innovadoras"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografía *</Label>
                      <Textarea
                        id="bio"
                        value={data.bio}
                        onChange={(e) => setData('bio', e.target.value)}
                        placeholder="Cuéntanos sobre ti, tu experiencia, pasiones y objetivos profesionales..."
                        rows={5}
                        className={errors.bio ? 'border-red-500' : ''}
                      />
                      {errors.bio && (
                        <p className="text-sm text-red-600">{errors.bio}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {data.bio.length}/1000 caracteres
                      </p>
                    </div>

                    {/* Avatar Upload */}
                    <div className="space-y-2">
                      <Label>Foto de Perfil</Label>
                      <div className="flex items-center space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {data.avatar_url ? 'Cambiar Imagen' : 'Subir Imagen'}
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            console.log('Upload avatar:', e.target.files?.[0]);
                          }}
                        />
                        <span className="text-sm text-gray-500">
                          Formatos: JPG, PNG. Máximo 2MB
                        </span>
                      </div>
                      {data.avatar_url && (
                        <div className="mt-2">
                          <img 
                            src={data.avatar_url} 
                            alt="Avatar actual"
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Professional Information Tab */}
              <TabsContent value="professional" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Información Profesional</CardTitle>
                    <CardDescription>
                      Define tu especialización, stack tecnológico y preferencias laborales
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Specializations */}
                    <div className="space-y-3">
                      <Label>Especializaciones *</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {SPECIALIZATIONS.map((spec) => (
                          <div
                            key={spec.value}
                            className={`border rounded-lg p-3 cursor-pointer transition-all ${
                              data.specializations.includes(spec.value)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleSpecializationToggle(spec.value)}
                          >
                            <div className="text-sm font-medium">{spec.label}</div>
                          </div>
                        ))}
                      </div>
                      {errors.specializations && (
                        <p className="text-sm text-red-600">{errors.specializations}</p>
                      )}
                    </div>

                    {/* Tech Stack */}
                    <div className="space-y-3">
                      <Label>Stack Tecnológico</Label>
                      <div className="flex space-x-2">
                        <Input
                          value={techInput}
                          onChange={(e) => setTechInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="ej. React, Node.js, PostgreSQL..."
                          className="flex-1"
                        />
                        <Button type="button" onClick={addTechStack} variant="outline">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-3 border rounded-lg bg-gray-50">
                        {data.tech_stack.length === 0 ? (
                          <p className="text-sm text-gray-500">
                            Agrega tecnologías que dominas...
                          </p>
                        ) : (
                          data.tech_stack.map((tech) => (
                            <Badge
                              key={tech}
                              variant="secondary"
                              className="flex items-center space-x-1"
                            >
                              <span>{tech}</span>
                              <button
                                type="button"
                                onClick={() => removeTechStack(tech)}
                                className="ml-1 hover:bg-red-500 hover:text-white rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Work Preferences */}
                    <div className="space-y-3">
                      <Label>Modalidades de Trabajo Preferidas</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {WORK_TYPES.map((type) => (
                          <div
                            key={type.value}
                            className={`border rounded-lg p-3 cursor-pointer transition-all ${
                              data.preferred_work_types.includes(type.value)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleWorkTypeToggle(type.value)}
                          >
                            <div className="text-sm font-medium">{type.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hourly Rate */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="hourly_rate">Tarifa por Hora</Label>
                        <Input
                          id="hourly_rate"
                          type="number"
                          value={data.hourly_rate}
                          onChange={(e) => setData('hourly_rate', e.target.value)}
                          placeholder="50"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency">Moneda</Label>
                        <Select value={data.currency} onValueChange={(value) => setData('currency', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar moneda" />
                          </SelectTrigger>
                          <SelectContent>
                            {CURRENCIES.map((currency) => (
                              <SelectItem key={currency.value} value={currency.value}>
                                {currency.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contact Information Tab */}
              <TabsContent value="contact" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Información de Contacto</CardTitle>
                    <CardDescription>
                      Esta información será visible para potenciales empleadores
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="contact_email">Email de Contacto</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="contact_email"
                            type="email"
                            value={data.contact_info.email}
                            onChange={(e) => setData('contact_info', {...data.contact_info, email: e.target.value})}
                            placeholder="tu@email.com"
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact_phone">Teléfono</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="contact_phone"
                            type="tel"
                            value={data.contact_info.phone}
                            onChange={(e) => setData('contact_info', {...data.contact_info, phone: e.target.value})}
                            placeholder="+52 555 123 4567"
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_website">Sitio Web Personal</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="contact_website"
                          type="url"
                          value={data.contact_info.website}
                          onChange={(e) => setData('contact_info', {...data.contact_info, website: e.target.value})}
                          placeholder="https://tusitioweb.com"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Resume Upload */}
                    <div className="space-y-2">
                      <Label>CV/Resume (PDF)</Label>
                      <div className="flex items-center space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => resumeInputRef.current?.click()}
                          className="flex items-center"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {data.resume_url ? 'Cambiar CV' : 'Subir CV'}
                        </Button>
                        <input
                          ref={resumeInputRef}
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => {
                            console.log('Upload resume:', e.target.files?.[0]);
                          }}
                        />
                        <span className="text-sm text-gray-500">
                          Formato PDF. Máximo 5MB
                        </span>
                      </div>
                      {data.resume_url && (
                        <div className="mt-2 flex items-center space-x-2">
                          <span className="text-sm text-green-600">CV actual cargado</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setData('resume_url', '')}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Social Links Tab */}
              <TabsContent value="social" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Redes Sociales</CardTitle>
                    <CardDescription>
                      Conecta tus perfiles profesionales para mayor visibilidad
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="github_url">GitHub</Label>
                        <div className="relative">
                          <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="github_url"
                            type="url"
                            value={data.social_links.github}
                            onChange={(e) => setData('social_links', {...data.social_links, github: e.target.value})}
                            placeholder="https://github.com/tu-usuario"
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="linkedin_url">LinkedIn</Label>
                        <div className="relative">
                          <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="linkedin_url"
                            type="url"
                            value={data.social_links.linkedin}
                            onChange={(e) => setData('social_links', {...data.social_links, linkedin: e.target.value})}
                            placeholder="https://linkedin.com/in/tu-perfil"
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="twitter_url">Twitter</Label>
                        <div className="relative">
                          <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="twitter_url"
                            type="url"
                            value={data.social_links.twitter}
                            onChange={(e) => setData('social_links', {...data.social_links, twitter: e.target.value})}
                            placeholder="https://twitter.com/tu-usuario"
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="portfolio_url">Portfolio Externo</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="portfolio_url"
                            type="url"
                            value={data.social_links.portfolio}
                            onChange={(e) => setData('social_links', {...data.social_links, portfolio: e.target.value})}
                            placeholder="https://tu-portfolio.com"
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Content Management Tab */}
              <TabsContent value="content" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Gestión de Contenido</CardTitle>
                    <CardDescription>
                      Administra proyectos, experiencia, educación y habilidades
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Para editar proyectos, experiencia, educación y testimonios, utiliza las secciones dedicadas 
                        en el dashboard de tu portfolio o desde la vista detallada de tu portfolio.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="p-4 border rounded-lg">
                        <Code className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                        <div className="text-2xl font-bold">{portfolio.projects?.length || 0}</div>
                        <div className="text-sm text-gray-500">Proyectos</div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <Briefcase className="w-8 h-8 mx-auto text-green-500 mb-2" />
                        <div className="text-2xl font-bold">{portfolio.experiences?.length || 0}</div>
                        <div className="text-sm text-gray-500">Experiencias</div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <GraduationCap className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                        <div className="text-2xl font-bold">{portfolio.education?.length || 0}</div>
                        <div className="text-sm text-gray-500">Educación</div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <Award className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                        <div className="text-2xl font-bold">{portfolio.skills?.length || 0}</div>
                        <div className="text-sm text-gray-500">Habilidades</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración del Portfolio</CardTitle>
                    <CardDescription>
                      Controla la visibilidad y estado de tu portfolio
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Disponible para contratación</Label>
                        <p className="text-sm text-gray-500">
                          Indica si estás buscando nuevas oportunidades laborales
                        </p>
                      </div>
                      <Switch
                        checked={data.available_for_hire}
                        onCheckedChange={(checked) => setData('available_for_hire', checked)}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Portfolio público</Label>
                        <p className="text-sm text-gray-500">
                          Permite que otros usuarios encuentren y vean tu portfolio
                        </p>
                      </div>
                      <Switch
                        checked={data.is_public}
                        onCheckedChange={(checked) => setData('is_public', checked)}
                      />
                    </div>

                    <Separator />

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Estado Actual del Portfolio</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Completitud:</span>
                          <span className={portfolio.profile_completion_status.color}>
                            {portfolio.profile_completion_status.percentage}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Visibilidad:</span>
                          <span>{data.is_public ? 'Público' : 'Privado'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Disponibilidad:</span>
                          <span className={data.available_for_hire ? 'text-green-600' : 'text-gray-500'}>
                            {data.available_for_hire ? 'Disponible' : 'No disponible'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Form Actions */}
            <Card>
              <CardContent className="pt-6">
                {Object.keys(errors).length > 0 && (
                  <Alert className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Hay algunos errores en el formulario. Por favor revisa los campos marcados.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Última modificación: {portfolio.profile_completion_status ? 'hace pocos minutos' : 'nunca'}
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => window.history.back()}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={processing}>
                      {processing ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Guardar Cambios
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
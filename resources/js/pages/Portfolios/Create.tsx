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
  Phone
} from 'lucide-react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { useState, useRef } from 'react';

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

export default function Create() {
  const [techInput, setTechInput] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactWebsite, setContactWebsite] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const { data, setData, post, processing, errors, progress } = useForm({
    title: '',
    bio: '',
    tagline: '',
    specializations: [] as string[],
    tech_stack: [] as string[],
    avatar_url: '',
    resume_url: '',
    contact_info: {
      email: '',
      phone: '',
      website: '',
    },
    social_links: {
      github: '',
      linkedin: '',
      twitter: '',
      portfolio: '',
    },
    location: '',
    available_for_hire: true,
    preferred_work_types: [] as string[],
    hourly_rate: '',
    currency: 'USD',
    is_public: true,
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

  const updateContactInfo = () => {
    setData('contact_info', {
      email: contactEmail,
      phone: contactPhone,
      website: contactWebsite,
    });
  };

  const updateSocialLinks = () => {
    setData('social_links', {
      github: githubUrl,
      linkedin: linkedinUrl,
      twitter: twitterUrl,
      portfolio: portfolioUrl,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update nested objects before submitting
    updateContactInfo();
    updateSocialLinks();
    
    post(route('portfolios.store'));
  };

  const handlePreview = () => {
    // This would typically open a preview modal or navigate to a preview page
    console.log('Preview portfolio:', data);
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
    if (contactEmail || contactPhone || contactWebsite) completed++;
    if (githubUrl || linkedinUrl || twitterUrl || portfolioUrl) completed++;
    if (data.hourly_rate && data.currency) completed++;
    if (data.preferred_work_types.length > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const completion = calculateCompletion();

  return (
    <AuthenticatedLayout>
      <Head title="Crear Portfolio" />

      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Crear Portfolio</h1>
            <p className="mt-2 text-gray-600">
              Crea tu portfolio profesional para mostrar tu experiencia, proyectos y habilidades.
            </p>
          </div>

          {/* Progress Bar */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progreso del perfil</span>
                <span className="text-sm text-gray-500">{completion}% completado</span>
              </div>
              <Progress value={completion} className="w-full" />
              <p className="text-xs text-gray-500 mt-2">
                Completa más campos para mejorar la visibilidad de tu portfolio
              </p>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Información Básica
                </CardTitle>
                <CardDescription>
                  Esta información aparecerá en la cabecera de tu portfolio
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
                      Subir Imagen
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        // Handle file upload
                        console.log('Upload avatar:', e.target.files?.[0]);
                      }}
                    />
                    <span className="text-sm text-gray-500">
                      Formatos: JPG, PNG. Máximo 2MB
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Información Profesional</CardTitle>
                <CardDescription>
                  Define tu especialización y stack tecnológico
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

            {/* Contact Information */}
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
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
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
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
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
                      value={contactWebsite}
                      onChange={(e) => setContactWebsite(e.target.value)}
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
                      Subir CV
                    </Button>
                    <input
                      ref={resumeInputRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        // Handle resume upload
                        console.log('Upload resume:', e.target.files?.[0]);
                      }}
                    />
                    <span className="text-sm text-gray-500">
                      Formato PDF. Máximo 5MB
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Redes Sociales</CardTitle>
                <CardDescription>
                  Conecta tus perfiles profesionales
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
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
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
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
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
                        value={twitterUrl}
                        onChange={(e) => setTwitterUrl(e.target.value)}
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
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://tu-portfolio.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Disponible para contratación</Label>
                    <p className="text-sm text-gray-500">
                      Indica si estás buscando nuevas oportunidades
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
                      Permite que otros usuarios encuentren tu portfolio
                    </p>
                  </div>
                  <Switch
                    checked={data.is_public}
                    onCheckedChange={(checked) => setData('is_public', checked)}
                  />
                </div>
              </CardContent>
            </Card>

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
                  <Button type="button" variant="outline" onClick={handlePreview}>
                    <Eye className="w-4 h-4 mr-2" />
                    Vista Previa
                  </Button>

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
                          Creando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Crear Portfolio
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
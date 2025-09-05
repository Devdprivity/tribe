import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Eye, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  Share2,
  ExternalLink,
  Clock,
  Target,
  Star,
  Globe,
  Search,
  MousePointer
} from 'lucide-react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface Portfolio {
  id: number;
  slug: string;
  title: string;
  views_count: number;
  rating: number;
  reviews_count: number;
  user: {
    name: string;
  };
}

interface AnalyticsData {
  overview: {
    total_views: number;
    views_this_month: number;
    views_change: number;
    unique_visitors: number;
    bounce_rate: number;
    avg_session_duration: number;
    contact_clicks: number;
    conversion_rate: number;
  };
  views_by_day: Array<{
    date: string;
    views: number;
    visitors: number;
  }>;
  traffic_sources: Array<{
    source: string;
    views: number;
    percentage: number;
  }>;
  popular_sections: Array<{
    section: string;
    views: number;
    time_spent: number;
  }>;
  geographic_data: Array<{
    country: string;
    views: number;
    percentage: number;
  }>;
  device_breakdown: Array<{
    device: string;
    views: number;
    percentage: number;
  }>;
  referral_domains: Array<{
    domain: string;
    views: number;
    clicks: number;
  }>;
  engagement_metrics: {
    profile_completions: number;
    cv_downloads: number;
    project_clicks: number;
    social_clicks: number;
    contact_form_submissions: number;
  };
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#f97316'];

export default function Analytics() {
  const { portfolio, analytics } = usePage<{ 
    portfolio: Portfolio;
    analytics: AnalyticsData;
  }>().props;

  const formatChange = (change: number) => {
    const isPositive = change > 0;
    return (
      <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
        <span>{Math.abs(change)}%</span>
      </div>
    );
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <AuthenticatedLayout>
      <Head title={`Analytics - ${portfolio.title}`} />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics del Portfolio</h1>
                <p className="mt-2 text-gray-600">
                  Estadísticas detalladas de tu portfolio: {portfolio.title}
                </p>
              </div>
              <div className="flex space-x-3">
                <Badge variant="secondary">Últimos 30 días</Badge>
              </div>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Vistas Totales</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-3xl font-bold">{analytics.overview.total_views.toLocaleString()}</p>
                      {formatChange(analytics.overview.views_change)}
                    </div>
                  </div>
                  <Eye className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Visitantes Únicos</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-3xl font-bold">{analytics.overview.unique_visitors.toLocaleString()}</p>
                      <Badge variant="outline" className="text-xs">Este mes</Badge>
                    </div>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tasa de Conversión</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-3xl font-bold">{analytics.overview.conversion_rate}%</p>
                      <Badge variant="default" className="text-xs">Contactos</Badge>
                    </div>
                  </div>
                  <Target className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-3xl font-bold">{formatDuration(analytics.overview.avg_session_duration)}</p>
                      <Badge variant="outline" className="text-xs">Sesión</Badge>
                    </div>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="traffic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="traffic">Tráfico</TabsTrigger>
              <TabsTrigger value="engagement">Interacción</TabsTrigger>
              <TabsTrigger value="sources">Fuentes</TabsTrigger>
              <TabsTrigger value="geography">Geografía</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            {/* Traffic Tab */}
            <TabsContent value="traffic" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Views Over Time */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Vistas en el Tiempo</CardTitle>
                    <CardDescription>
                      Evolución de las vistas de tu portfolio en los últimos 30 días
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analytics.views_by_day}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip 
                            labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
                            formatter={(value, name) => [value, name === 'views' ? 'Vistas' : 'Visitantes']}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="views" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="visitors" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Popular Sections */}
                <Card>
                  <CardHeader>
                    <CardTitle>Secciones Populares</CardTitle>
                    <CardDescription>
                      Qué secciones de tu portfolio reciben más atención
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.popular_sections.map((section, index) => (
                        <div key={section.section} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="font-medium capitalize">{section.section}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{section.views} vistas</div>
                            <div className="text-xs text-gray-500">{formatDuration(section.time_spent)} promedio</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Device Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Dispositivos</CardTitle>
                    <CardDescription>
                      Desde qué dispositivos ven tu portfolio
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics.device_breakdown}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="percentage"
                            label={({ device, percentage }) => `${device}: ${percentage}%`}
                          >
                            {analytics.device_breakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}%`, 'Porcentaje']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Engagement Tab */}
            <TabsContent value="engagement" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Download className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="text-2xl font-bold">{analytics.engagement_metrics.cv_downloads}</p>
                        <p className="text-sm text-gray-600">Descargas de CV</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <MessageSquare className="w-8 h-8 text-green-500" />
                      <div>
                        <p className="text-2xl font-bold">{analytics.engagement_metrics.contact_form_submissions}</p>
                        <p className="text-sm text-gray-600">Formularios enviados</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <MousePointer className="w-8 h-8 text-purple-500" />
                      <div>
                        <p className="text-2xl font-bold">{analytics.engagement_metrics.project_clicks}</p>
                        <p className="text-sm text-gray-600">Clicks en proyectos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Métricas de Interacción</CardTitle>
                  <CardDescription>
                    Cómo los visitantes interactúan con tu portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Tasa de Rebote</span>
                        <span className="text-sm text-gray-600">{analytics.overview.bounce_rate}%</span>
                      </div>
                      <Progress value={analytics.overview.bounce_rate} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        {analytics.overview.bounce_rate < 60 ? 'Excelente' : 
                         analytics.overview.bounce_rate < 80 ? 'Bueno' : 'Necesita mejoras'} - 
                        Porcentaje de visitantes que salen sin interactuar
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Tasa de Conversión</span>
                        <span className="text-sm text-gray-600">{analytics.overview.conversion_rate}%</span>
                      </div>
                      <Progress value={analytics.overview.conversion_rate} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        Visitantes que realizan alguna acción (contacto, descarga CV, etc.)
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {analytics.engagement_metrics.social_clicks}
                        </div>
                        <div className="text-sm text-blue-700">Clicks en redes sociales</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {analytics.engagement_metrics.profile_completions}
                        </div>
                        <div className="text-sm text-green-700">Perfiles completados</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Traffic Sources Tab */}
            <TabsContent value="sources" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Fuentes de Tráfico</CardTitle>
                    <CardDescription>
                      De dónde provienen tus visitantes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.traffic_sources.map((source, index) => (
                        <div key={source.source} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="font-medium capitalize">{source.source}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{source.views} vistas</div>
                            <div className="text-xs text-gray-500">{source.percentage}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribución de Fuentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.traffic_sources} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" tick={{ fontSize: 12 }} />
                          <YAxis 
                            type="category" 
                            dataKey="source" 
                            tick={{ fontSize: 12 }}
                            width={80}
                          />
                          <Tooltip formatter={(value) => [value, 'Vistas']} />
                          <Bar dataKey="views" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Dominios de Referencia</CardTitle>
                  <CardDescription>
                    Sitios web que envían tráfico a tu portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3">Dominio</th>
                          <th className="text-right py-3">Vistas</th>
                          <th className="text-right py-3">Clicks</th>
                          <th className="text-right py-3">CTR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.referral_domains.map((domain) => (
                          <tr key={domain.domain} className="border-b">
                            <td className="py-3 flex items-center">
                              <Globe className="w-4 h-4 mr-2 text-gray-400" />
                              {domain.domain}
                            </td>
                            <td className="text-right py-3">{domain.views}</td>
                            <td className="text-right py-3">{domain.clicks}</td>
                            <td className="text-right py-3">
                              {domain.views > 0 ? Math.round((domain.clicks / domain.views) * 100) : 0}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Geography Tab */}
            <TabsContent value="geography" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución Geográfica</CardTitle>
                  <CardDescription>
                    Desde qué países visitan tu portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      {analytics.geographic_data.map((country, index) => (
                        <div key={country.country} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="font-medium">{country.country}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{country.views} vistas</div>
                            <div className="text-xs text-gray-500">{country.percentage}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics.geographic_data}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="percentage"
                            label={({ country, percentage }) => percentage > 5 ? `${country}: ${percentage}%` : ''}
                          >
                            {analytics.geographic_data.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}%`, 'Porcentaje']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Rendimiento General</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          <span className="font-medium">Vistas en crecimiento</span>
                        </div>
                        <Badge variant="default">+{analytics.overview.views_change}%</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <span className="font-medium">Tiempo de sesión</span>
                        </div>
                        <span className="font-medium">{formatDuration(analytics.overview.avg_session_duration)}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Target className="w-5 h-5 text-purple-600" />
                          <span className="font-medium">Tasa de conversión</span>
                        </div>
                        <span className="font-medium">{analytics.overview.conversion_rate}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recomendaciones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.overview.bounce_rate > 70 && (
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <p className="text-sm font-medium text-yellow-800">Alta tasa de rebote</p>
                          <p className="text-xs text-yellow-700">Considera mejorar la primera impresión de tu portfolio</p>
                        </div>
                      )}
                      
                      {analytics.overview.conversion_rate < 5 && (
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <p className="text-sm font-medium text-orange-800">Baja tasa de conversión</p>
                          <p className="text-xs text-orange-700">Agrega llamadas a la acción más claras</p>
                        </div>
                      )}

                      {analytics.engagement_metrics.cv_downloads < 10 && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-800">Pocas descargas de CV</p>
                          <p className="text-xs text-blue-700">Haz más visible el botón de descarga</p>
                        </div>
                      )}

                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-800">Buen rendimiento</p>
                        <p className="text-xs text-green-700">Tu portfolio está funcionando bien, sigue actualizándolo</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Objetivos y Métricas Clave</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 border rounded-lg">
                      <Eye className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                      <div className="text-2xl font-bold">{analytics.overview.total_views}</div>
                      <div className="text-sm text-gray-600">Vistas objetivo: 1,000</div>
                      <Progress 
                        value={Math.min((analytics.overview.total_views / 1000) * 100, 100)} 
                        className="mt-2" 
                      />
                    </div>

                    <div className="text-center p-4 border rounded-lg">
                      <MessageSquare className="w-8 h-8 mx-auto text-green-500 mb-2" />
                      <div className="text-2xl font-bold">{analytics.engagement_metrics.contact_form_submissions}</div>
                      <div className="text-sm text-gray-600">Contactos objetivo: 20</div>
                      <Progress 
                        value={Math.min((analytics.engagement_metrics.contact_form_submissions / 20) * 100, 100)} 
                        className="mt-2" 
                      />
                    </div>

                    <div className="text-center p-4 border rounded-lg">
                      <Download className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                      <div className="text-2xl font-bold">{analytics.engagement_metrics.cv_downloads}</div>
                      <div className="text-sm text-gray-600">Descargas objetivo: 50</div>
                      <Progress 
                        value={Math.min((analytics.engagement_metrics.cv_downloads / 50) * 100, 100)} 
                        className="mt-2" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
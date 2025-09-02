import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function JobsSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Contenido Principal */}
            <div className="lg:col-span-3 space-y-6">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-8 bg-white/10 rounded-lg w-32 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-white/10 rounded-lg w-48 animate-pulse"></div>
                    </div>
                    <div className="h-10 bg-white/10 rounded-lg w-36 animate-pulse"></div>
                </div>

                {/* Búsqueda y Filtros Skeleton */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative md:col-span-2">
                            <div className="h-10 bg-white/10 rounded-lg w-full animate-pulse"></div>
                        </div>
                        <div className="relative">
                            <div className="h-10 bg-white/10 rounded-lg w-full animate-pulse"></div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="h-6 bg-white/10 rounded-lg w-28 animate-pulse"></div>
                        <div className="h-6 bg-white/10 rounded-lg w-20 animate-pulse"></div>
                        <div className="h-6 bg-white/10 rounded-lg w-28 animate-pulse"></div>
                        <div className="h-6 bg-white/10 rounded-lg w-24 animate-pulse"></div>
                    </div>
                </div>

                {/* Lista de Trabajos Skeleton */}
                <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="hover:shadow-md transition-shadow apple-liquid-card">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        {/* Company Avatar */}
                                        <div className="h-12 w-12 bg-white/10 rounded-full animate-pulse"></div>
                                        
                                        <div className="flex-1">
                                            {/* Job Title */}
                                            <div className="h-5 bg-white/10 rounded-lg w-48 mb-2 animate-pulse"></div>
                                            
                                            {/* Company Name */}
                                            <div className="h-4 bg-white/10 rounded-lg w-32 animate-pulse"></div>
                                        </div>
                                    </div>
                                    
                                    {/* Bookmark Icon */}
                                    <div className="h-5 w-5 bg-white/10 rounded animate-pulse"></div>
                                </div>
                            </CardHeader>
                            
                            <CardContent>
                                {/* Description */}
                                <div className="space-y-2 mb-4">
                                    <div className="h-3 bg-white/10 rounded-lg w-full animate-pulse"></div>
                                    <div className="h-3 bg-white/10 rounded-lg w-5/6 animate-pulse"></div>
                                    <div className="h-3 bg-white/10 rounded-lg w-3/4 animate-pulse"></div>
                                </div>
                                
                                {/* Requirements */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <div className="h-5 bg-white/10 rounded-lg w-20 animate-pulse"></div>
                                    <div className="h-5 bg-white/10 rounded-lg w-24 animate-pulse"></div>
                                    <div className="h-5 bg-white/10 rounded-lg w-18 animate-pulse"></div>
                                    <div className="h-5 bg-white/10 rounded-lg w-22 animate-pulse"></div>
                                </div>
                                
                                {/* Job Details */}
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 bg-white/10 rounded animate-pulse"></div>
                                        <div className="h-4 bg-white/10 rounded-lg w-20 animate-pulse"></div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 bg-white/10 rounded animate-pulse"></div>
                                        <div className="h-4 bg-white/10 rounded-lg w-24 animate-pulse"></div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 bg-white/10 rounded animate-pulse"></div>
                                        <div className="h-4 bg-white/10 rounded-lg w-28 animate-pulse"></div>
                                    </div>
                                </div>
                                
                                {/* Actions */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 bg-white/10 rounded animate-pulse"></div>
                                        <div className="h-4 bg-white/10 rounded-lg w-16 animate-pulse"></div>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <div className="h-8 bg-white/10 rounded-lg w-20 animate-pulse"></div>
                                        <div className="h-8 bg-white/10 rounded-lg w-24 animate-pulse"></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="lg:col-span-1 space-y-6">
                {/* Trabajos Destacados */}
                <Card className="apple-liquid-card border border-white/20 shadow-2xl">
                    <CardHeader className="pb-4">
                        <div className="h-5 bg-white/10 rounded-lg w-32 animate-pulse"></div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="h-8 w-8 bg-white/10 rounded-full animate-pulse"></div>
                                <div className="flex-1">
                                    <div className="h-3 bg-white/10 rounded-lg w-24 mb-1 animate-pulse"></div>
                                    <div className="h-2 bg-white/10 rounded-lg w-20 mb-1 animate-pulse"></div>
                                    <div className="h-2 bg-white/10 rounded-lg w-16 animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Aplicaciones Recientes */}
                <Card className="apple-liquid-card border border-white/20 shadow-2xl">
                    <CardHeader className="pb-4">
                        <div className="h-5 bg-white/10 rounded-lg w-36 animate-pulse"></div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="h-8 w-8 bg-white/10 rounded-full animate-pulse"></div>
                                <div className="flex-1">
                                    <div className="h-3 bg-white/10 rounded-lg w-28 mb-1 animate-pulse"></div>
                                    <div className="h-2 bg-white/10 rounded-lg w-20 mb-1 animate-pulse"></div>
                                    <div className="h-2 bg-white/10 rounded-lg w-18 animate-pulse"></div>
                                </div>
                                <div className="h-4 w-4 bg-white/10 rounded animate-pulse"></div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Estadísticas */}
                <Card className="apple-liquid-card border border-white/20 shadow-2xl">
                    <CardHeader className="pb-4">
                        <div className="h-5 bg-white/10 rounded-lg w-28 animate-pulse"></div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="h-4 bg-white/10 rounded-lg w-24 animate-pulse"></div>
                            <div className="h-4 bg-white/10 rounded-lg w-8 animate-pulse"></div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="h-4 bg-white/10 rounded-lg w-28 animate-pulse"></div>
                            <div className="h-4 bg-white/10 rounded-lg w-8 animate-pulse"></div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="h-4 bg-white/10 rounded-lg w-32 animate-pulse"></div>
                            <div className="h-4 bg-white/10 rounded-lg w-8 animate-pulse"></div>
                        </div>
                    </CardContent>
                </Card>

                {/* Filtros Rápidos */}
                <Card className="apple-liquid-card border border-white/20 shadow-2xl">
                    <CardHeader className="pb-4">
                        <div className="h-5 bg-white/10 rounded-lg w-26 animate-pulse"></div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-8 bg-white/10 rounded-lg w-full animate-pulse"></div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

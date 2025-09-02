import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function UsersSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Contenido Principal */}
            <div className="lg:col-span-3 space-y-6">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-8 bg-white/10 rounded-lg w-48 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-white/10 rounded-lg w-64 animate-pulse"></div>
                    </div>
                    <div className="h-10 bg-white/10 rounded-lg w-32 animate-pulse"></div>
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
                        <div className="h-6 bg-white/10 rounded-lg w-24 animate-pulse"></div>
                        <div className="h-6 bg-white/10 rounded-lg w-16 animate-pulse"></div>
                        <div className="h-6 bg-white/10 rounded-lg w-20 animate-pulse"></div>
                        <div className="h-6 bg-white/10 rounded-lg w-16 animate-pulse"></div>
                        <div className="h-6 bg-white/10 rounded-lg w-24 animate-pulse"></div>
                    </div>
                </div>

                {/* Lista de Desarrolladores Skeleton */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="apple-liquid-card border border-white/20 shadow-2xl">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    {/* Avatar */}
                                    <div className="h-16 w-16 bg-white/10 rounded-full animate-pulse flex-shrink-0"></div>
                                    
                                    <div className="flex-1 space-y-3">
                                        {/* Name and Level */}
                                        <div className="flex items-center justify-between">
                                            <div className="h-5 bg-white/10 rounded-lg w-32 animate-pulse"></div>
                                            <div className="h-6 bg-white/10 rounded-lg w-16 animate-pulse"></div>
                                        </div>
                                        
                                        {/* Username */}
                                        <div className="h-3 bg-white/10 rounded-lg w-24 animate-pulse"></div>
                                        
                                        {/* Bio */}
                                        <div className="space-y-2">
                                            <div className="h-3 bg-white/10 rounded-lg w-full animate-pulse"></div>
                                            <div className="h-3 bg-white/10 rounded-lg w-3/4 animate-pulse"></div>
                                        </div>
                                        
                                        {/* Skills */}
                                        <div className="flex flex-wrap gap-2">
                                            <div className="h-5 bg-white/10 rounded-lg w-16 animate-pulse"></div>
                                            <div className="h-5 bg-white/10 rounded-lg w-20 animate-pulse"></div>
                                            <div className="h-5 bg-white/10 rounded-lg w-14 animate-pulse"></div>
                                        </div>
                                        
                                        {/* Stats and Actions */}
                                        <div className="flex items-center justify-between pt-2">
                                            <div className="flex items-center gap-4">
                                                <div className="h-4 bg-white/10 rounded-lg w-12 animate-pulse"></div>
                                                <div className="h-4 bg-white/10 rounded-lg w-12 animate-pulse"></div>
                                                <div className="h-4 bg-white/10 rounded-lg w-12 animate-pulse"></div>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="h-8 bg-white/10 rounded-lg w-20 animate-pulse"></div>
                                                <div className="h-8 bg-white/10 rounded-lg w-8 animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="lg:col-span-1 space-y-6">
                {/* Destacados */}
                <Card className="apple-liquid-card border border-white/20 shadow-2xl">
                    <CardHeader className="pb-4">
                        <div className="h-5 bg-white/10 rounded-lg w-24 animate-pulse"></div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-white/10 rounded-full animate-pulse"></div>
                                <div className="flex-1">
                                    <div className="h-3 bg-white/10 rounded-lg w-20 mb-1 animate-pulse"></div>
                                    <div className="h-2 bg-white/10 rounded-lg w-16 animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Nuevos Miembros */}
                <Card className="apple-liquid-card border border-white/20 shadow-2xl">
                    <CardHeader className="pb-4">
                        <div className="h-5 bg-white/10 rounded-lg w-32 animate-pulse"></div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-white/10 rounded-full animate-pulse"></div>
                                <div className="flex-1">
                                    <div className="h-3 bg-white/10 rounded-lg w-24 mb-1 animate-pulse"></div>
                                    <div className="h-2 bg-white/10 rounded-lg w-20 animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Filtros Rápidos */}
                <Card className="apple-liquid-card border border-white/20 shadow-2xl">
                    <CardHeader className="pb-4">
                        <div className="h-5 bg-white/10 rounded-lg w-28 animate-pulse"></div>
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

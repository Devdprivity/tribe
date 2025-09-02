import { Card, CardContent } from '@/components/ui/card';

export default function BookmarksSkeleton() {
    return (
        <div className="w-full">
            {/* Header Skeleton */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 bg-white/10 rounded animate-pulse"></div>
                    <div className="h-8 bg-white/10 rounded-lg w-32 animate-pulse"></div>
                </div>
                <div className="h-4 bg-white/10 rounded-lg w-64 animate-pulse"></div>
            </div>

            {/* Buscador Skeleton */}
            <div className="mb-6">
                <div className="relative">
                    <div className="h-10 bg-white/10 rounded-lg w-full animate-pulse"></div>
                </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="mb-6">
                <div className="flex items-center gap-2">
                    <div className="h-10 bg-white/10 rounded-lg w-20 animate-pulse"></div>
                    <div className="h-10 bg-white/10 rounded-lg w-24 animate-pulse"></div>
                    <div className="h-10 bg-white/10 rounded-lg w-20 animate-pulse"></div>
                </div>
            </div>

            {/* Filtros Skeleton */}
            <div className="mb-6">
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="h-6 bg-white/10 rounded-lg w-24 animate-pulse"></div>
                    <div className="h-6 bg-white/10 rounded-lg w-16 animate-pulse"></div>
                    <div className="h-6 bg-white/10 rounded-lg w-20 animate-pulse"></div>
                    <div className="h-6 bg-white/10 rounded-lg w-18 animate-pulse"></div>
                </div>
            </div>

            {/* Contenido Skeleton - Posts */}
            <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow apple-liquid-card">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                {/* User Avatar */}
                                <div className="h-12 w-12 bg-white/10 rounded-full animate-pulse flex-shrink-0"></div>
                                
                                <div className="flex-1 space-y-3">
                                    {/* User Info */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 bg-white/10 rounded-lg w-24 animate-pulse"></div>
                                            <div className="h-3 bg-white/10 rounded-lg w-16 animate-pulse"></div>
                                        </div>
                                        <div className="h-4 w-4 bg-white/10 rounded animate-pulse"></div>
                                    </div>
                                    
                                    {/* Post Content */}
                                    <div className="space-y-2">
                                        <div className="h-3 bg-white/10 rounded-lg w-full animate-pulse"></div>
                                        <div className="h-3 bg-white/10 rounded-lg w-5/6 animate-pulse"></div>
                                        <div className="h-3 bg-white/10 rounded-lg w-3/4 animate-pulse"></div>
                                    </div>
                                    
                                    {/* Hashtags */}
                                    <div className="flex flex-wrap gap-2">
                                        <div className="h-5 bg-white/10 rounded-lg w-16 animate-pulse"></div>
                                        <div className="h-5 bg-white/10 rounded-lg w-20 animate-pulse"></div>
                                        <div className="h-5 bg-white/10 rounded-lg w-14 animate-pulse"></div>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 bg-white/10 rounded animate-pulse"></div>
                                                <div className="h-4 bg-white/10 rounded-lg w-8 animate-pulse"></div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 bg-white/10 rounded animate-pulse"></div>
                                                <div className="h-4 bg-white/10 rounded-lg w-8 animate-pulse"></div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 bg-white/10 rounded animate-pulse"></div>
                                                <div className="h-4 bg-white/10 rounded-lg w-16 animate-pulse"></div>
                                            </div>
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

            {/* Jobs Skeleton (Hidden by default, shown when tab is active) */}
            <div className="space-y-4 hidden">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow apple-liquid-card">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="h-5 bg-white/10 rounded-lg w-48 mb-2 animate-pulse"></div>
                                    <div className="h-4 bg-white/10 rounded-lg w-32 mb-3 animate-pulse"></div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-4 bg-white/10 rounded-lg w-20 animate-pulse"></div>
                                        <div className="h-5 bg-white/10 rounded-lg w-16 animate-pulse"></div>
                                        <div className="h-4 bg-white/10 rounded-lg w-24 animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="h-8 bg-white/10 rounded-lg w-24 animate-pulse"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Users Skeleton (Hidden by default, shown when tab is active) */}
            <div className="space-y-4 hidden">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow apple-liquid-card">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-white/10 rounded-full animate-pulse"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-white/10 rounded-lg w-32 mb-1 animate-pulse"></div>
                                    <div className="h-3 bg-white/10 rounded-lg w-20 animate-pulse"></div>
                                </div>
                                <div className="h-8 bg-white/10 rounded-lg w-20 animate-pulse"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

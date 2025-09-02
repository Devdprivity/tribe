import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function TimelineSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <div className="h-8 bg-white/10 rounded-lg w-48 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-white/10 rounded-lg w-64 animate-pulse"></div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="h-10 bg-white/10 rounded-lg w-64 animate-pulse"></div>
                    </div>
                    
                    <div className="h-10 bg-white/10 rounded-lg w-24 animate-pulse"></div>
                </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                <div className="h-8 bg-white/10 rounded-lg w-24 animate-pulse"></div>
                <div className="h-8 bg-white/10 rounded-lg w-24 animate-pulse"></div>
                <div className="h-8 bg-white/10 rounded-lg w-24 animate-pulse"></div>
            </div>

            {/* Posts Skeleton */}
            <div className="space-y-6">
                {/* Post 1 */}
                <Card className="apple-liquid-card border border-white/20 shadow-2xl">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-white/10 rounded-full animate-pulse"></div>
                                <div>
                                    <div className="h-4 bg-white/10 rounded-lg w-32 mb-2 animate-pulse"></div>
                                    <div className="h-3 bg-white/10 rounded-lg w-48 animate-pulse"></div>
                                </div>
                            </div>
                            <div className="h-8 w-8 bg-white/10 rounded-lg animate-pulse"></div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 mb-4">
                            <div className="h-4 bg-white/10 rounded-lg w-full animate-pulse"></div>
                            <div className="h-4 bg-white/10 rounded-lg w-3/4 animate-pulse"></div>
                            <div className="h-4 bg-white/10 rounded-lg w-1/2 animate-pulse"></div>
                        </div>
                        
                        <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
                            <div className="h-5 bg-white/10 rounded-lg w-48 mb-2 animate-pulse"></div>
                            <div className="h-3 bg-white/10 rounded-lg w-full mb-3 animate-pulse"></div>
                            <div className="flex items-center gap-2">
                                <div className="h-6 bg-white/10 rounded-lg w-16 animate-pulse"></div>
                                <div className="h-6 bg-white/10 rounded-lg w-20 animate-pulse"></div>
                                <div className="h-6 bg-white/10 rounded-lg w-16 animate-pulse"></div>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-8 bg-white/10 rounded-lg w-16 animate-pulse"></div>
                                <div className="h-8 bg-white/10 rounded-lg w-16 animate-pulse"></div>
                                <div className="h-8 bg-white/10 rounded-lg w-20 animate-pulse"></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Post 2 */}
                <Card className="apple-liquid-card border border-white/20 shadow-2xl">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-white/10 rounded-full animate-pulse"></div>
                                <div>
                                    <div className="h-4 bg-white/10 rounded-lg w-28 mb-2 animate-pulse"></div>
                                    <div className="h-3 bg-white/10 rounded-lg w-40 animate-pulse"></div>
                                </div>
                            </div>
                            <div className="h-8 w-8 bg-white/10 rounded-lg animate-pulse"></div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 mb-4">
                            <div className="h-4 bg-white/10 rounded-lg w-full animate-pulse"></div>
                            <div className="h-4 bg-white/10 rounded-lg w-5/6 animate-pulse"></div>
                            <div className="h-4 bg-white/10 rounded-lg w-2/3 animate-pulse"></div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-8 bg-white/10 rounded-lg w-16 animate-pulse"></div>
                                <div className="h-8 bg-white/10 rounded-lg w-16 animate-pulse"></div>
                                <div className="h-8 bg-white/10 rounded-lg w-20 animate-pulse"></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Post 3 */}
                <Card className="apple-liquid-card border border-white/20 shadow-2xl">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-white/10 rounded-full animate-pulse"></div>
                                <div>
                                    <div className="h-4 bg-white/10 rounded-lg w-36 mb-2 animate-pulse"></div>
                                    <div className="h-3 bg-white/10 rounded-lg w-44 animate-pulse"></div>
                                </div>
                            </div>
                            <div className="h-8 w-8 bg-white/10 rounded-lg animate-pulse"></div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 mb-4">
                            <div className="h-4 bg-white/10 rounded-lg w-full animate-pulse"></div>
                            <div className="h-4 bg-white/10 rounded-lg w-4/5 animate-pulse"></div>
                            <div className="h-4 bg-white/10 rounded-lg w-3/4 animate-pulse"></div>
                        </div>
                        
                        <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
                            <div className="h-5 bg-white/10 rounded-lg w-52 mb-2 animate-pulse"></div>
                            <div className="h-3 bg-white/10 rounded-lg w-full mb-3 animate-pulse"></div>
                            <div className="flex items-center gap-2">
                                <div className="h-6 bg-white/10 rounded-lg w-18 animate-pulse"></div>
                                <div className="h-6 bg-white/10 rounded-lg w-24 animate-pulse"></div>
                                <div className="h-6 bg-white/10 rounded-lg w-20 animate-pulse"></div>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-8 bg-white/10 rounded-lg w-16 animate-pulse"></div>
                                <div className="h-8 bg-white/10 rounded-lg w-16 animate-pulse"></div>
                                <div className="h-8 bg-white/10 rounded-lg w-20 animate-pulse"></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

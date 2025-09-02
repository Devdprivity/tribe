import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function CreatePostSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center gap-4">
                <div className="h-8 bg-white/10 rounded-lg w-20 animate-pulse"></div>
                <div>
                    <div className="h-8 bg-white/10 rounded-lg w-32 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-white/10 rounded-lg w-64 animate-pulse"></div>
                </div>
            </div>

            {/* Formulario Skeleton */}
            <Card className="apple-liquid-card border border-white/20 shadow-2xl">
                <CardHeader className="pb-4">
                    <div className="h-6 bg-white/10 rounded-lg w-24 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-white/10 rounded-lg w-80 animate-pulse"></div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Tipo de contenido */}
                    <div className="space-y-3">
                        <div className="h-4 bg-white/10 rounded-lg w-32 animate-pulse"></div>
                        <div className="h-10 bg-white/10 rounded-lg w-full animate-pulse"></div>
                    </div>

                    {/* Contenido */}
                    <div className="space-y-3">
                        <div className="h-4 bg-white/10 rounded-lg w-20 animate-pulse"></div>
                        <div className="h-48 bg-white/10 rounded-lg w-full animate-pulse"></div>
                    </div>

                    {/* Etiquetas */}
                    <div className="space-y-3">
                        <div className="h-4 bg-white/10 rounded-lg w-16 animate-pulse"></div>
                        <div className="h-10 bg-white/10 rounded-lg w-full animate-pulse"></div>
                        <div className="h-3 bg-white/10 rounded-lg w-48 animate-pulse"></div>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-3 pt-4">
                        <div className="h-10 bg-white/10 rounded-xl w-20 animate-pulse"></div>
                        <div className="h-10 bg-white/10 rounded-xl w-32 animate-pulse"></div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

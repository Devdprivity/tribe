import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Github, Globe, Star, GitFork, Eye } from 'lucide-react';

interface ProjectShowcaseProps {
    title: string;
    description: string;
    image: string;
    technologies: string[];
    githubUrl?: string;
    liveUrl?: string;
    stats?: {
        stars?: number;
        forks?: number;
        watchers?: number;
    };
    features?: string[];
}

const techColors: { [key: string]: string } = {
    react: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    vue: 'bg-green-500/20 text-green-300 border-green-400/30',
    angular: 'bg-red-500/20 text-red-300 border-red-400/30',
    laravel: 'bg-red-500/20 text-red-300 border-red-400/30',
    nodejs: 'bg-green-500/20 text-green-300 border-green-400/30',
    python: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
    javascript: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
    typescript: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    php: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
    mysql: 'bg-orange-500/20 text-orange-300 border-orange-400/30',
    postgresql: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    mongodb: 'bg-green-500/20 text-green-300 border-green-400/30',
    docker: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    aws: 'bg-orange-500/20 text-orange-300 border-orange-400/30',
    tailwind: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
};

export default function ProjectShowcase({
    title,
    description,
    image,
    technologies,
    githubUrl,
    liveUrl,
    stats,
    features
}: ProjectShowcaseProps) {
    const [imageError, setImageError] = useState(false);

    const getTechColor = (tech: string) => {
        return techColors[tech.toLowerCase()] || 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    };

    return (
        <Card className="apple-liquid-card border border-white/20 overflow-hidden">
            <CardContent className="p-0">
                {/* Project Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                    {!imageError && image ? (
                        <img
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Github className="h-8 w-8 text-white/50" />
                                </div>
                                <p className="text-white/50 text-sm">Sin imagen</p>
                            </div>
                        </div>
                    )}
                    
                    {/* Overlay with stats */}
                    {stats && (
                        <div className="absolute top-3 right-3 flex gap-2">
                            {stats.stars && (
                                <Badge className="bg-black/50 text-white border-white/20">
                                    <Star className="h-3 w-3 mr-1" />
                                    {stats.stars}
                                </Badge>
                            )}
                            {stats.forks && (
                                <Badge className="bg-black/50 text-white border-white/20">
                                    <GitFork className="h-3 w-3 mr-1" />
                                    {stats.forks}
                                </Badge>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 space-y-4">
                    {/* Title and Description */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                        <p className="text-white/80 text-sm leading-relaxed">{description}</p>
                    </div>

                    {/* Technologies */}
                    <div>
                        <h4 className="text-white/70 text-xs font-semibold mb-2 uppercase tracking-wide">
                            Tecnologías
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {technologies.map((tech, index) => (
                                <Badge
                                    key={index}
                                    className={`${getTechColor(tech)} text-xs`}
                                >
                                    {tech}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Features */}
                    {features && features.length > 0 && (
                        <div>
                            <h4 className="text-white/70 text-xs font-semibold mb-2 uppercase tracking-wide">
                                Características
                            </h4>
                            <ul className="space-y-1">
                                {features.map((feature, index) => (
                                    <li key={index} className="text-white/70 text-sm flex items-center">
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                        {githubUrl && (
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"
                            >
                                <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                                    <Github className="h-4 w-4 mr-2" />
                                    Código
                                </a>
                            </Button>
                        )}
                        
                        {liveUrl && (
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"
                            >
                                <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                                    <Globe className="h-4 w-4 mr-2" />
                                    Demo
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Eye, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface TechTutorialProps {
    title: string;
    content: string;
    readTime: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    tags: string[];
    sections?: {
        title: string;
        content: string;
        code?: string;
        language?: string;
    }[];
    images?: string[];
}

const difficultyColors = {
    beginner: 'bg-green-500/20 text-green-300 border-green-400/30',
    intermediate: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
    advanced: 'bg-red-500/20 text-red-300 border-red-400/30',
};

export default function TechTutorial({
    title,
    content,
    readTime,
    difficulty,
    tags,
    sections = [],
    images = []
}: TechTutorialProps) {
    const [expandedSections, setExpandedSections] = useState<number[]>([]);

    const toggleSection = (index: number) => {
        setExpandedSections(prev => 
            prev.includes(index) 
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const renderMarkdownContent = (text: string) => {
        // Simple markdown rendering - en un proyecto real usarías una librería como react-markdown
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="text-white/90 italic">$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-white/10 text-blue-300 px-1 py-0.5 rounded text-sm">$1</code>')
            .replace(/\n\n/g, '</p><p class="text-white/80 text-sm leading-relaxed mb-3">')
            .replace(/\n/g, '<br />');
    };

    return (
        <Card className="apple-liquid-card border border-white/20">
            <CardContent className="p-6 space-y-6">
                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h2 className="text-white font-bold text-xl mb-2">{title}</h2>
                            <div className="flex items-center gap-4 text-sm text-white/70">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{readTime} min lectura</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <BookOpen className="h-4 w-4" />
                                    <span>Tutorial</span>
                                </div>
                            </div>
                        </div>
                        
                        <Badge className={`${difficultyColors[difficulty]} text-xs`}>
                            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </Badge>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                            <Badge
                                key={index}
                                variant="outline"
                                className="bg-white/10 text-white/80 border-white/20 text-xs"
                            >
                                #{tag}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="prose prose-invert max-w-none">
                    <div 
                        className="text-white/80 text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ 
                            __html: `<p class="text-white/80 text-sm leading-relaxed mb-3">${renderMarkdownContent(content)}</p>` 
                        }}
                    />
                </div>

                {/* Images */}
                {images.length > 0 && (
                    <div className="space-y-3">
                        {images.map((image, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={image}
                                    alt={`Tutorial image ${index + 1}`}
                                    className="w-full rounded-lg border border-white/20"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Sections */}
                {sections.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-white font-semibold text-lg">Secciones del Tutorial</h3>
                        {sections.map((section, index) => (
                            <div key={index} className="border border-white/10 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => toggleSection(index)}
                                    className="w-full p-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                                >
                                    <h4 className="text-white font-medium">{section.title}</h4>
                                    {expandedSections.includes(index) ? (
                                        <ChevronUp className="h-4 w-4 text-white/70" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4 text-white/70" />
                                    )}
                                </button>
                                
                                {expandedSections.includes(index) && (
                                    <div className="p-4 border-t border-white/10 space-y-3">
                                        <div 
                                            className="text-white/80 text-sm leading-relaxed"
                                            dangerouslySetInnerHTML={{ 
                                                __html: `<p class="text-white/80 text-sm leading-relaxed mb-3">${renderMarkdownContent(section.content)}</p>` 
                                            }}
                                        />
                                        
                                        {section.code && (
                                            <div className="bg-black/40 p-4 rounded-lg border border-white/20">
                                                <div className="flex items-center justify-between mb-2">
                                                    {section.language && (
                                                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-xs">
                                                            {section.language.toUpperCase()}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <pre className="text-sm overflow-x-auto">
                                                    <code className={`language-${section.language || 'text'}`}>
                                                        {section.code}
                                                    </code>
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Heart,
    MessageCircle,
    Share2,
    MoreHorizontal,
    Plus
} from 'lucide-react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import PostCard from '@/components/post-card';
import TimelineSkeleton from '@/components/timeline-skeleton';
import StoriesCarousel from '@/components/stories-carousel';
import CreateStoryModal from '@/components/create-story-modal';
import IslaDinamic from '@/components/isla-dinamic';
import DemoPosts from '@/components/demo-posts';
import { useState, useEffect } from 'react';
import { useCreatePost } from '@/contexts/create-post-context';

interface Post {
    id: number;
    content: string;
    type: 'text' | 'image' | 'video' | 'code' | 'project';
    code_language?: string;
    media_urls?: string[];
    likes_count: number;
    fire_count: number;
    idea_count: number;
    bug_count: number;
    sparkle_count: number;
    comments_count: number;
    shares_count: number;
    views_count?: number;
    is_pinned: boolean;
    is_bookmarked?: boolean;
    created_at: string;
    user: {
        id: number;
        username: string;
        full_name: string;
        avatar?: string;
        level: 'junior' | 'mid' | 'senior' | 'lead';
        is_open_to_work: boolean;
    };
    hashtags?: string[];
    user_reaction?: string | null;
}

interface User {
    id: number;
    username: string;
    full_name: string;
    avatar?: string;
    level: 'junior' | 'mid' | 'senior' | 'lead';
    is_open_to_work: boolean;
}

interface Props {
    posts: {
        data: Post[];
        links: any;
        meta: any;
    };
    filters: any;
}

export default function Timeline({ posts, filters }: Props) {
    const { auth } = usePage().props as any;
    const currentUser = auth.user as User;
    const [showCreateStoryModal, setShowCreateStoryModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { openCreatePostModal } = useCreatePost();

    useEffect(() => {
        // Simular carga de datos
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    const handleCreateStory = () => {
        setShowCreateStoryModal(true);
    };

    const handleStoryCreated = () => {
        // Refrescar las historias
        window.location.reload();
    };

    return (
        <AuthenticatedLayout title="Timeline" description="Tu feed personal de contenido">
            <Head title="Timeline" />

            {isLoading ? (
                <TimelineSkeleton />
            ) : (
                <div className="max-w-2xl mx-auto px-4">
                    <div className="space-y-6">
                        {/* Isla Dinámica y Botón Create Post - Centrados horizontalmente */}
                        <div className="flex items-center justify-center gap-2">
                            <IslaDinamic 
                                onFilterChange={(filter) => console.log('Filter:', filter)}
                            />
                            <Button
                                onClick={openCreatePostModal}
                                className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25 rounded-full w-10 h-10 apple-liquid-button -translate-y-2"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Carousel de Historias */}
                        <StoriesCarousel onCreateStory={handleCreateStory} />

                        {/* Posts */}
                        <div className="space-y-6">
                            {posts.data.length > 0 ? (
                                posts.data.map((post) => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        currentUser={currentUser}
                                    />
                                ))
                            ) : (
                                <>
                                    {/* Mostrar posts de demostración */}
                                    <DemoPosts currentUser={currentUser} />
                                    
                                    <Card className="apple-liquid-card border border-white/20">
                                        <CardContent className="pt-6 text-center">
                                            <div className="text-white/50 text-lg mb-4">¡Crea tu primer post!</div>
                                            <p className="text-white/30">Usa el botón + para crear contenido especializado</p>
                                        </CardContent>
                                    </Card>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para crear historia */}
            <CreateStoryModal
                isOpen={showCreateStoryModal}
                onClose={() => setShowCreateStoryModal(false)}
                currentUser={currentUser}
                onStoryCreated={handleStoryCreated}
            />
        </AuthenticatedLayout>
    );
}
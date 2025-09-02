import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Bookmark,
    Search,
    Filter,
    User,
    Calendar,
    Hash,
    Code2,
    FileImage,
    Link as LinkIcon
} from 'lucide-react';
import PostCard from '@/components/post-card';
import BookmarksSkeleton from '@/components/bookmarks-skeleton';

interface User {
    id: number;
    username: string;
    full_name: string;
    avatar?: string;
}

interface Post {
    id: number;
    content: string;
    type: 'text' | 'code' | 'project' | 'link';
    hashtags: string[];
    likes_count: number;
    comments_count: number;
    created_at: string;
    user: User;
    is_liked: boolean;
    is_bookmarked: boolean;
}

interface Props {
    bookmarkedPosts: Post[];
    bookmarkedJobs: any[];
    bookmarkedUsers: User[];
}

export default function Bookmarks({ bookmarkedPosts, bookmarkedJobs, bookmarkedUsers }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('posts');
    const [filterType, setFilterType] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000); // Simulate API call
        return () => clearTimeout(timer);
    }, []);

    const filteredPosts = bookmarkedPosts.filter(post => {
        const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            post.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            post.hashtags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesFilter = filterType === 'all' || post.type === filterType;

        return matchesSearch && matchesFilter;
    });

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'code': return <Code2 className="h-4 w-4" />;
            case 'project': return <FileImage className="h-4 w-4" />;
            case 'link': return <LinkIcon className="h-4 w-4" />;
            default: return <Hash className="h-4 w-4" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'code': return 'Código';
            case 'project': return 'Proyecto';
            case 'link': return 'Enlace';
            default: return 'Texto';
        }
    };

    return (
        <AppLayout title="Favoritos" description="Tus posts, trabajos y usuarios guardados">
            <Head title="Favoritos" />

            {loading ? (
                <BookmarksSkeleton />
            ) : (
                <div className="w-full">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Bookmark className="h-8 w-8 text-blue-400" />
                            <h1 className="text-3xl font-bold text-white">Favoritos</h1>
                        </div>
                        <p className="text-white/70">
                            Tus posts, trabajos y usuarios guardados
                        </p>
                    </div>

                    {/* Buscador */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-4 w-4" />
                            <Input
                                placeholder="Buscar en favoritos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                        <TabsList className="bg-white/5 border border-white/20">
                            <TabsTrigger value="posts" className="text-white data-[state=active]:bg-white/10">
                                Posts ({bookmarkedPosts.length})
                            </TabsTrigger>
                            <TabsTrigger value="jobs" className="text-white data-[state=active]:bg-white/10">
                                Trabajos ({bookmarkedJobs.length})
                            </TabsTrigger>
                            <TabsTrigger value="users" className="text-white data-[state=active]:bg-white/10">
                                Usuarios ({bookmarkedUsers.length})
                            </TabsTrigger>
                        </TabsList>

                        {/* Filtros para Posts */}
                        {activeTab === 'posts' && (
                            <div className="mt-4">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge 
                                        variant={filterType === 'all' ? "default" : "outline"}
                                        className={filterType === 'all' ? "bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25" : "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"}
                                        onClick={() => setFilterType('all')}
                                    >
                                        Todos
                                    </Badge>
                                    <Badge 
                                        variant={filterType === 'text' ? "default" : "outline"}
                                        className={filterType === 'text' ? "bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25" : "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"}
                                        onClick={() => setFilterType('text')}
                                    >
                                        {getTypeIcon('text')}
                                        {getTypeLabel('text')}
                                    </Badge>
                                    <Badge 
                                        variant={filterType === 'code' ? "default" : "outline"}
                                        className={filterType === 'code' ? "bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25" : "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"}
                                        onClick={() => setFilterType('code')}
                                    >
                                        {getTypeIcon('code')}
                                        {getTypeLabel('code')}
                                    </Badge>
                                    <Badge 
                                        variant={filterType === 'project' ? "default" : "outline"}
                                        className={filterType === 'project' ? "bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25" : "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"}
                                        onClick={() => setFilterType('project')}
                                    >
                                        {getTypeIcon('project')}
                                        {getTypeLabel('project')}
                                    </Badge>
                                    <Badge 
                                        variant={filterType === 'link' ? "default" : "outline"}
                                        className={filterType === 'link' ? "bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25" : "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"}
                                        onClick={() => setFilterType('link')}
                                    >
                                        {getTypeIcon('link')}
                                        {getTypeLabel('link')}
                                    </Badge>
                                </div>
                            </div>
                        )}

                        {/* Contenido de Posts */}
                        <TabsContent value="posts" className="space-y-4">
                            {filteredPosts.length > 0 ? (
                                filteredPosts.map((post) => (
                                    <PostCard key={post.id} post={post as any} />
                                ))
                            ) : (
                                <Card className="apple-liquid-card">
                                    <CardContent className="text-center py-12">
                                        <Bookmark className="h-12 w-12 mx-auto mb-4 text-white/70" />
                                        <h3 className="text-lg font-medium mb-2 text-white">
                                            {searchTerm
                                                ? 'No se encontraron posts'
                                                : 'No tienes posts guardados'
                                            }
                                        </h3>
                                        <p className="text-white/70 mb-4">
                                            {searchTerm
                                                ? 'Intenta con otros términos de búsqueda.'
                                                : 'Guarda posts que te interesen para encontrarlos fácilmente.'
                                            }
                                        </p>
                                        {!searchTerm && (
                                            <Button asChild className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25 rounded-xl apple-liquid-button">
                                                <a href="/posts">Explorar posts</a>
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Contenido de Trabajos */}
                        <TabsContent value="jobs" className="space-y-4">
                            {bookmarkedJobs.length > 0 ? (
                                bookmarkedJobs.map((job) => (
                                    <Card key={job.id} className="hover:shadow-md transition-shadow apple-liquid-card">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg mb-2 text-white">{job.title}</h3>
                                                    <p className="text-white/70 mb-3">{job.company_name}</p>
                                                    <div className="flex items-center gap-4 text-sm text-white/70">
                                                        <span>{job.location}</span>
                                                        {job.remote_friendly && (
                                                            <Badge variant="outline" className="bg-white/10 text-white border-white/20">Remoto</Badge>
                                                        )}
                                                        <span>{job.salary_range}</span>
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 rounded-lg apple-liquid-button">
                                                    Ver detalles
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <Card className="apple-liquid-card">
                                    <CardContent className="text-center py-12">
                                        <Calendar className="h-12 w-12 mx-auto mb-4 text-white/70" />
                                        <h3 className="text-lg font-medium mb-2 text-white">No tienes trabajos guardados</h3>
                                        <p className="text-white/70 mb-4">
                                            Guarda ofertas de trabajo que te interesen.
                                        </p>
                                        <Button asChild className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25 rounded-xl apple-liquid-button">
                                            <a href="/jobs">Explorar trabajos</a>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Contenido de Usuarios */}
                        <TabsContent value="users" className="space-y-4">
                            {bookmarkedUsers.length > 0 ? (
                                bookmarkedUsers.map((user) => (
                                    <Card key={user.id} className="hover:shadow-md transition-shadow apple-liquid-card">
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold ring-2 ring-white/20">
                                                    {user.full_name.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-white">{user.full_name}</h3>
                                                    <p className="text-white/70">@{user.username}</p>
                                                </div>
                                                <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 rounded-lg apple-liquid-button">
                                                    Ver perfil
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <Card className="apple-liquid-card">
                                    <CardContent className="text-center py-12">
                                        <User className="h-12 w-12 mx-auto mb-4 text-white/70" />
                                        <h3 className="text-lg font-medium mb-2 text-white">No tienes usuarios guardados</h3>
                                        <p className="text-white/70 mb-4">
                                            Guarda perfiles de desarrolladores que te interesen.
                                        </p>
                                        <Button asChild className="bg-blue-500/80 hover:bg-blue-500 text-white border-blue-400/50 shadow-lg shadow-blue-500/25 rounded-xl apple-liquid-button">
                                            <a href="/users">Explorar usuarios</a>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </AppLayout>
    );
}
